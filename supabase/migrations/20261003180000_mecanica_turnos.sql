-- Nueva feature: solicitudes de turno de mecánica.
--
-- Contexto (pedido real de la dueña, no inventado): además de vender
-- repuestos, el local hace mecánica de moto (service completo: cambio de
-- aceite, mantenimiento de frenos, eléctrico, etc. — los mismos servicios
-- que ya ofrece por su catálogo de WhatsApp Business). Quiere que el pedido
-- de turno entre por un formulario del sitio en vez de solo WhatsApp suelto,
-- pero SIN que se agende solo: ella elige a mano qué solicitudes acepta
-- (`estado` arranca siempre en 'pendiente', nunca se auto-confirma). También
-- pidió protegerse del cliente que insiste con un repuesto más barato y
-- después reclama: por eso `repuesto_cliente` queda guardado con su propio
-- timestamp como registro, y `disclaimer_aceptado` es obligatorio antes de
-- poder insertar la solicitud.
--
-- Sigue el mismo patrón de permisos que el resto del esquema (ver 0001/0002):
-- fn_es_staff/fn_es_admin viven en app_private (movidas ahí en
-- 0002_security_hardening.sql), fn_touch_updated_at() ya existe desde
-- 0005_fix_touch_triggers.sql.

create type estado_solicitud_mecanica as enum ('pendiente', 'aceptada', 'rechazada', 'completada');

-- ============================================================
-- SERVICIOS DE MECÁNICA (catálogo, igual de espíritu a categorias/marcas)
-- ============================================================
create table servicios_mecanica (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  orden int not null default 0,
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_servicios_mecanica_activo on servicios_mecanica(activo);
comment on table servicios_mecanica is 'Catálogo de servicios de mecánica que se muestran como checklist en /mecanica.';

create trigger trg_servicios_mecanica_touch
  before update on servicios_mecanica
  for each row execute function fn_touch_updated_at();

alter table servicios_mecanica enable row level security;

create policy servicios_mecanica_lectura_publica on servicios_mecanica
  for select using (activo = true or app_private.fn_es_staff(auth.uid()));
create policy servicios_mecanica_escritura_staff on servicios_mecanica
  for insert with check (app_private.fn_es_staff(auth.uid()));
create policy servicios_mecanica_actualiza_staff on servicios_mecanica
  for update using (app_private.fn_es_staff(auth.uid()));
create policy servicios_mecanica_borra_staff on servicios_mecanica
  for delete using (app_private.fn_es_admin(auth.uid()));

-- ============================================================
-- SOLICITUDES DE TURNO DE MECÁNICA
-- ============================================================
create table solicitudes_mecanica (
  id uuid primary key default gen_random_uuid(),
  numero bigserial unique,
  usuario_id uuid references perfiles(id) on delete set null,
  nombre text not null,
  apellido text not null,
  telefono text not null,
  email text,
  moto_marca text,
  moto_modelo text,
  servicios_ids uuid[] not null default '{}',
  descripcion_problema text,
  -- Registro contra el reclamo "le hicieron poner un repuesto barato":
  -- queda escrito tal cual lo pidió el cliente, con el momento exacto en
  -- que lo pidió. Nunca se borra ni se reescribe desde el panel de admin.
  repuesto_cliente text,
  repuesto_cliente_registrado_at timestamptz,
  disclaimer_aceptado boolean not null default false,
  disclaimer_aceptado_at timestamptz,
  estado estado_solicitud_mecanica not null default 'pendiente',
  notas_internas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_solicitudes_mecanica_estado on solicitudes_mecanica(estado);
create index idx_solicitudes_mecanica_usuario on solicitudes_mecanica(usuario_id);
create index idx_solicitudes_mecanica_created on solicitudes_mecanica(created_at desc);
comment on table solicitudes_mecanica is 'Pedidos de turno de mecánica enviados desde /mecanica. La dueña siempre revisa y acepta/rechaza a mano (nunca se auto-confirma).';

create trigger trg_solicitudes_mecanica_touch
  before update on solicitudes_mecanica
  for each row execute function fn_touch_updated_at();

alter table solicitudes_mecanica enable row level security;

-- El público (logueado o invitado) puede crear su propia solicitud, pero
-- solo en estado 'pendiente' y solo si ya aceptó el disclaimer: ninguna
-- solicitud entra a la base sin esas dos condiciones, es la primera barrera
-- contra el caso de reclamo por el repuesto que el propio cliente eligió.
create policy solicitudes_mecanica_insert_publico on solicitudes_mecanica
  for insert
  with check (
    (usuario_id = auth.uid() or usuario_id is null)
    and estado = 'pendiente'
    and disclaimer_aceptado = true
  );

-- Solo la dueña / empleados ven y gestionan las solicitudes (brief: revisión
-- manual por panel de admin + WhatsApp, sin portal de seguimiento para el
-- cliente en este alcance).
create policy solicitudes_mecanica_select_staff on solicitudes_mecanica
  for select using (app_private.fn_es_staff(auth.uid()));
create policy solicitudes_mecanica_update_staff on solicitudes_mecanica
  for update using (app_private.fn_es_staff(auth.uid()));
create policy solicitudes_mecanica_delete_admin on solicitudes_mecanica
  for delete using (app_private.fn_es_admin(auth.uid()));

-- ============================================================
-- SEED: los 11 servicios reales que ya ofrece la dueña (catálogo de
-- WhatsApp Business), no inventados.
-- ============================================================
insert into servicios_mecanica (nombre, orden) values
  ('Cambio de aceite', 1),
  ('Cambio de filtro de aceite', 2),
  ('Mantenimiento de filtro de aire', 3),
  ('Mantenimiento de transmisión', 4),
  ('Mantenimiento de freno trasero', 5),
  ('Mantenimiento freno delantero', 6),
  ('Mantenimiento eléctrico', 7),
  ('Regulación de válvulas', 8),
  ('Bujía', 9),
  ('Ajuste general', 10),
  ('Lubricación general', 11);
