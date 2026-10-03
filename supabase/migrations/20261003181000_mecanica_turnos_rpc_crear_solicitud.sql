-- Fix encontrado al revisar el flujo de /mecanica antes de deployar:
-- `solicitudes_mecanica_insert_publico` (ver migración anterior) permite el
-- INSERT, pero a propósito NO existe ninguna política de SELECT pública
-- para `solicitudes_mecanica` (un cliente no puede leer solicitudes ajenas
-- con teléfono/problema de otra persona). Postgres aplica también la
-- política de SELECT al `RETURNING` de un INSERT/UPDATE: un insert directo
-- desde el cliente con `.select("id, numero")` encadenado hubiera guardado
-- bien la solicitud, pero devuelto vacío (sin poder mostrarle el número al
-- cliente ni armar el mensaje de WhatsApp). Es exactamente el mismo
-- problema que ya se había resuelto para `pedidos` con la RPC
-- `crear_pedido`: se aplica la misma solución acá.
--
-- `crear_solicitud_mecanica` (security definer, mismo patrón que
-- `crear_pedido`) hace el insert y devuelve {id, numero}, revalidando
-- server-side (por si alguien llama la RPC directo salteándose el
-- formulario) las mismas dos condiciones que ya exige el `with check` de la
-- política de insert: disclaimer aceptado y al menos un servicio elegido.
--
-- La política `solicitudes_mecanica_insert_publico` se deja como está (no
-- hace falta tocarla: esta RPC es security definer, así que no depende de
-- ella para nada) — sigue siendo una vía alternativa igual de restrictiva
-- para insertar directo por REST si alguna vez hace falta, simplemente el
-- código de la app ya no la usa.

create function crear_solicitud_mecanica(
  p_usuario_id uuid,
  p_nombre text,
  p_apellido text,
  p_telefono text,
  p_email text,
  p_moto_marca text,
  p_moto_modelo text,
  p_servicios_ids uuid[],
  p_descripcion_problema text,
  p_repuesto_cliente text,
  p_disclaimer_aceptado boolean
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
  v_numero bigint;
  v_ahora timestamptz := now();
begin
  if coalesce(p_disclaimer_aceptado, false) is not true then
    raise exception 'Hay que aceptar la confirmación de condiciones para pedir el turno.';
  end if;
  if p_servicios_ids is null or array_length(p_servicios_ids, 1) is null then
    raise exception 'Elegí al menos un servicio.';
  end if;
  if coalesce(trim(p_nombre), '') = '' or coalesce(trim(p_apellido), '') = '' or coalesce(trim(p_telefono), '') = '' then
    raise exception 'Faltan datos obligatorios (nombre, apellido o teléfono).';
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
$$;
