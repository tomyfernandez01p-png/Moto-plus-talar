-- Bug: pedidos/pagos/banners/configuracion usaban fn_producto_touch(), que
-- setea NEW.fecha_modificacion (columna que solo existe en productos). Estas
-- tablas usan `updated_at`. Se separa en su propia función.

create or replace function fn_touch_updated_at() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_pedido_touch on pedidos;
create trigger trg_pedido_touch
  before update on pedidos
  for each row execute function fn_touch_updated_at();

drop trigger if exists trg_pago_touch on pagos;
create trigger trg_pago_touch
  before update on pagos
  for each row execute function fn_touch_updated_at();

drop trigger if exists trg_banner_touch on banners;
create trigger trg_banner_touch
  before update on banners
  for each row execute function fn_touch_updated_at();

drop trigger if exists trg_config_touch on configuracion;
create trigger trg_config_touch
  before update on configuracion
  for each row execute function fn_touch_updated_at();
