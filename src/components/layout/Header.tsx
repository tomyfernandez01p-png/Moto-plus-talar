import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { AnnouncementBar } from "./AnnouncementBar";
import { SearchBar } from "./SearchBar";
import { HeaderMainRow } from "./HeaderMainRow";
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

      {/* fila superior: cuenta / favoritos / whatsapp — solo desktop */}
      <div className="hidden border-b border-base-border/60 bg-base-black md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-6 px-6 py-1.5 text-xs text-base-muted">
          <ThemeToggle className="hover:text-base-white" />
          <Link href="/favoritos" className="hover:text-base-white">
            Favoritos
          </Link>
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

      <HeaderMainRow config={config} categorias={categorias ?? []} />

      <div className="border-t border-base-border/60 px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
