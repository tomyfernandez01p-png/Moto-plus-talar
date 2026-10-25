-- Ya aplicada a la base. Decoración de temporada del sitio: 'auto' (según la fecha),
-- 'ninguna', o el id de una temporada (halloween, navidad, anio_nuevo, pascua, dia_madre, dia_padre).
alter table public.configuracion add column if not exists temporada text not null default 'auto';
