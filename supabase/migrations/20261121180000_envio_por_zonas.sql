-- Envío a domicilio por zona.
-- Los precios por zona salen de la lista del negocio (El Talar sin cargo,
-- General Pacheco, Ricardo Rojas / Las Tunas y Don Torcuato y alrededores).
-- Van en una columna propia para que guardar la configuración desde el panel
-- no las borre. El costo real lo calcula SIEMPRE esta función en el servidor.

alter table configuracion add column if not exists envio_zonas jsonb not null default '[]'::jsonb;

update configuracion
set envio_zonas = '[
  {"id":"el-talar","nombre":"El Talar","costo":0},
  {"id":"general-pacheco","nombre":"General Pacheco","costo":3000,"gratis_desde":300000},
  {"id":"ricardo-rojas-las-tunas","nombre":"Ricardo Rojas / Las Tunas","costo":5500,"gratis_desde":300000},
  {"id":"don-torcuato","nombre":"Don Torcuato y alrededores","costo":8200,"gratis_desde":300000}
]'::jsonb
where id = 1;

create or replace function public.crear_pedido(
  p_usuario_id uuid, p_nombre text, p_apellido text, p_email text, p_telefono text, p_dni_cuit text,
  p_tipo_entrega tipo_entrega, p_direccion_envio jsonb, p_costo_envio numeric, p_items jsonb,
  p_metodo_pago metodo_pago default null::metodo_pago
)
returns uuid
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
  v_zonas jsonb;
  v_zona jsonb;
  v_direccion jsonb := p_direccion_envio;
  v_costo_envio_real numeric := 0;
begin
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
    select * into v_producto from productos where id = v_item.producto_id and activo = true;
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

    v_subtotal := v_subtotal + (v_precio * v_item.cantidad);
  end loop;

  if p_tipo_entrega = 'envio' then
    select metodos_envio, envio_zonas into v_metodos_envio, v_zonas from configuracion where id = 1;

    if v_zonas is not null and jsonb_typeof(v_zonas) = 'array' and jsonb_array_length(v_zonas) > 0 then
      -- Envío por zona: la zona elegida tiene que existir en la configuración.
      select z into v_zona
      from jsonb_array_elements(v_zonas) z
      where z->>'id' = coalesce(p_direccion_envio->>'zona', '')
      limit 1;

      if v_zona is null then
        raise exception 'Zona de envío no válida';
      end if;

      v_costo_envio_real := coalesce((v_zona->>'costo')::numeric, 0);
      if v_zona->>'gratis_desde' is not null
        and v_subtotal >= (v_zona->>'gratis_desde')::numeric
      then
        v_costo_envio_real := 0;
      end if;

      v_direccion := coalesce(p_direccion_envio, '{}'::jsonb)
        || jsonb_build_object('zona_nombre', v_zona->>'nombre');
    elsif coalesce((v_metodos_envio->>'envio_activo')::boolean, true) then
      -- Sin zonas configuradas: costo fijo como antes.
      v_costo_envio_real := coalesce((v_metodos_envio->>'costo_envio_fijo')::numeric, 0);

      if v_metodos_envio->>'envio_gratis_desde' is not null
        and v_subtotal >= (v_metodos_envio->>'envio_gratis_desde')::numeric
      then
        v_costo_envio_real := 0;
      end if;
    end if;
  end if;

  update pedidos
  set subtotal = v_subtotal, costo_envio = v_costo_envio_real, total = v_subtotal + v_costo_envio_real,
      direccion_envio = v_direccion
  where id = v_pedido_id;

  return v_pedido_id;
end;
$function$;
