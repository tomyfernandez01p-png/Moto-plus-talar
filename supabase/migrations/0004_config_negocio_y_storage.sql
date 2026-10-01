-- Carga los datos reales del negocio (de la ficha de Instagram / brief del
-- cliente) en la fila única de configuración, y crea el bucket público de
-- Storage para imágenes (logo, productos, banners) subidas desde /admin.

update configuracion set
  nombre_negocio = 'Moto Plus Talar',
  rubro = 'Repuestos y accesorios para motos. Mecánica con turno.',
  email = 'motoplustalar@gmail.com',
  whatsapp = '+54 9 11 2297-8803',
  whatsapp_link = 'https://wa.me/1122978803',
  direccion = 'Av. Hipólito Yrigoyen 2188',
  ciudad = 'El Talar',
  provincia = 'Buenos Aires',
  horarios = '{"lunes_viernes":"9:00 - 19:00","sabado":"9:00 - 13:00","domingo":"Cerrado"}'::jsonb,
  instagram_url = 'https://www.instagram.com/motoplus_talar/',
  facebook_url = 'https://www.facebook.com/share/1D4qaxTAH4/',
  metodos_pago = '{"mercadopago":false,"transferencia":true,"efectivo":true}'::jsonb,
  metodos_envio = '{"envio_activo":true,"retiro_activo":true,"costo_envio_fijo":null,"envio_gratis_desde":null}'::jsonb,
  seo = '{"title":"Moto Plus Talar — Repuestos y accesorios para motos en El Talar","description":"Repuestos y accesorios para motos en El Talar, Buenos Aires. Mecánica con turno, envíos a todo el país y retiro en el local."}'::jsonb,
  google = '{"analytics_id":null,"reviews_enabled":false,"search_console_verified":false}'::jsonb,
  anuncio_barra = '{"activo":false,"texto":"","color":"#FF6A00"}'::jsonb,
  hero = '{"activo":true,"titulo":"TODO LO QUE TU MOTO NECESITA","subtitulo":"Calidad, confianza y el mejor servicio.","boton_texto":"Ver productos","boton_url":"/productos"}'::jsonb,
  secciones_home = '{"hero":true,"buscador_moto":true,"categorias":true,"destacados":true,"ofertas":true,"nuevos":true,"marcas":true,"beneficios":true,"reviews":true,"instagram":true,"whatsapp":true}'::jsonb,
  cookies_texto = 'Usamos cookies para mejorar tu experiencia. Podés aceptar, rechazar las no esenciales o configurar tus preferencias.',
  cuentas_clientes_activas = true
where id = 1;

-- Bucket público para logo/productos/banners (las imágenes en sí se suben
-- desde /admin una vez desplegado: este entorno de build no tiene salida a
-- internet para subir binarios directo al Storage API).
insert into storage.buckets (id, name, public)
values ('public-assets', 'public-assets', true)
on conflict (id) do nothing;

create policy public_assets_lectura_publica on storage.objects
  for select using (bucket_id = 'public-assets');

create policy public_assets_escritura_staff on storage.objects
  for insert with check (bucket_id = 'public-assets' and app_private.fn_es_staff(auth.uid()));

create policy public_assets_actualiza_staff on storage.objects
  for update using (bucket_id = 'public-assets' and app_private.fn_es_staff(auth.uid()));

create policy public_assets_borra_staff on storage.objects
  for delete using (bucket_id = 'public-assets' and app_private.fn_es_staff(auth.uid()));
