-- Antes, `metodo_pago` en `pedidos` nunca se seteaba al crear el pedido
-- (la RPC no lo recibía), y el cliente anónimo/autenticado no tiene permiso
-- de UPDATE sobre `pedidos` (política pedidos_actualiza_staff: solo staff).
-- Esto es intencional -evita que cualquiera pise el estado de su propio
-- pedido-, pero significa que el único lugar seguro para grabar el método
-- de pago elegido en el checkout es dentro de esta misma función
-- SECURITY DEFINER, ya validada y de un solo uso por pedido.
--
-- Se agrega el parámetro al final con default null para no romper las
-- llamadas existentes desde checkout/actions.ts (crearPedidoAction), que
-- invocan la RPC con argumentos nombrados.
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
  p_items jsonb, -- [{producto_id, cantidad}]
  p_metodo_pago metodo_pago default null
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

  insert into pedidos (usuario_id, nombre, apellido, email, telefono, dni_cuit, tipo_entrega, direccion_envio, subtotal, costo_envio, total, estado, metodo_pago)
  values (p_usuario_id, p_nombre, p_apellido, p_email, p_telefono, p_dni_cuit, p_tipo_entrega, p_direccion_envio, 0, coalesce(p_costo_envio,0), 0, 'nuevo', p_metodo_pago)
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
