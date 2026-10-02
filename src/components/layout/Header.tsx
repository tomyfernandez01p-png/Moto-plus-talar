import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { AnnouncementBar } from "./AnnouncementBar";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { CartButton } from "./CartButton";
import { AccountButton } from "./AccountButton";
import { ThemeToggle } from "./ThemeToggle";

export async function Header() {
  const config = await getConfiguracion();
  const supabase = createClient();
  const { data: categorias } = await supabase
    .from("categorias")
    .select("nombre, slug")
    .is("categoria_padre_id", null)
    .eq("activo", true)
    .order("orden");

  return (
    <header className="sticky top-0 z-30 border-b border-base-border bg-base-dark/95 backdrop-blur">
      <AnnouncementBar config={config} />

      {/* fila superior: cuenta / whatsapp — solo desktop */}
      <div className="hidden border-b border-base-border/60 bg-base-black md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-6 py-1.5 text-xs text-base-muted">
          <ThemeToggle className="hover:text-base-white" />
          {config.cuentas_clientes_activas && (
            <Link href="/cuenta" className="hover:text-base-white">
              Mi cuenta
            </Link>
          )}
          {config.whatsapp && (
            <a
              href={config.whatsapp_link ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-base-white"
            >
              WhatsApp {config.whatsapp}
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
        <MobileMenu
          categorias={categorias ?? []}
          cuentasActivas={config.cuentas_clientes_activas}
        />

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-full">
            <Image
              src={config.logo_url || "/brand/logo-placeholder.svg"}
              alt={config.nombre_negocio}
              fill
              className="object-cover"
            />
          </div>
          <span className="hidden text-lg font-extrabold tracking-tight text-base-white sm:block">
            {config.nombre_negocio}
          </span>
        </Link>

        <SearchBar className="mx-2 hidden flex-1 md:block" />

        <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-base-white md:flex">
          <Link href="/" className="hover:text-brand-orange">
            Inicio
          </Link>
          {categorias && categorias.length > 0 && (
            <div className="group relative">
              <button
                type="button"
                className="flex items-center gap-1 hover:text-brand-orange"
              >
                Categorías
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>
              <div className="invisible absolute left-0 top-full z-40 w-64 translate-y-1 rounded-xl border border-base-border bg-base-dark p-2 opacity-0 shadow-card transition-all duration-200 ease-smooth group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                {categorias.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categoria/${c.slug}`}
                    className="block rounded-lg px-3 py-2 text-sm font-normal text-base-white hover:bg-base-surface hover:text-brand-orange"
                  >
                    {c.nombre}
                  </Link>
                ))}
              </div>
            </div>
          )}
          <Link href="/productos" className="hover:text-brand-orange">
            Tienda
          </Link>
          <Link href="/mi-moto" className="hover:text-brand-orange">
            ¿Qué moto tenés?
          </Link>
          <Link href="/nosotros" className="hover:text-brand-orange">
            Nosotros
          </Link>
          <Link href="/contacto" className="hover:text-brand-orange">
            Contacto
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          {config.cuentas_clientes_activas && <AccountButton />}
          <CartButton />
        </div>
      </div>

      <div className="border-t border-base-border/60 px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
