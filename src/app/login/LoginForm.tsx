"use client";

import { rutaSegura } from "@/lib/ruta-segura";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

/**
 * Lógica y UI del login, en un Client Component separado de `page.tsx`.
 * Usa `useSearchParams()` (para el redirect `?next=`), que en el App Router
 * de Next.js exige que el componente esté envuelto en <Suspense> cuando la
 * página se prerenderiza estáticamente — por eso vive acá y no directo en
 * `page.tsx` (ver ese archivo).
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setCargando(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.push(rutaSegura(searchParams.get("next"), "/cuenta"));
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Ingresar</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white"
        />
        <input
          type="password"
          required
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="rounded-xl bg-brand-orange py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {cargando ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
      <p className="mt-4 text-sm text-base-muted">
        ¿No tenés cuenta?{" "}
        <Link href="/registro" className="text-brand-orange hover:underline">
          Creá una
        </Link>
      </p>
    </div>
  );
}
