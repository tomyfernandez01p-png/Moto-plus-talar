-- PENDIENTE DE APLICAR: esta migración todavía NO se aplicó a la base (requiere aprobación del dueño).
-- Pedidos sin pagar: devuelven el stock al cancelarse y se cancelan solos a las 3 horas.
-- 1) Trigger: al pasar un pedido de "nuevo"/"pago_pendiente" a "cancelado" (por staff o automático)
--    se devuelve el stock reservado por crear_pedido. Los pedidos ya pagados NO devuelven stock
--    automáticamente (lo decide el staff).
-- 2) Función + pg_cron cada 15 minutos: cancela pedidos sin pagar con más de 3 horas.

create or replace function public.fn_restaurar_stock_pedido_sin_pago()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.estado = 'cancelado' and old.estado in ('nuevo','pago_pendiente') then
    update productos p
       set stock = p.stock + pi.cantidad
      from pedido_items pi
     where pi.pedido_id = new.id
       and pi.producto_id = p.id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_pedidos_restaurar_stock on public.pedidos;
create trigger trg_pedidos_restaurar_stock
after update of estado on public.pedidos
for each row
when (old.estado is distinct from new.estado)
execute function public.fn_restaurar_stock_pedido_sin_pago();

create or replace function public.liberar_pedidos_sin_pago(p_horas int default 3)
returns int
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  r record;
  n int := 0;
begin
  for r in
    select id, estado from pedidos
     where estado in ('nuevo','pago_pendiente')
       and created_at < now() - make_interval(hours => p_horas)
     for update
  loop
    update pedidos set estado = 'cancelado' where id = r.id;
    insert into historial_cambios (tabla, registro_id, usuario_id, accion, campo, valor_anterior, valor_nuevo)
    values ('pedidos', r.id, null, 'cancelacion_automatica_sin_pago', 'estado', r.estado::text, 'cancelado');
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke all on function public.liberar_pedidos_sin_pago(int) from public, anon, authenticated;
revoke all on function public.fn_restaurar_stock_pedido_sin_pago() from public, anon, authenticated;

create extension if not exists pg_cron with schema pg_catalog;
select cron.schedule('liberar-pedidos-sin-pago', '*/15 * * * *', $$select public.liberar_pedidos_sin_pago(3)$$);
