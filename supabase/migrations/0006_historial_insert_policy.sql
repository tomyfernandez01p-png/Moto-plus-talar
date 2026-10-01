-- El único INSERT hacia historial_cambios que existía hasta ahora corría
-- dentro del trigger fn_producto_historial(), que es SECURITY INVOKER (no
-- definer): al ejecutarse con el rol del staff autenticado que hace el
-- UPDATE, ese INSERT queda sujeto a RLS igual que cualquier otro. Como la
-- tabla solo tenía política de SELECT para staff, ese INSERT quedaba
-- bloqueado por RLS (deny-by-default) apenas alguien intentara actualizar
-- precio/stock de un producto real. Se agrega la política de INSERT que
-- faltaba, necesaria además para el nuevo historial de cambios de estado
-- de pedidos (admin/pedidos/actions.ts).
create policy historial_insert_staff on historial_cambios
  for insert
  with check (app_private.fn_es_staff(auth.uid()));
