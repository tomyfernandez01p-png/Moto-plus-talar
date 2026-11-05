-- APLICADA. El stock ya NO se reserva al crear el pedido: se descuenta cuando el pedido pasa a un
-- estado con pago confirmado (pago_aprobado, confirmado, preparando, enviado, entregado), una sola vez
-- por pedido (columna stock_descontado). crear_pedido sigue validando que haya stock disponible.
-- Reemplaza a la migración "liberar_pedidos_sin_pago" (ya no hay stock reservado que liberar).
alter table public.pedidos add column if not exists stock_descontado boolean not null default false;

create or replace function public.fn_descontar_stock_al_pagar()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
begin
  if new.stock_descontado is not true
     and new.estado in ('pago_aprobado','confirmado','preparando','enviado','entregado') then
    update productos p
       set stock = greatest(p.stock - pi.cantidad, 0)
      from pedido_items pi
     where pi.pedido_id = new.id
       and pi.producto_id = p.id;
    new.stock_descontado := true;
  end if;
  return new;
end;
$$;

revoke all on function public.fn_descontar_stock_al_pagar() from public, anon, authenticated;

drop trigger if exists trg_pedidos_descontar_stock on public.pedidos;
create trigger trg_pedidos_descontar_stock
before update of estado on public.pedidos
for each row
when (old.estado is distinct from new.estado)
execute function public.fn_descontar_stock_al_pagar();

-- crear_pedido: se quitó la línea "update productos set stock = stock - cantidad" y el "for update"
-- de la validación (ya no se reserva). El resto de la función quedó igual.
