-- Hardening a partir de los advisors de seguridad:
-- 1) vista_productos exponía `costo` (interno) y corría sin respetar RLS.
-- 2) funciones sin search_path fijo.
-- 3) funciones de rol (fn_es_staff/fn_es_admin) movidas a un schema no expuesto por PostgREST.
-- 4) fn_crear_perfil no debe ser invocable directo vía RPC.

create schema if not exists app_private;

-- --- mover fn_es_staff / fn_es_admin a app_private ---
drop policy if exists perfiles_select_propio on perfiles;
drop policy if exists perfiles_update_propio on perfiles;
drop policy if exists categorias_lectura_publica on categorias;
drop policy if exists categorias_escritura_staff on categorias;
drop policy if exists categorias_actualiza_staff on categorias;
drop policy if exists categorias_borra_staff on categorias;
drop policy if exists marcas_lectura_publica on marcas;
drop policy if exists marcas_escritura_staff on marcas;
drop policy if exists marcas_actualiza_staff on marcas;
drop policy if exists marcas_borra_staff on marcas;
drop policy if exists motos_lectura_publica on motos;
drop policy if exists motos_escritura_staff on motos;
drop policy if exists motos_actualiza_staff on motos;
drop policy if exists motos_borra_staff on motos;
drop policy if exists productos_lectura_publica on productos;
drop policy if exists productos_escritura_staff on productos;
drop policy if exists productos_actualiza_staff on productos;
drop policy if exists productos_borra_admin on productos;
drop policy if exists producto_imagenes_escritura_staff on producto_imagenes;
drop policy if exists compat_escritura_staff on producto_compatibilidad;
drop policy if exists pedidos_lectura_propia on pedidos;
drop policy if exists pedidos_actualiza_staff on pedidos;
drop policy if exists pedido_items_lectura on pedido_items;
drop policy if exists pagos_lectura_staff on pagos;
drop policy if exists banners_lectura_publica on banners;
drop policy if exists banners_escritura_staff on banners;
drop policy if exists configuracion_escritura_admin on configuracion;
drop policy if exists historial_lectura_staff on historial_cambios;
drop policy if exists logs_lectura_admin on logs_acceso;

drop function if exists public.fn_es_staff(uuid);
drop function if exists public.fn_es_admin(uuid);

create function app_private.fn_es_staff(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles where id = uid and rol in ('administrador','empleado') and activo = true
  );
$$;

create function app_private.fn_es_admin(uid uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from perfiles where id = uid and rol = 'administrador' and activo = true
  );
$$;

-- recrear políticas contra app_private.*
create policy perfiles_select_propio on perfiles for select using (id = auth.uid() or app_private.fn_es_staff(auth.uid()));
create policy perfiles_update_propio on perfiles for update using (id = auth.uid() or app_private.fn_es_admin(auth.uid()));

create policy categorias_lectura_publica on categorias for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy categorias_escritura_staff on categorias for insert with check (app_private.fn_es_staff(auth.uid()));
create policy categorias_actualiza_staff on categorias for update using (app_private.fn_es_staff(auth.uid()));
create policy categorias_borra_staff on categorias for delete using (app_private.fn_es_admin(auth.uid()));

create policy marcas_lectura_publica on marcas for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy marcas_escritura_staff on marcas for insert with check (app_private.fn_es_staff(auth.uid()));
create policy marcas_actualiza_staff on marcas for update using (app_private.fn_es_staff(auth.uid()));
create policy marcas_borra_staff on marcas for delete using (app_private.fn_es_admin(auth.uid()));

create policy motos_lectura_publica on motos for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy motos_escritura_staff on motos for insert with check (app_private.fn_es_staff(auth.uid()));
create policy motos_actualiza_staff on motos for update using (app_private.fn_es_staff(auth.uid()));
create policy motos_borra_staff on motos for delete using (app_private.fn_es_admin(auth.uid()));

create policy productos_lectura_publica on productos for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy productos_escritura_staff on productos for insert with check (app_private.fn_es_staff(auth.uid()));
create policy productos_actualiza_staff on productos for update using (app_private.fn_es_staff(auth.uid()));
create policy productos_borra_admin on productos for delete using (app_private.fn_es_admin(auth.uid()));

create policy producto_imagenes_escritura_staff on producto_imagenes for all using (app_private.fn_es_staff(auth.uid())) with check (app_private.fn_es_staff(auth.uid()));
create policy compat_escritura_staff on producto_compatibilidad for all using (app_private.fn_es_staff(auth.uid())) with check (app_private.fn_es_staff(auth.uid()));

create policy pedidos_lectura_propia on pedidos for select using (usuario_id = auth.uid() or app_private.fn_es_staff(auth.uid()));
create policy pedidos_actualiza_staff on pedidos for update using (app_private.fn_es_staff(auth.uid()));

create policy pedido_items_lectura on pedido_items for select using (
  exists (select 1 from pedidos pe where pe.id = pedido_id and (pe.usuario_id = auth.uid() or app_private.fn_es_staff(auth.uid())))
);

create policy pagos_lectura_staff on pagos for select using (
  app_private.fn_es_staff(auth.uid()) or exists (select 1 from pedidos pe where pe.id = pedido_id and pe.usuario_id = auth.uid())
);

create policy banners_lectura_publica on banners for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy banners_escritura_staff on banners for all using (app_private.fn_es_staff(auth.uid())) with check (app_private.fn_es_staff(auth.uid()));

create policy configuracion_escritura_admin on configuracion for update using (app_private.fn_es_admin(auth.uid()));

create policy historial_lectura_staff on historial_cambios for select using (app_private.fn_es_staff(auth.uid()));
create policy logs_lectura_admin on logs_acceso for select using (app_private.fn_es_admin(auth.uid()));

-- --- search_path fijo en triggers ---
create or replace function fn_producto_touch() returns trigger
language plpgsql set search_path = public as $$
begin
  new.fecha_modificacion := now();
  return new;
end;
$$;

create or replace function fn_producto_historial() returns trigger
language plpgsql set search_path = public as $$
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
$$;

-- --- fn_crear_perfil: solo la debe disparar el trigger, no RPC público ---
revoke execute on function fn_crear_perfil() from public, anon, authenticated;

-- --- vista_productos: security_invoker (respeta RLS) + sin columnas internas (costo, auditoría) ---
drop view if exists vista_productos;
create view vista_productos
with (security_invoker = true)
as
select
  p.id, p.sku, p.codigo, p.codigo_alternativo, p.nombre, p.slug,
  p.categoria_id, p.subcategoria_id, p.marca_id,
  p.precio, p.precio_anterior, p.precio_promocional, p.oferta_desde, p.oferta_hasta,
  p.stock, p.stock_minimo, p.estado_stock,
  p.descripcion_corta, p.descripcion_completa, p.caracteristicas, p.tags,
  p.destacado, p.activo, p.imagen_principal_url,
  p.seo_title, p.seo_description,
  p.fecha_alta, p.fecha_modificacion,
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

grant select on vista_productos to anon, authenticated;
