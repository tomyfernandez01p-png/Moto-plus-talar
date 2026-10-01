-- Moto Plus Talar — esquema inicial
-- Modelo relacional central. Nada de productos/precios/stock/categorías/marcas
-- /pedidos/clientes/banners/config se hardcodea en el frontend: todo vive acá.

-- ============================================================
-- EXTENSIONES
-- ============================================================
create extension if not exists pgcrypto;

-- ============================================================
-- ENUMS
-- ============================================================
create type rol_usuario as enum ('administrador','empleado','cliente');
create type estado_stock as enum ('disponible','ultimas_unidades','sin_stock','consultar');
create type estado_pedido as enum ('nuevo','pago_pendiente','pago_aprobado','confirmado','preparando','enviado','entregado','cancelado');
create type estado_pago as enum ('pendiente','aprobado','rechazado','cancelado','reembolsado');
create type tipo_entrega as enum ('envio','retiro_local');
create type metodo_pago as enum ('mercadopago','tarjeta','transferencia','efectivo');

-- ============================================================
-- PERFILES (extiende auth.users)
-- ============================================================
create table perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  apellido text,
  telefono text,
  dni_cuit text,
  rol rol_usuario not null default 'cliente',
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table perfiles is 'Perfil + rol de cada usuario. cliente = comprador; empleado/administrador = panel /admin.';

-- crea perfil automáticamente al registrarse
create function fn_crear_perfil() returns trigger as $$
begin
  insert into perfiles (id, nombre, rol) values (new.id, new.raw_user_meta_data->>'nombre', 'cliente');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger trg_crear_perfil
  after insert on auth.users
  for each row execute function fn_crear_perfil();

-- ============================================================
-- CATEGORÍAS (con subcategorías vía categoria_padre_id)
-- ============================================================
create table categorias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  imagen_url text,
  categoria_padre_id uuid references categorias(id) on delete set null,
  orden int not null default 0,
  activo boolean not null default true,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_categorias_padre on categorias(categoria_padre_id);
create index idx_categorias_slug on categorias(slug);

-- ============================================================
-- MARCAS
-- ============================================================
create table marcas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  slug text not null unique,
  logo_url text,
  descripcion text,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_marcas_slug on marcas(slug);

-- ============================================================
-- MOTOS (catálogo de referencia para "¿Qué moto tenés?")
-- ============================================================
create table motos (
  id uuid primary key default gen_random_uuid(),
  marca text not null,
  modelo text not null,
  anio_desde int,
  anio_hasta int,
  cilindrada int,
  activo boolean not null default true,
  created_at timestamptz not null default now()
);
create index idx_motos_marca_modelo on motos(marca, modelo);

-- ============================================================
-- PRODUCTOS
-- ============================================================
create table productos (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  codigo text not null,
  codigo_alternativo text,
  nombre text not null,
  slug text not null unique,
  categoria_id uuid references categorias(id) on delete set null,
  subcategoria_id uuid references categorias(id) on delete set null,
  marca_id uuid references marcas(id) on delete set null,

  precio numeric(12,2) not null check (precio >= 0),
  precio_anterior numeric(12,2) check (precio_anterior is null or precio_anterior >= 0),
  precio_promocional numeric(12,2) check (precio_promocional is null or precio_promocional >= 0),
  oferta_desde timestamptz,
  oferta_hasta timestamptz,
  costo numeric(12,2), -- interno, nunca se expone al público

  stock int not null default 0 check (stock >= 0),
  stock_minimo int not null default 3 check (stock_minimo >= 0),
  estado_stock estado_stock generated always as (
    case
      when stock <= 0 then 'sin_stock'::estado_stock
      when stock <= stock_minimo then 'ultimas_unidades'::estado_stock
      else 'disponible'::estado_stock
    end
  ) stored,

  descripcion_corta text,
  descripcion_completa text,
  caracteristicas jsonb not null default '[]'::jsonb, -- [{label,value}]
  tags text[] not null default '{}',

  destacado boolean not null default false,
  activo boolean not null default true,

  imagen_principal_url text,

  seo_title text,
  seo_description text,

  fecha_alta timestamptz not null default now(),
  fecha_modificacion timestamptz not null default now(),
  creado_por uuid references perfiles(id),
  modificado_por uuid references perfiles(id)
);

create index idx_productos_categoria on productos(categoria_id);
create index idx_productos_marca on productos(marca_id);
create index idx_productos_slug on productos(slug);
create index idx_productos_activo on productos(activo);
create index idx_productos_destacado on productos(destacado) where destacado = true;
create index idx_productos_busqueda on productos using gin (
  to_tsvector('spanish', coalesce(nombre,'') || ' ' || coalesce(codigo,'') || ' ' || coalesce(codigo_alternativo,'') || ' ' || coalesce(descripcion_corta,''))
);
create index idx_productos_tags on productos using gin (tags);

create function fn_producto_touch() returns trigger as $$
begin
  new.fecha_modificacion := now();
  return new;
end;
$$ language plpgsql;

create trigger trg_producto_touch
  before update on productos
  for each row execute function fn_producto_touch();

-- historial de cambios de precio/stock (auditoría)
create table historial_cambios (
  id uuid primary key default gen_random_uuid(),
  tabla text not null,
  registro_id uuid not null,
  usuario_id uuid references perfiles(id),
  accion text not null,
  campo text,
  valor_anterior text,
  valor_nuevo text,
  created_at timestamptz not null default now()
);
create index idx_historial_registro on historial_cambios(tabla, registro_id);

create function fn_producto_historial() returns trigger as $$
begin
  if new.precio is distinct from old.precio then
    insert into historial_cambios(tabla, registro_id, usuario_id, accion, campo, valor_anterior, valor_nuevo)
    values ('productos', new.id, new.modificado_por, 'actualizar', 'precio', old.precio::text, new.precio::text);
  end if;
  if new.stock is distinct from old.stock then
    insert into historial_cambios(tabla, registro_id, usuario_id, accion, campo, valor_anterior, valor_nuevo)
    values ('productos', new.id, new.modificado_por, 'actualizar', 'stock', old.stock::text, new.stock::text);
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_producto_historial
  after update on productos
  for each row execute function fn_producto_historial();

-- ============================================================
-- IMÁGENES DE PRODUCTO
-- ============================================================
create table producto_imagenes (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  url text not null,
  alt_text text,
  orden int not null default 0,
  created_at timestamptz not null default now()
);
create index idx_producto_imagenes_producto on producto_imagenes(producto_id);

-- ============================================================
-- COMPATIBILIDAD PRODUCTO <-> MOTO
-- ============================================================
create table producto_compatibilidad (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid not null references productos(id) on delete cascade,
  moto_id uuid references motos(id) on delete set null,
  marca_moto text,
  modelo_moto text,
  anio_desde int,
  anio_hasta int,
  cilindrada int,
  created_at timestamptz not null default now()
);
create index idx_compat_producto on producto_compatibilidad(producto_id);
create index idx_compat_moto on producto_compatibilidad(moto_id);
create index idx_compat_marca_modelo on producto_compatibilidad(marca_moto, modelo_moto);

-- ============================================================
-- DIRECCIONES DE CLIENTES
-- ============================================================
create table direcciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references perfiles(id) on delete cascade,
  nombre text,
  direccion text not null,
  ciudad text not null,
  provincia text not null,
  codigo_postal text,
  telefono text,
  predeterminada boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_direcciones_usuario on direcciones(usuario_id);

-- ============================================================
-- FAVORITOS (invitado por session_id o usuario logueado)
-- ============================================================
create table favoritos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id) on delete cascade,
  session_id text,
  producto_id uuid not null references productos(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint uq_favorito_usuario unique (usuario_id, producto_id),
  constraint uq_favorito_session unique (session_id, producto_id),
  constraint chk_favorito_owner check (usuario_id is not null or session_id is not null)
);

-- ============================================================
-- PEDIDOS
-- ============================================================
create table pedidos (
  id uuid primary key default gen_random_uuid(),
  numero bigserial unique,
  usuario_id uuid references perfiles(id),
  nombre text not null,
  apellido text not null,
  email text not null,
  telefono text not null,
  dni_cuit text,
  tipo_entrega tipo_entrega not null,
  direccion_envio jsonb,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  costo_envio numeric(12,2) not null default 0 check (costo_envio >= 0),
  descuento numeric(12,2) not null default 0 check (descuento >= 0),
  total numeric(12,2) not null check (total >= 0),
  estado estado_pedido not null default 'nuevo',
  metodo_pago metodo_pago,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_pedidos_usuario on pedidos(usuario_id);
create index idx_pedidos_estado on pedidos(estado);
create index idx_pedidos_email on pedidos(email);

create trigger trg_pedido_touch
  before update on pedidos
  for each row execute function fn_producto_touch();

create table pedido_items (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  producto_id uuid references productos(id) on delete set null,
  nombre_producto text not null,
  codigo text,
  precio_unitario numeric(12,2) not null,
  cantidad int not null check (cantidad > 0),
  subtotal numeric(12,2) not null
);
create index idx_pedido_items_pedido on pedido_items(pedido_id);

-- ============================================================
-- PAGOS
-- ============================================================
create table pagos (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  proveedor text not null default 'mercadopago',
  mp_payment_id text,
  mp_preference_id text,
  estado estado_pago not null default 'pendiente',
  monto numeric(12,2) not null,
  moneda text not null default 'ARS',
  raw_response jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_pagos_pedido on pagos(pedido_id);
create unique index idx_pagos_mp_payment_id on pagos(mp_payment_id) where mp_payment_id is not null;

create trigger trg_pago_touch
  before update on pagos
  for each row execute function fn_producto_touch();

-- ============================================================
-- BANNERS
-- ============================================================
create table banners (
  id uuid primary key default gen_random_uuid(),
  titulo text,
  descripcion text,
  imagen_url text not null,
  boton_texto text,
  boton_url text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  activo boolean not null default true,
  orden int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_banner_touch
  before update on banners
  for each row execute function fn_producto_touch();

-- ============================================================
-- CONFIGURACIÓN DEL NEGOCIO (fila única)
-- ============================================================
create table configuracion (
  id smallint primary key default 1,
  nombre_negocio text not null default 'Moto Plus Talar',
  rubro text,
  logo_url text,
  favicon_url text,
  email text,
  whatsapp text,
  whatsapp_link text,
  direccion text,
  ciudad text,
  provincia text,
  horarios jsonb not null default '{}'::jsonb,
  instagram_url text,
  facebook_url text,
  metodos_pago jsonb not null default '{}'::jsonb,
  metodos_envio jsonb not null default '{}'::jsonb,
  dias_nuevo int not null default 7,
  seo jsonb not null default '{}'::jsonb,
  google jsonb not null default '{}'::jsonb,
  mercadopago_public_key text,
  cookies_texto text,
  secciones_home jsonb not null default '{}'::jsonb,
  hero jsonb not null default '{}'::jsonb,
  anuncio_barra jsonb not null default '{}'::jsonb,
  cuentas_clientes_activas boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint chk_config_singleton check (id = 1)
);

create trigger trg_config_touch
  before update on configuracion
  for each row execute function fn_producto_touch();

-- ============================================================
-- LOGS DE ACCESO (auditoría de seguridad)
-- ============================================================
create table logs_acceso (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid references perfiles(id),
  email text,
  exito boolean not null,
  ip text,
  user_agent text,
  created_at timestamptz not null default now()
);
create index idx_logs_acceso_usuario on logs_acceso(usuario_id);
create index idx_logs_acceso_fecha on logs_acceso(created_at);

-- ============================================================
-- VISTA PÚBLICA DE PRODUCTOS (calcula oferta/nuevo/precio vigente)
-- ============================================================
create view vista_productos as
select
  p.*,
  c.nombre as categoria_nombre,
  c.slug as categoria_slug,
  m.nombre as marca_nombre,
  m.slug as marca_slug,
  (
    p.precio_promocional is not null
    and (p.oferta_desde is null or now() >= p.oferta_desde)
    and (p.oferta_hasta is null or now() <= p.oferta_hasta)
  ) as en_oferta,
  case
    when (
      p.precio_promocional is not null
      and (p.oferta_desde is null or now() >= p.oferta_desde)
      and (p.oferta_hasta is null or now() <= p.oferta_hasta)
    ) then p.precio_promocional
    else p.precio
  end as precio_vigente,
  (p.fecha_alta >= now() - ((select dias_nuevo from configuracion where id = 1) || ' days')::interval) as es_nuevo
from productos p
left join categorias c on c.id = p.categoria_id
left join marcas m on m.id = p.marca_id;

-- ============================================================
-- RPC: crear pedido (transaccional, valida y descuenta stock)
-- ============================================================
create or replace function crear_pedido(
  p_usuario_id uuid,
  p_nombre text,
  p_apellido text,
  p_email text,
  p_telefono text,
  p_dni_cuit text,
  p_tipo_entrega tipo_entrega,
  p_direccion_envio jsonb,
  p_costo_envio numeric,
  p_items jsonb -- [{producto_id, cantidad}]
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pedido_id uuid;
  v_item record;
  v_producto productos%rowtype;
  v_subtotal numeric := 0;
  v_precio numeric;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;

  -- valida stock de todos los items antes de descontar nada
  for v_item in select * from jsonb_to_recordset(p_items) as x(producto_id uuid, cantidad int)
  loop
    select * into v_producto from productos where id = v_item.producto_id and activo = true for update;
    if not found then
      raise exception 'Producto % no existe o no está activo', v_item.producto_id;
    end if;
    if v_producto.stock < v_item.cantidad then
      raise exception 'Sin stock suficiente para %', v_producto.nombre;
    end if;
  end loop;

  insert into pedidos (usuario_id, nombre, apellido, email, telefono, dni_cuit, tipo_entrega, direccion_envio, subtotal, costo_envio, total, estado)
  values (p_usuario_id, p_nombre, p_apellido, p_email, p_telefono, p_dni_cuit, p_tipo_entrega, p_direccion_envio, 0, coalesce(p_costo_envio,0), 0, 'nuevo')
  returning id into v_pedido_id;

  for v_item in select * from jsonb_to_recordset(p_items) as x(producto_id uuid, cantidad int)
  loop
    select * into v_producto from productos where id = v_item.producto_id;
    v_precio := case
      when v_producto.precio_promocional is not null
        and (v_producto.oferta_desde is null or now() >= v_producto.oferta_desde)
        and (v_producto.oferta_hasta is null or now() <= v_producto.oferta_hasta)
      then v_producto.precio_promocional
      else v_producto.precio
    end;

    insert into pedido_items (pedido_id, producto_id, nombre_producto, codigo, precio_unitario, cantidad, subtotal)
    values (v_pedido_id, v_producto.id, v_producto.nombre, v_producto.codigo, v_precio, v_item.cantidad, v_precio * v_item.cantidad);

    update productos set stock = stock - v_item.cantidad where id = v_producto.id;

    v_subtotal := v_subtotal + (v_precio * v_item.cantidad);
  end loop;

  update pedidos
  set subtotal = v_subtotal, total = v_subtotal + coalesce(p_costo_envio,0)
  where id = v_pedido_id;

  return v_pedido_id;
end;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table perfiles enable row level security;
alter table categorias enable row level security;
alter table marcas enable row level security;
alter table motos enable row level security;
alter table productos enable row level security;
alter table producto_imagenes enable row level security;
alter table producto_compatibilidad enable row level security;
alter table direcciones enable row level security;
alter table favoritos enable row level security;
alter table pedidos enable row level security;
alter table pedido_items enable row level security;
alter table pagos enable row level security;
alter table banners enable row level security;
alter table configuracion enable row level security;
alter table historial_cambios enable row level security;
alter table logs_acceso enable row level security;

-- helper: es admin o empleado
create function fn_es_staff(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles where id = uid and rol in ('administrador','empleado') and activo = true
  );
$$;

create function fn_es_admin(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles where id = uid and rol = 'administrador' and activo = true
  );
$$;

-- perfiles: cada quien lee/edita el suyo; staff lee todos
create policy perfiles_select_propio on perfiles for select using (id = auth.uid() or fn_es_staff(auth.uid()));
create policy perfiles_update_propio on perfiles for update using (id = auth.uid() or fn_es_admin(auth.uid()));

-- catálogo: lectura pública de lo activo; escritura solo staff
create policy categorias_lectura_publica on categorias for select using (activo = true or fn_es_staff(auth.uid()));
create policy categorias_escritura_staff on categorias for insert with check (fn_es_staff(auth.uid()));
create policy categorias_actualiza_staff on categorias for update using (fn_es_staff(auth.uid()));
create policy categorias_borra_staff on categorias for delete using (fn_es_admin(auth.uid()));

create policy marcas_lectura_publica on marcas for select using (activo = true or fn_es_staff(auth.uid()));
create policy marcas_escritura_staff on marcas for insert with check (fn_es_staff(auth.uid()));
create policy marcas_actualiza_staff on marcas for update using (fn_es_staff(auth.uid()));
create policy marcas_borra_staff on marcas for delete using (fn_es_admin(auth.uid()));

create policy motos_lectura_publica on motos for select using (activo = true or fn_es_staff(auth.uid()));
create policy motos_escritura_staff on motos for insert with check (fn_es_staff(auth.uid()));
create policy motos_actualiza_staff on motos for update using (fn_es_staff(auth.uid()));
create policy motos_borra_staff on motos for delete using (fn_es_admin(auth.uid()));

create policy productos_lectura_publica on productos for select using (activo = true or fn_es_staff(auth.uid()));
create policy productos_escritura_staff on productos for insert with check (fn_es_staff(auth.uid()));
create policy productos_actualiza_staff on productos for update using (fn_es_staff(auth.uid()));
create policy productos_borra_admin on productos for delete using (fn_es_admin(auth.uid()));

create policy producto_imagenes_lectura_publica on producto_imagenes for select using (true);
create policy producto_imagenes_escritura_staff on producto_imagenes for all using (fn_es_staff(auth.uid())) with check (fn_es_staff(auth.uid()));

create policy compat_lectura_publica on producto_compatibilidad for select using (true);
create policy compat_escritura_staff on producto_compatibilidad for all using (fn_es_staff(auth.uid())) with check (fn_es_staff(auth.uid()));

-- direcciones/favoritos: dueño únicamente (favoritos de invitado se filtran en la app por session_id con la anon key, sin dato sensible)
create policy direcciones_propio on direcciones for all using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
create policy favoritos_propio on favoritos for all using (usuario_id = auth.uid() or usuario_id is null) with check (usuario_id = auth.uid() or usuario_id is null);

-- pedidos: dueño o staff leen; nadie inserta directo (se usa la función crear_pedido); staff actualiza estado
create policy pedidos_lectura_propia on pedidos for select using (usuario_id = auth.uid() or fn_es_staff(auth.uid()));
create policy pedidos_actualiza_staff on pedidos for update using (fn_es_staff(auth.uid()));

create policy pedido_items_lectura on pedido_items for select using (
  exists (select 1 from pedidos pe where pe.id = pedido_id and (pe.usuario_id = auth.uid() or fn_es_staff(auth.uid())))
);

create policy pagos_lectura_staff on pagos for select using (
  fn_es_staff(auth.uid()) or exists (select 1 from pedidos pe where pe.id = pedido_id and pe.usuario_id = auth.uid())
);

-- banners/config: lectura pública, escritura staff/admin
create policy banners_lectura_publica on banners for select using (activo = true or fn_es_staff(auth.uid()));
create policy banners_escritura_staff on banners for all using (fn_es_staff(auth.uid())) with check (fn_es_staff(auth.uid()));

create policy configuracion_lectura_publica on configuracion for select using (true);
create policy configuracion_escritura_admin on configuracion for update using (fn_es_admin(auth.uid()));

create policy historial_lectura_staff on historial_cambios for select using (fn_es_staff(auth.uid()));
create policy logs_lectura_admin on logs_acceso for select using (fn_es_admin(auth.uid()));

-- fila inicial de configuración (placeholders — el admin la completa desde /admin/configuracion)
insert into configuracion (id, nombre_negocio) values (1, 'Moto Plus Talar')
on conflict (id) do nothing;
