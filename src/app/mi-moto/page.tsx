import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { buscarProductos } from "@/lib/productos";
import { ProductGrid } from "@/components/product/ProductGrid";
import { BuscadorMoto } from "@/components/home/BuscadorMoto";
import { getConfiguracion } from "@/lib/config.server";
import { whatsappLink } from "@/lib/config";
import { mensajeCompatibilidadMoto } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/ui/Icons";

export const metadata: Metadata = { title: "¿Qué moto tenés?" };

export default async function MiMotoPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const supabase = createClient();
  const config = await getConfiguracion();
  const { data: motos } = await supabase.from("motos").select("*").eq("activo", true);

  const { marca_moto, modelo_moto, anio } = searchParams;
  const hayBusqueda = !!marca_moto;

  const { productos, total } = hayBusqueda
    ? await buscarProductos({
        marcaMoto: marca_moto,
        modeloMoto: modelo_moto,
        anioMoto: anio ? Number(anio) : undefined,
      })
    : { productos: [], total: 0 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white">¿Qué moto tenés?</h1>
      <p className="mb-6 text-sm text-base-muted">
        Elegí marca, modelo y año para ver los repuestos y accesorios compatibles.
      </p>

      <BuscadorMoto motos={motos ?? []} />

      {hayBusqueda && total > 0 && (
        <div className="mt-8">
          <p className="mb-4 text-sm text-base-muted">
            {total} {total === 1 ? "producto compatible" : "productos compatibles"} con {marca_moto} {modelo_moto} {anio}
          </p>
          <ProductGrid productos={productos} />
        </div>
      )}

      {hayBusqueda && total === 0 && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-2xl border border-base-border bg-base-surface p-6">
          <h2 className="text-lg font-bold text-base-white">
            Todavía no tenemos productos cargados para {[marca_moto, modelo_moto, anio].filter(Boolean).join(" ")}
          </h2>
          <p className="text-sm text-base-muted">
            Eso no significa que no tengamos repuestos para tu moto: todavía no cargamos su compatibilidad.
            Consultanos y te confirmamos qué tenemos.
          </p>
          {config.whatsapp_link && (
            <a
              href={whatsappLink(
                config,
                mensajeCompatibilidadMoto({ marca: marca_moto ?? "", modelo: modelo_moto, anio })
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 active:scale-95"
            >
              <IconWhatsApp className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
          )}
        </div>
      )}

      {(motos ?? []).length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-base-border p-8 text-center text-sm text-base-muted">
          Todavía no hay motos cargadas en el catálogo de compatibilidad. Pronto vamos a sumar más modelos.
        </div>
      )}
    </div>
  );
}
