"use client";

import { rutaSegura } from "@/lib/ruta-segura";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

/**
 * Lógica y UI del login de admin, en un Client Component separado de
 * `page.tsx`. Usa `useSearchParams()` (para el redirect `?next=`), que
 * exige estar envuelto en <Suspense> para poder prerenderizar la ruta
 * estáticamente — ver `page.tsx`.
 */
export function AdminLoginForm() {
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

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setCargando(false);
      setError("Email o contraseña incorrectos.");
      return;
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol, activo")
      .eq("id", data.user.id)
      .single();

    if (!perfil || perfil.rol === "cliente" || !perfil.activo) {
      await supabase.auth.signOut();
      setCargando(false);
      setError("Esta cuenta no tiene acceso al panel de administración.");
      return;
    }

    router.push(rutaSegura(searchParams.get("next"), "/admin"));
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-black px-4">
      <div className="w-full max-w-sm rounded-2xl border border-base-border bg-base-surface p-8">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="relative h-14 w-14 overflow-hidden rounded-full">
            <Image src="/brand/logo-placeholder.svg" alt="Moto Plus Talar" fill className="object-cover" />
          </div>
          <h1 className="text-lg font-bold text-base-white">Panel de administración</h1>
        </div>
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
      </div>
    </div>
  );
}
