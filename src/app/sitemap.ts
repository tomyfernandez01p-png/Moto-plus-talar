import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const supabase = createClient();

  const [{ data: productos }, { data: categorias }, { data: marcas }] = await Promise.all([
    supabase.from("productos").select("slug, fecha_modificacion").eq("activo", true),
    supabase.from("categorias").select("slug").eq("activo", true),
    supabase.from("marcas").select("slug").eq("activo", true),
  ]);

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, changeFrequency: "daily", priority: 1 },
    { url: `${siteUrl}/productos`, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/mi-moto`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/mecanica`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/nosotros`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/contacto`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${siteUrl}/preguntas-frecuentes`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const deProductos = (productos ?? []).map((p) => ({
    url: `${siteUrl}/producto/${p.slug}`,
    lastModified: p.fecha_modificacion,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const deCategorias = (categorias ?? []).map((c) => ({
    url: `${siteUrl}/categoria/${c.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const deMarcas = (marcas ?? []).map((m) => ({
    url: `${siteUrl}/marca/${m.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...estaticas, ...deProductos, ...deCategorias, ...deMarcas];
}
