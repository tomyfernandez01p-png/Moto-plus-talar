-- AUDITORÍA DE SEGURIDAD (2026-10): costo de envío manipulable desde el cliente.
--
-- Problema: `crear_pedido` grababa `coalesce(p_costo_envio, 0)` tal cual lo
-- mandaba el cliente. `p_costo_envio` lo calcula CheckoutForm.tsx en el
-- navegador y crearPedidoAction (Server Action) lo reenvía sin validar. Una
-- Server Action se puede invocar con un body arbitrario sin pasar por el JS
-- del formulario, así que cualquiera podía mandar un costo de envío
-- negativo (o 0 para un pedido con envío) y reducir el `total` real del
-- pedido -el mismo `total`/`costo_envio` que después arma el monto de la
-- preferencia de Mercado Pago en crear-preferencia/route.ts-. Esto es
-- exactamente el mismo problema que ya se había resuelto para el precio de
-- cada producto (que SÍ se recalcula acá adentro desde `productos`,
-- ignorando lo que mande el cliente): el costo de envío necesitaba el
-- mismo tratamiento.
--
-- Fix: el costo de envío se recalcula acá, server-side, a partir de
-- `configuracion.metodos_envio` (costo fijo + umbral de envío gratis) y del
-- `v_subtotal` ya validado con los precios reales de `productos` -nunca a
-- partir de un subtotal que mande el cliente-. El parámetro `p_costo_envio`
-- se deja en la firma para no romper la llamada existente desde
-- checkout/actions.ts (sigue siendo válido mandarlo), pero se ignora por
-- completo para calcular `pedidos.costo_envio`/`pedidos.total`.
--
-- Hallazgo adicional al verificar el esquema real antes de aplicar: existen
-- DOS versiones de `crear_pedido` en la base. La migración 0007 agregó el
-- parámetro `p_metodo_pago`, pero como `create or replace function` solo
-- reemplaza una función si la firma (lista de tipos) matchea exacto, esa
-- nueva firma de 11 parámetros NO reemplazó a la de 10 parámetros de 0001:
-- quedó como una SEGUNDA función sobrecargada, ambas con EXECUTE otorgado a
-- anon/authenticated/PUBLIC. La de 10 parámetros es la versión vieja, que
-- nunca recalculó nada (ni metodo_pago ni, ahora, el envío) y queda
-- invocable por RPC en paralelo a la corregida. Se elimina acá antes de
-- recrear la de 11 parámetros -nada en el código le pasa alguna vez solo 10
-- argumentos: checkout/actions.ts siempre manda `p_metodo_pago`-.
drop function if exists public.crear_pedido(
  uuid,    -- p_usuario_id
  text,    -- p_nombre
  text,    -- p_apellido
  text,    -- p_email
  text,    -- p_telefono
  text,    -- p_dni_cuit
  tipo_entrega,  -- p_tipo_entrega
  jsonb,   -- p_direccion_envio
  numeric, -- p_costo_envio
  jsonb    -- p_items
);

create or replace function crear_pedido(
  p_usuario_id uuid,
  p_nombre text,
  p_apellido text,
  p_email text,
  p_telefono text,
  p_dni_cuit text,
  p_tipo_entrega tipo_entrega,
  p_direccion_envio jsonb,
  p_costo_envio numeric, -- ignorado para el total: ver nota arriba. Se mantiene solo por compatibilidad de firma.
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
  v_metodos_envio jsonb;
  v_costo_envio_real numeric := 0;
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

  -- costo de envío real: se ignora p_costo_envio por completo. Se calcula
  -- acá con la config vigente del negocio y el v_subtotal ya validado.
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
$$;
