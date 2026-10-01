-- AUDITORÍA DE SEGURIDAD (2026-10): favoritos de invitados sin aislar por sesión.
--
-- Problema: `favoritos_propio` permitía
--   usuario_id = auth.uid() or usuario_id is null
-- tanto en `using` como en `with check`, para las cuatro operaciones (`for
-- all`). El `usuario_id is null` identifica las filas de invitados (sin
-- cuenta), pero la policy no comparaba contra NINGÚN `session_id`: para un
-- visitante anónimo, `auth.uid()` también es null, así que la primera
-- condición nunca es verdadera (NULL = NULL no es TRUE en SQL) y queda
-- resuelto solo por la segunda, que no filtra nada. Resultado: cualquiera
-- -logueado o no, con la sola anon key pública- puede leer, modificar o
-- borrar las filas de favoritos de TODAS las sesiones de invitados vía la
-- REST API de PostgREST, sin conocer su `session_id`.
--
-- Nota: hoy no hay ningún código en el frontend que use la tabla
-- `favoritos` todavía (no hay un solo `.from("favoritos")` en src/), así
-- que este fix no rompe ninguna funcionalidad existente. Queda la base
-- lista con el modelo de seguridad correcto para cuando se implemente.
--
-- Fix: mismo criterio que ya se usa para /pedido/[id] (UUID de alta
-- entropía = credencial). El `session_id` que el browser genera y guarda
-- (cookie/localStorage) para un invitado es esa credencial, y tiene que
-- viajar en cada request para que la policy pueda compararlo -no alcanza
-- con que exista la columna, Postgres necesita verlo en algún lado del
-- request-. Se lee desde un header custom (`x-favoritos-session`) vía el
-- GUC `request.headers` que expone PostgREST, el mismo mecanismo estándar
-- de Supabase para datos de invitados sin cuenta.
--
-- Cuando se implemente la UI de favoritos, el cliente de Supabase para
-- invitados sin sesión tiene que mandar ese header en cada request contra
-- `favoritos`, ej.:
--   createClient(url, anonKey, {
--     global: { headers: { "x-favoritos-session": sessionIdDelVisitante } },
--   })
-- con `sessionIdDelVisitante` un UUID random generado una vez en el
-- browser y persistido (no un valor adivinable ni correlativo).

create or replace function app_private.fn_favoritos_session() returns text
language sql stable set search_path = public as $$
  select nullif(current_setting('request.headers', true)::json->>'x-favoritos-session', '');
$$;

drop policy if exists favoritos_propio on favoritos;

create policy favoritos_propio on favoritos
  for all
  using (
    usuario_id = auth.uid()
    or (usuario_id is null and session_id = app_private.fn_favoritos_session())
  )
  with check (
    usuario_id = auth.uid()
    or (usuario_id is null and session_id = app_private.fn_favoritos_session())
  );
