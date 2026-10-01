-- AUDITORÍA DE SEGURIDAD (2026-10): escalación de privilegios en `perfiles`.
--
-- Problema: `perfiles_update_propio` permite `update ... using (id = auth.uid()
-- or fn_es_admin(auth.uid()))` sin `with check`, así que Postgres reusa el
-- mismo `using` como check. Eso NO restringe qué columnas se pueden tocar:
-- cualquier usuario autenticado puede hacer UPDATE sobre su propia fila y
-- cambiar `rol` a 'administrador' o 'empleado' (y `activo` a true) llamando
-- directo a PostgREST con la anon key pública + su propio access token, sin
-- pasar por ningún código de la app. El middleware y /admin/layout.tsx
-- confían en ese mismo campo `rol`, así que esto es una escalación de
-- privilegios completa al panel /admin.
--
-- Fix (defensa en dos capas, ninguna rompe funcionalidad existente: hoy no
-- hay un solo `.update()` sobre `perfiles` en toda la app — admin/clientes
-- es de solo lectura, y cada usuario todavía no tiene un formulario de
-- "editar mi perfil"):
--
-- 1) Permisos por columna a nivel Postgres: se le quita a `authenticated`
--    el UPDATE sobre la tabla entera y se le otorga solo sobre las columnas
--    que un usuario legítimamente puede autoeditar (nombre, apellido,
--    teléfono, DNI/CUIT). `rol` y `activo` quedan fuera de ese grant, así
--    que ninguna fila -ni siquiera la propia- se puede tocar en esas dos
--    columnas vía el cliente con anon/authenticated key, sin importar lo
--    que diga la policy de RLS. Esto es necesario pero no alcanza solo:
--    el rol `service_role` (y el SQL editor / migraciones, que corren como
--    `postgres`) ignoran los grants de `authenticated` por completo, así
--    que la administración real de roles sigue funcionando igual que
--    siempre a través de esos caminos -el "flujo server-side
--    correspondiente"-, nunca a través del cliente RLS del navegador.
--
-- 2) Trigger de defensa en profundidad: por si en el futuro alguien vuelve
--    a dar un `grant update on perfiles to authenticated` más amplio (por
--    error, o para habilitar algún form nuevo), este trigger bloquea
--    explícitamente cualquier cambio a `rol`/`activo` hecho por un usuario
--    autenticado que no sea ya administrador. No afecta llamadas sin
--    contexto de usuario (`auth.uid()` es null: service_role, SQL editor,
--    migraciones), que es por donde debe seguir gestionándose el rol de
--    staff.

-- --- 1) grants por columna ---
revoke update on perfiles from authenticated;
grant update (nombre, apellido, telefono, dni_cuit) on perfiles to authenticated;

-- --- 2) trigger de defensa en profundidad ---
create or replace function app_private.fn_proteger_rol_perfil() returns trigger
language plpgsql set search_path = public as $$
begin
  -- auth.uid() is null = no hay usuario autenticado haciendo el request
  -- (service_role, SQL editor, migración): se deja pasar, es el camino
  -- administrativo legítimo.
  if auth.uid() is not null and not app_private.fn_es_admin(auth.uid()) then
    if new.rol is distinct from old.rol then
      raise exception 'No tenés permisos para cambiar tu rol.';
    end if;
    if new.activo is distinct from old.activo then
      raise exception 'No tenés permisos para cambiar tu estado de cuenta.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_perfiles_proteger_rol on perfiles;
create trigger trg_perfiles_proteger_rol
  before update on perfiles
  for each row execute function app_private.fn_proteger_rol_perfil();
