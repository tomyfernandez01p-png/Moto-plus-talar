import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Tienda" };

const bloques = [
  { href: "/admin/productos", titulo: "Productos", texto: "Precios, stock, fotos, ofertas y compatibilidades." },
  { href: "/admin/categorias", titulo: "Categorías", texto: "Ordená y editá las categorías del catálogo." },
  { href: "/admin/banners", titulo: "Banners", texto: "Publicidad y promociones del inicio." },
  {
    href: "/admin/productos/importar-catalogo",
    titulo: "Fotos y logos",
    texto: "Subí las fotos y logos recuperados de los catálogos en PDF.",
  },
  {
    href: "/admin/configuracion",
    titulo: "Configuración",
    texto: "Datos del negocio, envíos, pagos, WhatsApp y secciones del inicio.",
    soloAdmin: true,
  },
];

export default async function AdminTiendaPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from("perfiles").select("rol").eq("id", user?.id ?? "").single();
  const esAdmin = perfil?.rol === "administrador";

  return (
    <div className="max-w-4xl">
      <h1 className="mb-1 text-2xl font-bold text-base-white">Tienda</h1>
      <p className="mb-6 text-sm text-base-muted">Todo lo que se configura del shop, en un solo lugar.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {bloques
          .filter((b) => !b.soloAdmin || esAdmin)
          .map((b) => (
            <Link
              key={b.href}
              href={b.href}
              className="rounded-2xl border border-base-border bg-base-surface p-5 transition-colors hover:border-brand-orange/50"
            >
              <h2 className="text-base font-bold text-base-white">{b.titulo}</h2>
              <p className="mt-1 text-sm text-base-muted">{b.texto}</p>
            </Link>
          ))}
      </div>
    </div>
  );
}
