import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { TurnosFloat } from "@/components/layout/TurnosFloat";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { CartProvider } from "@/lib/cart/cart-context";
import { FavoritosProvider } from "@/lib/favoritos/FavoritosProvider";
import { getConfiguracion } from "@/lib/config.server";
import { jsonLdScript } from "@/lib/json-ld";

// `viewportFit: "cover"` es lo que hace que env(safe-area-inset-bottom) valga
// algo real en Android/iOS con gestos o notch: sin esto la barra inferior
// calculaba 0px de margen seguro y quedaba pegada a la barra del sistema.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const config = await getConfiguracion();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: config.seo?.title || config.nombre_negocio,
      template: `%s | ${config.nombre_negocio}`,
    },
    description: config.seo?.description || config.rubro || undefined,
    openGraph: {
      title: config.seo?.title || config.nombre_negocio,
      description: config.seo?.description || undefined,
      siteName: config.nombre_negocio,
      locale: "es_AR",
      type: "website",
    },
    icons: { icon: config.logo_url || config.favicon_url || "/brand/logo-placeholder.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const config = await getConfiguracion();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.nombre_negocio,
    image: config.logo_url || undefined,
    telephone: config.whatsapp || undefined,
    email: config.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.direccion || undefined,
      addressLocality: config.ciudad || undefined,
      addressRegion: config.provincia || undefined,
      addressCountry: "AR",
    },
    sameAs: [config.instagram_url, config.facebook_url].filter(Boolean),
  };

  return (
    <html lang="es-AR">
      <body>
        {/* Aplica el tema guardado ANTES del primer paint, para que no se
            vea un flash del tema oscuro (default) si el usuario había
            elegido el claro. Ver ThemeToggle.tsx. */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              if (localStorage.getItem("theme") === "light") {
                document.documentElement.classList.add("theme-light");
              }
            } catch (e) {}
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
        />
        <CartProvider>
          <FavoritosProvider>
            <SiteChrome
              header={<Header />}
              footer={<Footer />}
              whatsappFloat={<WhatsAppFloat config={config} />}
              turnosFloat={<TurnosFloat />}
              bottomNav={<MobileBottomNav cuentasActivas={config.cuentas_clientes_activas} />}
            >
              {children}
            </SiteChrome>
            <CookieConsent texto={config.cookies_texto} />
            <CartDrawer />
          </FavoritosProvider>
        </CartProvider>
      </body>
    </html>
  );
}
