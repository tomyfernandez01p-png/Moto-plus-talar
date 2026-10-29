"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

const STORAGE_KEY = "mpt_cookie_consent";
export const EVENTO_CONSENTIMIENTO = "mpt:cookie-consent";

/**
 * Google Analytics 4. Solo se carga si hay un ID cargado en el admin
 * (Configuración → Google) Y la persona aceptó las cookies. Si rechaza o
 * elige "solo esenciales", no se carga nada.
 */
export function GoogleAnalytics({ id }: { id: string | null | undefined }) {
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    function leer() {
      try {
        setPermitido(window.localStorage.getItem(STORAGE_KEY) === "aceptado");
      } catch {
        setPermitido(false);
      }
    }
    leer();
    window.addEventListener(EVENTO_CONSENTIMIENTO, leer);
    return () => window.removeEventListener(EVENTO_CONSENTIMIENTO, leer);
  }, []);

  const limpio = (id ?? "").trim();
  if (!permitido || !/^G-[A-Z0-9]+$/i.test(limpio)) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${limpio}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${limpio}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}
