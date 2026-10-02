import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeConsultaFoto } from "@/lib/whatsapp";
import { ButtonLink } from "@/components/ui/Button";
import { IconWhatsApp } from "@/components/ui/Icons";

/**
 * Banner interactivo (brief #16). IMPORTANTE: el brief cita un número fijo
 * ("11-2297-8803" / wa.me/1122978803) y dice "no modificar este número" --
 * pero ese es exactamente el formato viejo e inválido (sin código de país)
 * que se corrigió esta misma semana en toda la base. Usar ese número
 * literal volvería a romper el link. En su lugar se usa la configuración
 * central real (`whatsappLink()`), que es además lo que pide el brief #17:
 * "No hardcodear múltiples números. Utilizar la configuración central
 * existente."
 */
export function WhatsAppBanner({ config }: { config: Configuracion }) {
  if (!config.whatsapp_link) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-[#25D366]/25 bg-gradient-to-br from-[#0b2a1d] via-base-dark to-base-dark p-6 md:p-10">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#25D366]/15 blur-3xl"
        />
        <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#25D366]/15 text-[#25D366] sm:flex">
              <IconWhatsApp className="h-7 w-7" />
            </span>
            <div>
              <h2 className="text-xl font-bold text-base-white md:text-2xl">
                ¿No sabés qué repuesto necesitás?
              </h2>
              <p className="mt-1 max-w-md text-sm text-base-muted">
                Mandanos una foto por WhatsApp y te ayudamos a encontrarlo.
              </p>
            </div>
          </div>
          <ButtonLink
            href={whatsappLink(config, mensajeConsultaFoto())}
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            className="w-full shrink-0 bg-[#25D366] text-white hover:bg-[#1fb857] md:w-auto"
          >
            <IconWhatsApp className="h-5 w-5" />
            Hablar por WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
