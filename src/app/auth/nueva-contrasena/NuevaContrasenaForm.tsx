"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange";

/**
 * Pantalla para elegir una contraseña nueva después de tocar el link del
 * mail de recuperación. El link de Supabase deja una sesión temporal; acá
 * solo se usa para cambiar la contraseña.
 */
export function NuevaContrasenaForm() {
  const [listo, setListo] = useState<"cargando" | "si" | "no">("cargando");
  const [password, setPassword] = useState("");
  const [repetir, setRepetir] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let cancelado = false;
    // El cliente toma la sesión del link (en el # de la URL) al iniciar; se
    // le da un momento antes de concluir que no hay sesión.
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, sesion) => {
      if (sesion && !cancelado) setListo("si");
    });
    const t = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelado) setListo(data.session ? "si" : "no");
    }, 1200);
    return () => {
      cancelado = true;
      clearTimeout(t);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== repetir) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setEnviando(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setEnviando(false);
    if (err) {
      setError("No pudimos cambiar la contraseña. Pedí un link nuevo e intentá de nuevo.");
      return;
    }
    setGuardado(true);
    await supabase.auth.signOut();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-base-border bg-base-surface p-8">
        <h1 className="mb-4 text-xl font-bold text-base-white">Nueva contraseña</h1>

        {guardado ? (
          <div className="flex flex-col gap-4 text-sm text-base-muted">
            <p>Listo, cambiaste tu contraseña. Ya podés iniciar sesión con la nueva.</p>
            <a
              href="/admin/login"
              className="rounded-xl bg-brand-orange py-3 text-center font-bold text-white hover:bg-brand-orange-dark"
            >
              Ir al panel
            </a>
          </div>
        ) : listo === "cargando" ? (
          <p className="text-sm text-base-muted">Verificando el link…</p>
        ) : listo === "no" ? (
          <p className="text-sm text-base-muted">
            El link venció o ya se usó. Pedí uno nuevo desde Supabase (Send password recovery) y
            abrilo una sola vez.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Contraseña nueva"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="Repetí la contraseña"
              value={repetir}
              onChange={(e) => setRepetir(e.target.value)}
              className={inputClass}
            />
            {error && (
              <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="rounded-xl bg-brand-orange py-3 text-sm font-bold text-white hover:bg-brand-orange-dark disabled:opacity-60"
            >
              {enviando ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
