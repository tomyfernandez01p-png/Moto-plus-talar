import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { cerrarSesionAction } from "@/app/cuenta/actions";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

const nav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/productos/importar-catalogo", label: "Importar fotos y logos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/marcas", label: "Marcas" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/mecanica", label: "Turnos de mecánica" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/banners", label: "Banners" },
  // Solo administrador: incluye claves públicas de integraciones, textos
  // legales y datos de contacto del negocio.
  { href: "/admin/configuracion", label: "Configuración", soloAdmin: true },
  { href: "/admin/historial", label: "Historial / auditoría", soloAdmin: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  const { data: perfil } = await supabase.from("perfiles").select("*").eq("id", user.id).single();

  if (!perfil || perfil.rol === "cliente" || !perfil.activo) {
    redirect("/admin/login");
  }

  const navVisible = nav.filter((item) => !item.soloAdmin || perfil.rol === "administrador");

  return (
    <div className="flex min-h-screen bg-base-black">
      <aside className="hidden w-60 shrink-0 flex-col overflow-y-auto border-r border-base-border bg-base-dark p-4 md:flex">
        <span className="mb-6 px-2 text-sm font-bold text-base-white">Moto Plus Talar</span>
        <nav className="flex flex-col gap-1">
          {navVisible.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-base-muted hover:bg-base-surface hover:text-base-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-2 border-t border-base-border pt-4">
          <span className="px-3 text-xs text-base-muted">
            {perfil.nombre || user.email} · {perfil.rol}
          </span>
          <ThemeToggle className="w-full rounded-lg px-3 py-2 text-left text-sm text-base-muted hover:bg-base-surface hover:text-base-white" />
          <form action={cerrarSesionAction}>
            <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-base-muted hover:bg-base-surface hover:text-base-white">
              Cerrar sesión
            </button>
          </form>
          <Link href="/" className="px-3 text-xs text-base-muted hover:text-base-white">
            ← Volver al sitio
          </Link>
        </div>
      </aside>

      <div className="flex-1">
        {/* Menú mobile: <details>/<summary> nativo, no necesita JS de cliente.
            La sidebar de arriba está oculta en mobile (hidden md:flex), así
            que sin esto no había ninguna forma de navegar entre secciones
            del admin desde el celular. */}
        <details className="border-b border-base-border bg-base-dark p-4 md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold text-base-white">
            <span>Admin — Moto Plus Talar</span>
            <span className="text-base-muted">☰</span>
          </summary>
          <nav className="mt-3 flex flex-col gap-1">
            {navVisible.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-base-muted hover:bg-base-surface hover:text-base-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-base-border pt-3">
            <span className="px-3 text-xs text-base-muted">
              {perfil.nombre || user.email} · {perfil.rol}
            </span>
            <ThemeToggle className="w-full rounded-lg px-3 py-2 text-left text-sm text-base-muted hover:bg-base-surface hover:text-base-white" />
            <form action={cerrarSesionAction}>
              <button className="w-full rounded-lg px-3 py-2 text-left text-sm text-base-muted hover:bg-base-surface hover:text-base-white">
                Cerrar sesión
              </button>
            </form>
            <Link href="/" className="px-3 text-xs text-base-muted hover:text-base-white">
              ← Volver al sitio
            </Link>
          </div>
        </details>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
