import type { Configuracion } from "@/lib/config";

export function AnnouncementBar({ config }: { config: Configuracion }) {
  const anuncio = config.anuncio_barra;
  if (!anuncio?.activo || !anuncio.texto) return null;

  return (
    <div
      className="w-full py-2 text-center text-xs font-semibold text-white"
      style={{ backgroundColor: anuncio.color || "#FF6A00" }}
    >
      {anuncio.texto}
    </div>
  );
}
