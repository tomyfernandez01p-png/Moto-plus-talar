"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ButtonLink } from "@/components/ui/Button";

export default function RegistroPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCargando(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    });
    setCargando(false);

    if (error) {
      setError(error.message.includes("already registered") ? "Ese email ya está registrado." : "No pudimos crear tu cuenta.");
      return;
    }

    if (data.session) {
      router.push("/cuenta");
      router.refresh();
    } else {
      setExito(true);
    }
  }

  if (exito) {
    return (
      <div className="mx-auto max-w-sm px-4 py-16 text-center md:px-6">
        <h1 className="mb-2 text-xl font-bold text-base-white">Confirmá tu email</h1>
        <p className="text-sm text-base-muted">
          Te enviamos un link de confirmación a {email}. Una vez confirmado ya podés ingresar.
        </p>
        {/* Pedido del usuario: un botón que lleve directo a Gmail desde
            acá, para no tener que buscar el mail por su cuenta. */}
        <ButtonLink
          href="https://mail.google.com/mail/u/0/#inbox"
          target="_blank"
          rel="noopener noreferrer"
          size="lg"
          className="mx-auto mt-6"
        >
          Abrir Gmail
        </ButtonLink>
        <p className="mt-4 text-xs text-base-muted">
          ¿Usás otro correo? Buscá el mail de Moto Plus Talar en la bandeja de entrada de {email} (revisá también spam).
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          required
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white"
        />
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
          minLength={6}
          placeholder="Contraseña (mínimo 6 caracteres)"
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
          {cargando ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-sm text-base-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/login" className="text-brand-orange hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}
