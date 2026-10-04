"use client";

import { usePathname } from "next/navigation";

/**
 * El layout raíz (`app/layout.tsx`) es el único lugar donde se puede montar
 * el Header/Footer/bottom-nav/WhatsApp flotante una sola vez para todo el
 * sitio -- pero por eso mismo, antes de este componente, esas piezas
 * quedaban SIEMPRE montadas en TODAS las rutas, sin forma de "apagarlas"
 * desde una ruta hija (un layout anidado solo puede agregar UI, nunca
 * sacar la del padre). Eso generaba dos problemas reales:
 *
 * 1. /login y /registro (pantallas de una sola tarea) mostraban encima el
 *    header completo, la bottom-nav y un borde del footer -- justo lo que
 *    reportó el usuario en la captura.
 * 2. /admin y /admin/login (que ya arman su propio layout de panel)
 *    terminaban con el header/footer público ENCIMA de ese panel -- un bug
 *    que ya existía, no introducido en este cambio, pero que viola el
 *    mismo principio del brief ("el admin queda completamente separado").
 *
 * Como Header/Footer son Server Components (hacen fetch a Supabase), no
 * pueden usar `usePathname()` directamente. Por eso layout.tsx los renderiza
 * y se los pasa como `children`/props a este Client Component, que es el
 * único que decide, según la ruta, si se muestran o no -- patrón estándar
 * de "server component as children of a client component" de Next.js.
 */
const RUTAS_SIN_CHROME = ["/login", "/registro"];

export function SiteChrome({
  header,
  footer,
  whatsappFloat,
  turnosFloat,
  bottomNav,
  children,
}: {
  header: React.ReactNode;
  footer: React.ReactNode;
  whatsappFloat: React.ReactNode;
  turnosFloat: React.ReactNode;
  bottomNav: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/admin");
  const esPantallaFocalizada = RUTAS_SIN_CHROME.some((r) => pathname === r);

  if (esAdmin) {
    // El panel de admin ya arma su propio layout completo (sidebar +
    // <main> propio en admin/(protegido)/layout.tsx): nada del sitio
    // público se monta encima.
    return <>{children}</>;
  }

  if (esPantallaFocalizada) {
    // Login/registro: pantalla de una sola tarea, sin header/footer/bottom
    // nav/WhatsApp flotante. Mantiene el landmark <main> que tenía antes.
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      {header}
      <main className="min-h-[60vh]">{children}</main>
      {footer}
      {whatsappFloat}
      {turnosFloat}
      {bottomNav}
    </>
  );
}
