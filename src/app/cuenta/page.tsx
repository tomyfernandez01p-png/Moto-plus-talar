import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ButtonLink } from "@/components/ui/Button";
import { cerrarSesionAction } from "./actions";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function CuentaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/cuenta");

  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 md:px-6">
      <h1 className="mb-6 text-2xl font-bold text-base-white">Mi cuenta</h1>
      <div className="rounded-2xl border border-base-border bg-base-surface p-6">
        <p className="text-sm text-base-muted">Nombre</p>
        <p className="mb-3 text-base-white">{perfil?.nombre || "—"}</p>
        <p className="text-sm text-base-muted">Email</p>
        <p className="mb-3 text-base-white">{user.email}</p>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <ButtonLink href="/cuenta/pedidos" variant="secondary">
          Mis pedidos
        </ButtonLink>
        <form action={cerrarSesionAction}>
          <button type="submit" className="rounded-xl border border-base-border px-4 py-2.5 text-sm text-base-white hover:bg-base-surface">
            Cerrar sesión
          </button>
        </form>
      </div>

      {perfil?.rol !== "cliente" && (
        <p className="mt-4 text-sm text-base-muted">
          Tenés acceso al{" "}
          <Link href="/admin" className="text-brand-orange hover:underline">
            panel de administración
          </Link>
          .
        </p>
      )}
    </div>
  );
}
