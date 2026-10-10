import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { IconMapPin, IconWhatsApp } from "@/components/ui/Icons";

export async function Footer() {
  const config = await getConfiguracion();
  const supabase = createClient();
  const [{ data: categorias }, { data: marcas }] = await Promise.all([
    supabase
      .from("categorias")
      .select("nombre, slug")
      .is("categoria_padre_id", null)
      .eq("activo", true)
      .order("orden")
      .limit(8),
    supabase.from("marcas").select("nombre, slug").eq("activo", true).order("orden").limit(8),
  ]);

  const anio = new Date().getFullYear();

  return (
    <footer className="relative border-t border-base-border bg-base-black text-base-muted">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-orange/40 to-transparent" />

      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-3 md:grid-cols-5 md:px-6">
        <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="relative h-10 w-10 overflow-hidden rounded-full ring-1 ring-base-border">
              <Image
                src={config.logo_url || "/brand/logo-placeholder.svg"}
                alt={config.nombre_negocio}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <span className="block text-base font-extrabold leading-tight text-base-white">
                {config.nombre_negocio}
              </span>
              <span className="block text-[11px] uppercase tracking-wide text-base-muted">
                Repuestos · Accesorios · Mecánica
              </span>
            </div>
          </div>
          {config.direccion && (
            <p className="flex items-start gap-1.5 text-sm">
              <IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-orange" />
              {config.direccion}, {config.ciudad}, {config.provincia}
            </p>
          )}
          {config.whatsapp && (
            <p className="flex items-center gap-1.5 text-sm">
              <IconWhatsApp className="h-4 w-4 shrink-0 text-[#25D366]" />
              {config.whatsapp}
            </p>
          )}
          {config.email && <p className="text-sm">{config.email}</p>}
          <div className="flex gap-3 pt-1">
            {config.instagram_url && (
              <a
                href={config.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-base-border transition-colors hover:border-brand-orange/50 hover:text-base-white"
              >
                <IconInstagram />
              </a>
            )}
            {config.facebook_url && (
              <a
                href={config.facebook_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-base-border transition-colors hover:border-brand-orange/50 hover:text-base-white"
              >
                <IconFacebook />
              </a>
            )}
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-base-white">Categorías</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {(categorias ?? []).map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="transition-colors hover:text-base-white">
                  {c.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/categorias" className="font-semibold text-brand-orange hover:underline">
                Ver todas →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-base-white">Marcas</h3>
          <ul className="flex flex-col gap-2 text-sm">
            {(marcas ?? []).map((m) => (
              <li key={m.slug}>
                <Link href={`/marca/${m.slug}`} className="transition-colors hover:text-base-white">
                  {m.nombre}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/marcas" className="font-semibold text-brand-orange hover:underline">
                Ver todas →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-base-white">Información</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/mecanica" className="transition-colors hover:text-base-white">Turno de mecánica</Link>
            </li>
            <li>
              <Link href="/nosotros" className="transition-colors hover:text-base-white">Nosotros</Link>
            </li>
            <li>
              <Link href="/preguntas-frecuentes" className="transition-colors hover:text-base-white">Preguntas frecuentes</Link>
            </li>
            <li>
              <Link href="/contacto" className="transition-colors hover:text-base-white">Contacto</Link>
            </li>
            <li>
              <Link href="/terminos" className="transition-colors hover:text-base-white">Términos y condiciones</Link>
            </li>
            <li>
              <Link href="/privacidad" className="transition-colors hover:text-base-white">Política de privacidad</Link>
            </li>
            <li>
              <Link href="/cambios-y-devoluciones" className="transition-colors hover:text-base-white">Cambios y devoluciones</Link>
            </li>
            <li>
              <Link href="/envios" className="transition-colors hover:text-base-white">Envíos</Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-bold text-base-white">Mi cuenta</h3>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              <Link href="/cuenta" className="transition-colors hover:text-base-white">Mi cuenta</Link>
            </li>
            <li>
              <Link href="/cuenta/pedidos" className="transition-colors hover:text-base-white">Mis pedidos</Link>
            </li>
            <li>
              <Link href="/favoritos" className="transition-colors hover:text-base-white">Favoritos</Link>
            </li>
            <li>
              <Link href="/carrito" className="transition-colors hover:text-base-white">Carrito</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-base-border px-4 py-6 md:px-6">
        <p className="mx-auto max-w-7xl text-xs">
          © {anio} {config.nombre_negocio}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 hover:text-base-white">
      <path d="M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.97.24 2.43.4a4.9 4.9 0 0 1 1.77 1.15 4.9 4.9 0 0 1 1.15 1.77c.16.46.35 1.26.4 2.43.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.24 1.97-.4 2.43a4.9 4.9 0 0 1-1.15 1.77 4.9 4.9 0 0 1-1.77 1.15c-.46.16-1.26.35-2.43.4-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.97-.24-2.43-.4a4.9 4.9 0 0 1-1.77-1.15 4.9 4.9 0 0 1-1.15-1.77c-.16-.46-.35-1.26-.4-2.43C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.24-1.97.4-2.43a4.9 4.9 0 0 1 1.15-1.77A4.9 4.9 0 0 1 5.6 1.8c.46-.16 1.26-.35 2.43-.4C9.3 1.34 9.68 1.33 12 1.33Zm0 1.8c-3.16 0-3.5.01-4.74.07-1 .05-1.55.21-1.9.35-.48.19-.82.41-1.18.77-.36.36-.58.7-.77 1.18-.14.35-.3.9-.35 1.9-.06 1.24-.07 1.58-.07 4.74s.01 3.5.07 4.74c.05 1 .21 1.55.35 1.9.19.48.41.82.77 1.18.36.36.7.58 1.18.77.35.14.9.3 1.9.35 1.24.06 1.58.07 4.74.07s3.5-.01 4.74-.07c1-.05 1.55-.21 1.9-.35.48-.19.82-.41 1.18-.77.36-.36.58-.7.77-1.18.14-.35.3-.9.35-1.9.06-1.24.07-1.58.07-4.74s-.01-3.5-.07-4.74c-.05-1-.21-1.55-.35-1.9a3.1 3.1 0 0 0-.77-1.18 3.1 3.1 0 0 0-1.18-.77c-.35-.14-.9-.3-1.9-.35-1.24-.06-1.58-.07-4.74-.07Zm0 4.06a5.94 5.94 0 1 1 0 11.88 5.94 5.94 0 0 1 0-11.88Zm0 1.8a4.14 4.14 0 1 0 0 8.28 4.14 4.14 0 0 0 0-8.28Zm6.17-2a1.39 1.39 0 1 1-2.78 0 1.39 1.39 0 0 1 2.78 0Z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 hover:text-base-white">
      <path d="M13.5 21v-7.9h2.65l.4-3.08H13.5V8.13c0-.89.25-1.5 1.52-1.5h1.63V3.87A21.9 21.9 0 0 0 14.24 3.7c-2.35 0-3.96 1.43-3.96 4.06v2.26H7.62v3.08h2.66V21h3.22Z" />
    </svg>
  );
}
