-- Endurecimiento de seguridad (auditoría 2026-10-10)
-- 1) crear_pedido: valida cantidades (1..9999, enteras), sin productos repetidos,
--    máximo de items, largos de texto, e impide suplantar a otro usuario.
-- 2) crear_solicitud_mecanica: impide suplantar a otro usuario y limita largos.
-- 3) Bucket public-assets: solo imágenes y máximo 5 MB.
-- 4) perfiles: se quitan permisos de escritura al rol anon (RLS ya los bloqueaba).

create or replace function public.crear_pedido(
  p_usuario_id uuid, p_nombre text, p_apellido text, p_email text, p_telefono text,
  p_dni_cuit text, p_tipo_entrega tipo_entrega, p_direccion_envio jsonb,
  p_costo_envio numeric, p_items jsonb, p_metodo_pago metodo_pago default null
) returns uuid
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_pedido_id uuid;
  v_item record;
  v_producto productos%rowtype;
  v_subtotal numeric := 0;
  v_precio numeric;
  v_metodos_envio jsonb;
  v_costo_envio_real numeric := 0;
begin
  -- Un usuario logueado solo puede crear pedidos a su propio nombre.
  if p_usuario_id is not null and p_usuario_id is distinct from auth.uid() then
    raise exception 'Usuario no válido';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'El pedido no tiene productos';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'El pedido tiene demasiados productos';
  end if;

  if length(coalesce(p_nombre,'')) > 120 or length(coalesce(p_apellido,'')) > 120
     or length(coalesce(p_email,'')) > 200 or length(coalesce(p_telefono,'')) > 40
     or length(coalesce(p_dni_cuit,'')) > 30 or length(coalesce(p_direccion_envio::text,'')) > 1000 then
    raise exception 'Datos demasiado largos';
  end if;

  -- cantidad válida y sin productos repetidos (evita saltear el control de stock)
  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(producto_id uuid, cantidad int)
    where x.producto_id is null or x.cantidad is null or x.cantidad < 1 or x.cantidad > 9999
  ) then
    raise exception 'Cantidad no válida';
  end if;
  if exists (
    select 1 from jsonb_to_recordset(p_items) as x(producto_id uuid, cantidad int)
    group by x.producto_id having count(*) > 1
  ) then
    raise exception 'Producto repetido en el pedido';
  end if;

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

  insert into pedidos (usuario_id, nombre, apellido, email, telefono, dni_cuit, tipo_entrega, direccion_envio, subtotal, costo_envio, total, estado, metodo_pago)
  values (p_usuario_id, p_nombre, p_apellido, p_email, p_telefono, p_dni_cuit, p_tipo_entrega, p_direccion_envio, 0, 0, 0, 'nuevo', p_metodo_pago)
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

  if p_tipo_entrega = 'envio' then
    select metodos_envio into v_metodos_envio from configuracion where id = 1;

    if coalesce((v_metodos_envio->>'envio_activo')::boolean, true) then
      v_costo_envio_real := coalesce((v_metodos_envio->>'costo_envio_fijo')::numeric, 0);

      if v_metodos_envio->>'envio_gratis_desde' is not null
        and v_subtotal >= (v_metodos_envio->>'envio_gratis_desde')::numeric
      then
        v_costo_envio_real := 0;
      end if;
    end if;
  end if;

  update pedidos
  set subtotal = v_subtotal, costo_envio = v_costo_envio_real, total = v_subtotal + v_costo_envio_real
  where id = v_pedido_id;

  return v_pedido_id;
end;
$function$;

create or replace function public.crear_solicitud_mecanica(
  p_usuario_id uuid, p_nombre text, p_apellido text, p_telefono text, p_email text,
  p_moto_marca text, p_moto_modelo text, p_servicios_ids uuid[],
  p_descripcion_problema text, p_repuesto_cliente text, p_disclaimer_aceptado boolean
) returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_id uuid;
  v_numero bigint;
  v_ahora timestamptz := now();
begin
  if p_usuario_id is not null and p_usuario_id is distinct from auth.uid() then
    raise exception 'Usuario no válido';
  end if;
  if coalesce(p_disclaimer_aceptado, false) is not true then
    raise exception 'Hay que aceptar la confirmación de condiciones para pedir el turno.';
  end if;
  if p_servicios_ids is null or array_length(p_servicios_ids, 1) is null then
    raise exception 'Elegí al menos un servicio.';
  end if;
  if array_length(p_servicios_ids, 1) > 30 then
    raise exception 'Demasiados servicios.';
  end if;
  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_apellido), '') = '' or coalesce(trim(p_telefono), '') = '' then
    raise exception 'Faltan datos obligatorios (nombre, apellido o teléfono).';
  end if;
  if length(coalesce(p_nombre,'')) > 120 or length(coalesce(p_apellido,'')) > 120
     or length(coalesce(p_telefono,'')) > 40 or length(coalesce(p_email,'')) > 200
     or length(coalesce(p_moto_marca,'')) > 80 or length(coalesce(p_moto_modelo,'')) > 80
     or length(coalesce(p_descripcion_problema,'')) > 2000 or length(coalesce(p_repuesto_cliente,'')) > 500 then
    raise exception 'Datos demasiado largos';
  end if;

  insert into solicitudes_mecanica (
    usuario_id, nombre, apellido, telefono, email, moto_marca, moto_modelo,
    servicios_ids, descripcion_problema, repuesto_cliente, repuesto_cliente_registrado_at,
    disclaimer_aceptado, disclaimer_aceptado_at, estado
  ) values (
    p_usuario_id, p_nombre, p_apellido, p_telefono, nullif(p_email, ''), nullif(p_moto_marca, ''), nullif(p_moto_modelo, ''),
    p_servicios_ids, nullif(p_descripcion_problema, ''), nullif(p_repuesto_cliente, ''),
    case when coalesce(p_repuesto_cliente, '') <> '' then v_ahora else null end,
    true, v_ahora, 'pendiente'
  )
  returning id, numero into v_id, v_numero;

  return jsonb_build_object('id', v_id, 'numero', v_numero);
end;
$function$;

update storage.buckets
set file_size_limit = 5242880,
    allowed_mime_types = array['image/png','image/jpeg','image/webp','image/avif','image/gif']
where id = 'public-assets';

revoke insert, update, delete on public.perfiles from anon;
