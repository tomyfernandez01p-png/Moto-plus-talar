-- Variantes de producto (color / diseño): cada variante sigue siendo su propia fila
-- (con su stock, foto y código), pero se agrupan para mostrar UN solo producto
-- en el catálogo y elegir la variante dentro de la ficha.
alter table public.productos
  add column if not exists grupo_variante text,
  add column if not exists grupo_nombre text,
  add column if not exists variante_tipo text,
  add column if not exists variante_etiqueta text,
  add column if not exists variante_principal boolean not null default true;

create index if not exists productos_grupo_variante_idx on public.productos (grupo_variante) where grupo_variante is not null;

-- Carga de los grupos existentes (se deducen del nombre actual; no se cambia ningún nombre).
with base as (
  select id, codigo,
    case
      when codigo like 'ACC-PTP-PUN-%' then 'Puños Deportivos ProTaper (Par)'
      when codigo in ('ACC-001','ACC-002','ACC-003','ACC-004','ACC-005','ACC-006','ACC-007') then 'Arandela Anodizada (bolsa de 8)'
      when codigo in ('ACC-023','ACC-024','ACC-025','ACC-026','ACC-028','ACC-029','KITTORNMOTOVIO') then 'Kit 30 Unidades Cubre Tornillo'
      when codigo in ('ACC-030','ACC-031','ACC-033','ACC-034') then 'LED Posición Largo Siliconado'
      when codigo in ('ACC-046','ACC-047','SHOCK-RO') then 'Cubremanos Flotante Wirtz Shock MX/ATV'
      when codigo in ('CAS-016','CAS-017','CAS-018','CAS-019') then 'Casco Protork Abierto New Liberty'
      when codigo like 'CAS-%' and nombre ~ ' – Diseño \d+$' then regexp_replace(nombre, ' – Diseño \d+$', '')
    end as grupo,
    case
      when codigo like 'ACC-PTP-PUN-%' then regexp_replace(regexp_replace(nombre, '^Puños Deportivos ProTaper ', ''), ' \(Par\)$', '')
      when codigo in ('ACC-023','ACC-024','ACC-025','ACC-026','ACC-028','ACC-029','KITTORNMOTOVIO') then regexp_replace(nombre, '^.* color ', '')
      when codigo in ('CAS-016','CAS-017','CAS-018','CAS-019') then regexp_replace(nombre, '^Casco Protork Abierto New Liberty ', '')
      when codigo like 'CAS-%' and nombre ~ ' – Diseño \d+$' then regexp_replace(nombre, '^.* – ', '')
      else regexp_replace(nombre, '^.* ', '')
    end as etiqueta,
    case when codigo like 'CAS-%' then 'Diseño' else 'Color' end as tipo
  from public.productos
  where activo
), g as (
  select *, lower(regexp_replace(grupo, '[^a-zA-Z0-9]+', '-', 'g')) as clave,
         row_number() over (partition by grupo order by codigo) as pos
  from base where grupo is not null
)
update public.productos p set
  grupo_variante = g.clave,
  grupo_nombre = g.grupo,
  variante_tipo = g.tipo,
  variante_etiqueta = upper(left(g.etiqueta,1)) || substr(g.etiqueta,2),
  variante_principal = (g.pos = 1)
from g where g.id = p.id;

-- La vista suma las columnas nuevas AL FINAL (el resto queda igual).
create or replace view public.vista_productos as
 SELECT p.id, p.sku, p.codigo, p.codigo_alternativo, p.nombre, p.slug, p.categoria_id, p.subcategoria_id, p.marca_id,
    p.precio, p.precio_anterior, p.precio_promocional, p.oferta_desde, p.oferta_hasta, p.stock, p.stock_minimo,
    p.estado_stock, p.descripcion_corta, p.descripcion_completa, p.caracteristicas, p.tags, p.destacado, p.activo,
    p.imagen_principal_url, p.seo_title, p.seo_description, p.fecha_alta, p.fecha_modificacion,
    c.nombre AS categoria_nombre, c.slug AS categoria_slug, m.nombre AS marca_nombre, m.slug AS marca_slug,
    p.precio_promocional IS NOT NULL AND (p.oferta_desde IS NULL OR now() >= p.oferta_desde) AND (p.oferta_hasta IS NULL OR now() <= p.oferta_hasta) AS en_oferta,
        CASE
            WHEN p.precio_promocional IS NOT NULL AND (p.oferta_desde IS NULL OR now() >= p.oferta_desde) AND (p.oferta_hasta IS NULL OR now() <= p.oferta_hasta) THEN p.precio_promocional
            ELSE p.precio
        END AS precio_vigente,
    p.fecha_alta >= (now() - (((( SELECT configuracion.dias_nuevo FROM configuracion WHERE configuracion.id = 1)) || ' days'::text)::interval)) AS es_nuevo,
    p.grupo_variante, p.grupo_nombre, p.variante_tipo, p.variante_etiqueta, p.variante_principal
   FROM productos p
     LEFT JOIN categorias c ON c.id = p.categoria_id
     LEFT JOIN marcas m ON m.id = p.marca_id;
