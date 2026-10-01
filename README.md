# Moto Plus Talar — plataforma de e-commerce

Plataforma real de e-commerce para **Moto Plus Talar** (repuestos y accesorios para
motos, con mecánica con turno) en El Talar, Buenos Aires: tienda pública,
panel de administración privado, base de datos relacional central, carrito,
checkout con envío o retiro en el local, pagos con Mercado Pago (arquitectura
lista, activable con credenciales reales), gestión de pedidos y stock, y
SEO/Google listo para producción.

No es una landing ni un mockup: todo el contenido (productos, precios,
stock, categorías, marcas, banners, pedidos, configuración del negocio) vive
en la base de datos y se administra desde `/admin`. Nada de esto está
hardcodeado en el código.

## Stack tecnológico

- **Next.js 14** (App Router) + **TypeScript**, mobile-first con Tailwind CSS.
- **Supabase** (Postgres + Auth + Storage) como base de datos central
  relacional, con Row Level Security en todas las tablas.
- **Server Actions** de Next.js para todas las escrituras (nunca se exponen
  mutaciones directas sin pasar por validación de rol en el servidor).
- **Mercado Pago** (SDK oficial `mercadopago`) para pagos online, con
  verificación de firma en el webhook y consulta server-to-server del pago
  real (nunca se confía en el estado que manda el webhook).
- **Vercel** como plataforma de despliegue.

## Estructura del proyecto

```
supabase/migrations/       Migraciones SQL (schema, RLS, seed, funciones)
src/
  app/
    (tienda pública)       /, /productos, /categoria/[slug], /marca/[slug],
                            /buscar, /producto/[slug], /mi-moto, /carrito,
                            /checkout, /pedido/[id], /cuenta, /login, /registro,
                            /nosotros, /contacto, /preguntas-frecuentes,
                            /terminos, /privacidad, /envios,
                            /cambios-y-devoluciones
    admin/                 Panel privado (protegido por middleware + rol)
      productos/            CRUD, edición masiva, importar/exportar CSV
      categorias/, marcas/  CRUD con imagen (marcas)
      pedidos/              Lista, detalle, cambio de estado, notas internas
      banners/               CRUD con imagen y fechas de vigencia
      configuracion/         Todo lo editable del negocio (solo administrador)
    api/mercadopago/        crear-preferencia (checkout) y webhook (pagos)
    sitemap.ts, robots.ts   SEO técnico
  components/               UI (layout, home, producto, ui base)
  lib/                      Clientes de Supabase, config del negocio, carrito,
                            formato, WhatsApp, Mercado Pago
  types/database.ts         Tipos de la base de datos (hand-written)
  middleware.ts             Protege /admin/* y refresca la sesión
```

## Base de datos

Todo vive en Postgres (Supabase), con RLS habilitado en **todas** las tablas:

- `perfiles` — rol (`administrador` / `empleado` / `cliente`), se crea
  automáticamente al registrarse (trigger sobre `auth.users`).
- `categorias`, `marcas`, `motos` — catálogo de referencia.
- `productos` — SKU, código, precio, precio promocional con vigencia por
  fecha, costo (nunca expuesto públicamente), stock, `estado_stock` (columna
  generada: disponible / últimas unidades / sin stock / consultar),
  características, tags, imágenes, compatibilidad con motos.
- `pedidos` / `pedido_items` / `pagos` — pedidos con pipeline de estados
  (nuevo → pago_pendiente → pago_aprobado → confirmado → preparando →
  enviado → entregado, o cancelado) y registro de cada intento/confirmación
  de pago.
- `banners`, `configuracion` (fila única con todo el negocio: contacto,
  horarios, redes, métodos de pago/envío, SEO, secciones visibles del home,
  hero, barra de anuncio), `historial_cambios` (auditoría), `logs_acceso`.
- `crear_pedido()` — única puerta de entrada para crear un pedido: valida
  stock fila por fila con lock (`FOR UPDATE`), crea el pedido y descuenta
  stock en una misma transacción. Es la única función pensada para ser
  llamada por usuarios anónimos/autenticados; todo lo demás requiere rol
  `administrador`/`empleado` vía RLS.
- Vista pública `vista_productos` con `security_invoker = true` y columnas
  explícitas (nunca expone `costo` ni campos de auditoría).

Migraciones (`supabase/migrations/0001` a `0008`): schema inicial,
hardening de seguridad (RLS + funciones a esquema no expuesto
`app_private`), seed de categorías/marcas reales, configuración real del
negocio + bucket de Storage, fix de triggers, política de INSERT faltante
en `historial_cambios`, método de pago en `crear_pedido`, y seed de motos de
referencia.

## Variables de entorno

Copiá `.env.example` a `.env.local` (desarrollo) y cargá los mismos nombres
como Environment Variables en Vercel para producción.

| Variable | Obligatoria | Descripción |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Sí | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Sí | Clave pública (anon) de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Sí | Clave de service role. **Solo servidor**, nunca en el cliente ni en el repo |
| `NEXT_PUBLIC_SITE_URL` | Sí | URL pública del sitio (para sitemap, SEO, links de checkout/webhook) |
| `MERCADOPAGO_ACCESS_TOKEN` | Para pagos online | Access token privado de Mercado Pago |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Opcional | Public key (no secreta); también puede cargarse desde `/admin/configuracion` |
| `MERCADOPAGO_WEBHOOK_SECRET` | Para pagos online | Secret para verificar la firma del webhook |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Opcional | Si se quiere embeber un mapa (hoy se usa un link de búsqueda que no la necesita) |
| `GOOGLE_PLACES_API_KEY` / `GOOGLE_PLACE_ID` | Para reseñas reales | Sin esto, la sección de reseñas de Google no se muestra (nunca se inventan reseñas) |
| `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` | Opcional | También configurable desde `/admin/configuracion` |
| `CRON_SECRET` | Opcional | Para proteger tareas programadas futuras |

**Nunca** se hardcodea ninguna clave en el código: todo lo sensible sale de
`process.env`, y las claves públicas de integraciones que sí puede tocar el
negocio (Mercado Pago public key, Analytics ID) son editables desde
`/admin/configuracion` y quedan en la base, no en el repo.

## Integraciones pendientes de credenciales reales

La arquitectura está completa para las tres, pero **no están simuladas ni
marcadas como listas** hasta que se carguen credenciales reales:

1. **Mercado Pago**: falta `MERCADOPAGO_ACCESS_TOKEN` y
   `MERCADOPAGO_WEBHOOK_SECRET`. Sin ellos, `/api/mercadopago/crear-preferencia`
   devuelve un error explícito (nunca un pago falso) y el checkout cae a
   coordinar el pago por WhatsApp.
2. **Reseñas de Google**: falta `GOOGLE_PLACES_API_KEY` y `GOOGLE_PLACE_ID`.
   Sin ellos, la sección de reseñas no se renderiza (nunca se muestran
   reseñas inventadas).
3. **Google Search Console / Merchant Center**: son pasos manuales de
   verificación de dominio fuera del código; el sitio ya expone sitemap,
   robots.txt, canonical y Schema.org (`LocalBusiness`, `Product`) para que
   la verificación funcione apenas se den de alta.

## Cómo ejecutar localmente

Este proyecto se escribió íntegramente a mano en un entorno sin salida a
npm/PyPI, así que **nunca se instaló ni se corrió localmente**. Para
levantarlo en una máquina con acceso normal a internet:

```bash
npm install
cp .env.example .env.local   # completar con las credenciales reales
npm run dev                  # http://localhost:3000
```

Para tipar/lintear:

```bash
npm run typecheck
npm run lint
```

La base de datos ya existe en Supabase (proyecto `cvaucmbaqksgspwyyajg`) con
todas las migraciones aplicadas y el catálogo de categorías/marcas/motos
sembrado. Para replicar el esquema en otro proyecto Supabase desde cero:

```bash
supabase link --project-ref <tu-proyecto>
supabase db push              # aplica supabase/migrations/*.sql en orden
```

## Cómo hacer deploy

1. Crear un proyecto en Vercel apuntando a este repo.
2. Cargar todas las variables de la tabla de arriba en
   Settings → Environment Variables (Production y Preview).
3. Deploy. Next.js corre `next build` — Vercel sí tiene salida a internet
   para instalar dependencias, a diferencia del entorno en el que se
   escribió el código.
4. Una vez en producción, configurar en el dashboard de Mercado Pago la
   URL del webhook: `https://<tu-dominio>/api/mercadopago/webhook`.
5. Verificar el dominio en Google Search Console y dar de alta el
   Merchant Center apuntando al sitemap (`/sitemap.xml`).

## Checklist de producción

- [x] HTTPS forzado y headers de seguridad (`next.config.mjs`: CSP, HSTS,
      X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- [x] RLS habilitado en todas las tablas, con políticas mínimas por rol.
- [x] Funciones sensibles (`fn_es_staff`, `fn_es_admin`) movidas a un
      esquema no expuesto por la API (`app_private`).
- [x] Vista pública sin columnas internas (`costo`, auditoría).
- [x] Sin contraseñas ni claves en el repo; `.env.example` solo tiene
      placeholders.
- [x] Checkout de invitado seguro (UUID del pedido como credencial, sin
      depender de RLS por `usuario_id`).
- [x] Webhook de Mercado Pago con verificación de firma HMAC + reconsulta
      del pago real a la API (nunca confía en el body recibido).
- [x] CSV de productos: import/export por lotes, pensado para miles de
      productos.
- [x] Auditoría de cambios de precio/stock y de estado de pedidos
      (`historial_cambios`).
- [x] Sitemap, robots.txt, canonical, Schema.org (`LocalBusiness`,
      `Product`).
- [x] Datos reales del negocio (dirección, WhatsApp, horarios, redes) desde
      el día uno, editables sin tocar código.
- [x] Sin reseñas, testimonios ni datos de negocio inventados en ningún
      lado.
- [ ] Credenciales reales de Mercado Pago cargadas (pendiente del negocio).
- [ ] Credenciales de Google Places/Search Console cargadas (pendiente).
- [ ] Primer deploy real a Vercel y verificación del build (ver más abajo).
- [ ] Prueba end-to-end en producción: compra completa, checkout, pago,
      cambio de estado desde `/admin`.
- [ ] Backups: Supabase hace backups automáticos diarios en el plan del
      proyecto; confirmar el plan/retención con el negocio.

## Pruebas realizadas

- Migraciones aplicadas y verificadas contra los *advisors* de seguridad de
  Supabase (`get_advisors`): sin hallazgos salvo la excepción intencional y
  documentada de `crear_pedido` (RPC pública por diseño, con toda la
  validación server-side).
- Revisión manual de cada política RLS contra el flujo que la usa
  (checkout de invitado, panel admin, webhook de pagos).
- Verificación de conteos post-seed (categorías, marcas, motos) contra los
  valores esperados.

**No realizado todavía** (requiere el primer build/deploy real, fuera del
alcance de este entorno sandbox sin salida a npm): `next build` completo,
`tsc --noEmit`, `eslint`, y pruebas end-to-end en un navegador real. Es el
paso inmediato siguiente una vez desplegado en Vercel.

## Problemas pendientes / próximos pasos

1. **Primer build real**: el código nunca se compiló (sin salida a npm en
   este entorno). Es esperable que aparezcan errores de tipos o de imports
   al correr `next build` por primera vez en Vercel; hay que iterar sobre
   los logs de build.
2. Cargar credenciales reales de Mercado Pago y Google Places cuando el
   negocio las tenga.
3. Confirmar el plan de backups de Supabase con el negocio.
4. Opcional: mover la version pin de `mercadopago` en `package.json` (hoy
   `^2.0.9`, con caret porque este entorno no tiene forma de confirmar cuál
   es la versión publicada más reciente) a una versión exacta una vez que
   alguien con acceso a npm la verifique.
