import { createClient } from "@/lib/supabase/server";
import { getConfiguracion } from "@/lib/config.server";
import { Hero } from "@/components/home/Hero";
import { Beneficios } from "@/components/home/Beneficios";
import { CategoriasGrid } from "@/components/home/CategoriasGrid";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { MarcasCarousel } from "@/components/home/MarcasCarousel";
import { BuscadorMoto } from "@/components/home/BuscadorMoto";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import { InfoLocalYRedes } from "@/components/home/InstagramCTA";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const revalidate = 60;

export default async function HomePage() {
  const config = await getConfiguracion();
  const supabase = createClient();
  const secciones = config.secciones_home ?? {};

  const [
    { data: categorias },
    { data: destacados },
    { data: ofertas },
    { data: nuevos },
    { data: marcas },
    { data: motos },
  ] = await Promise.all([
    supabase
      .from("categorias")
      .select("nombre, slug, imagen_url")
      .is("categoria_padre_id", null)
      .eq("activo", true)
      .order("orden"),
    secciones.destacados
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("destacado", true)
          .order("fecha_alta", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.ofertas
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("en_oferta", true)
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.nuevos
      ? supabase
          .from("vista_productos")
          .select("*")
          .eq("activo", true)
          .eq("es_nuevo", true)
          .order("fecha_alta", { ascending: false })
          .limit(12)
      : Promise.resolve({ data: [] }),
    secciones.marcas
      ? supabase.from("marcas").select("nombre, slug, logo_url").eq("activo", true).order("orden")
      : Promise.resolve({ data: [] }),
    secciones.buscador_moto
      ? supabase.from("motos").select("*").eq("activo", true)
      : Promise.resolve({ data: [] }),
  ]);

  return (
    <>
      {secciones.hero !== false && <Hero config={config} />}
      {secciones.buscador_moto && (
        <ScrollReveal>
          <BuscadorMoto motos={motos ?? []} />
        </ScrollReveal>
      )}
      {secciones.categorias !== false && (
        <ScrollReveal className="bg-base-dark/60">
          <CategoriasGrid categorias={categorias ?? []} />
        </ScrollReveal>
      )}
      {secciones.destacados && (
        <ScrollReveal>
          <ProductCarousel titulo="Productos destacados" productos={destacados ?? []} verTodoHref="/productos?destacado=1" />
        </ScrollReveal>
      )}
      {secciones.ofertas && (
        <ScrollReveal className="bg-base-dark/60">
          <ProductCarousel titulo="En oferta" productos={ofertas ?? []} verTodoHref="/productos?oferta=1" />
        </ScrollReveal>
      )}
      {secciones.nuevos && (
        <ScrollReveal>
          <ProductCarousel titulo="Recién llegados" productos={nuevos ?? []} verTodoHref="/productos?nuevo=1" />
        </ScrollReveal>
      )}
      {secciones.marcas && (
        <ScrollReveal className="bg-base-dark/60">
          <MarcasCarousel marcas={marcas ?? []} />
        </ScrollReveal>
      )}
      {secciones.beneficios !== false && (
        <ScrollReveal>
          <Beneficios />
        </ScrollReveal>
      )}
      {secciones.reviews && (
        <ScrollReveal>
          <GoogleReviews config={config} />
        </ScrollReveal>
      )}
      <ScrollReveal className="bg-base-dark/60">
        <InfoLocalYRedes config={config} />
      </ScrollReveal>
    </>
  );
}
