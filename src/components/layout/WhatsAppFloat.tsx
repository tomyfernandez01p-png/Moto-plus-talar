"use client";

import { usePathname } from "next/navigation";
import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeGenerico } from "@/lib/whatsapp";
import { IconWhatsApp } from "@/components/ui/Icons";

export function WhatsAppFloat({ config }: { config: Configuracion }) {
  const pathname = usePathname();
  if (!config.whatsapp_link) return null;
  // El admin queda completamente separado del sitio público (brief #21/#34):
  // ningún elemento flotante del storefront se superpone a sus pantallas.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={whatsappLink(config, mensajeGenerico())}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card animate-pulse-ring transition-transform duration-200 ease-smooth hover:scale-110 hover:animate-none md:bottom-6"
    >
      <IconWhatsApp className="h-7 w-7" />
    </a>
  );
}
