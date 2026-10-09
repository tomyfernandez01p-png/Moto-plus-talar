"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "mpt_cookie_consent";

export function CookieConsent({ texto }: { texto: string | null }) {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState(false);
  const pathname = usePathname();
  const conBarraInferior = !(
    pathname?.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/registro"
  );

  useEffect(() => {
    try {
      const val = window.localStorage.getItem(STORAGE_KEY);
      if (!val) setVisible(true);
    } catch {
      // si localStorage no está disponible, no bloqueamos la navegación
    }
  }, []);

  function guardar(valor: "aceptado" | "rechazado" | "esenciales") {
    try {
      window.localStorage.setItem(STORAGE_KEY, valor);
    } catch {
      // noop
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 z-50 border-t border-base-border bg-base-dark/98 p-4 backdrop-blur",
        // En mobile se apoya ARRIBA de la barra inferior (4rem + zona
        // segura) en vez de taparla: la navegación tiene que seguir
        // accesible mientras el aviso está visible. Donde no hay barra
        // (login, registro, admin) queda pegado abajo.
        conBarraInferior ? "bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0" : "bottom-0"
      )}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-base-muted">
          {texto ?? "Usamos cookies para mejorar tu experiencia."}
        </p>
        <div className="flex flex-wrap gap-2">
          {config && (
            <button
              onClick={() => guardar("esenciales")}
              className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white"
            >
              Solo esenciales
            </button>
          )}
          {!config && (
            <button
              onClick={() => setConfig(true)}
              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-base-muted underline"
            >
              Configurar
            </button>
          )}
          <button
            onClick={() => guardar("rechazado")}
            className="rounded-lg border border-base-border px-3 py-1.5 text-xs font-semibold text-base-white"
          >
            Rechazar no esenciales
          </button>
          <button
            onClick={() => guardar("aceptado")}
            className="rounded-lg border border-brand-orange/70 bg-base-black px-4 py-1.5 text-xs font-semibold text-base-white transition-all duration-200 hover:border-brand-orange hover:bg-base-dark active:scale-95"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}
