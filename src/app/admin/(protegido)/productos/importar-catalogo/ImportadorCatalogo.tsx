"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { vincularImagenProductoAction, vincularLogoMarcaAction, revalidarCatalogoAction } from "./actions";

interface Item {
  slug: string;
  archivo: string;
}
interface Manifest {
  productos: Item[];
  marcas: Item[];
}

export function ImportadorCatalogo() {
  const [corriendo, setCorriendo] = useState(false);
  const [progreso, setProgreso] = useState("");
  const [ok, setOk] = useState(0);
  const [errores, setErrores] = useState<string[]>([]);

  async function importar() {
    setCorriendo(true);
    setErrores([]);
    setOk(0);
    const fallos: string[] = [];
    let hechos = 0;
    try {
      const res = await fetch("/import-catalogo/manifest.json", { cache: "no-store" });
      if (!res.ok) throw new Error("No se encontró el manifiesto de importación.");
      const man = (await res.json()) as Manifest;
      const supabase = createClient();
      const total = man.marcas.length + man.productos.length;

      const tareas: { tipo: "marca" | "producto"; it: Item }[] = [
        ...man.marcas.map((it) => ({ tipo: "marca" as const, it })),
        ...man.productos.map((it) => ({ tipo: "producto" as const, it })),
      ];

      for (let i = 0; i < tareas.length; i++) {
        const { tipo, it } = tareas[i];
        setProgreso(`${i + 1} de ${total}: ${it.slug}`);
        try {
          const r = await fetch(`/import-catalogo/${it.archivo}`, { cache: "no-store" });
          if (!r.ok) throw new Error("archivo no disponible");
          const blob = await r.blob();
          const nombreArchivo = it.archivo.split("/").pop()!;
          const ruta = `catalogo/${tipo === "marca" ? "marcas" : "productos"}/${nombreArchivo}`;
          const { error } = await supabase.storage
            .from("public-assets")
            .upload(ruta, blob, { contentType: blob.type || undefined, upsert: true });
          if (error) throw new Error(error.message);
          const url = supabase.storage.from("public-assets").getPublicUrl(ruta).data.publicUrl;
          const v =
            tipo === "marca"
              ? await vincularLogoMarcaAction(it.slug, url)
              : await vincularImagenProductoAction(it.slug, url);
          if (!v.ok) throw new Error(v.mensaje ?? "no se pudo vincular");
          hechos++;
        } catch (e) {
          fallos.push(`${it.slug}: ${e instanceof Error ? e.message : "error"}`);
        }
        setOk(hechos);
      }
      await revalidarCatalogoAction();
      setProgreso(`Terminado: ${hechos} de ${total} vinculados.`);
    } catch (e) {
      fallos.push(e instanceof Error ? e.message : "Error inesperado");
      setProgreso("Se detuvo por un error.");
    } finally {
      setErrores(fallos);
      setCorriendo(false);
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={importar} disabled={corriendo}>
        {corriendo ? "Importando…" : "Importar fotos y logos"}
      </Button>
      {progreso && (
        <p className="text-sm text-base-white" role="status">
          {progreso} {ok > 0 && `(${ok} listos)`}
        </p>
      )}
      {errores.length > 0 && (
        <div className="rounded-lg border border-base-border bg-base-surface p-3 text-sm">
          <p className="mb-1 font-semibold text-base-white">{errores.length} sin vincular</p>
          <ul className="max-h-60 list-disc space-y-0.5 overflow-auto pl-5 text-base-muted">
            {errores.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
