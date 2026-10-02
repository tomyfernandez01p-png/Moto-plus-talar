"use client";

import { useState } from "react";

/**
 * Input del número de WhatsApp con vista previa en vivo del link que se va
 * a generar (wa.me/<dígitos>). Avisa si el número no empieza con el código
 * de país (54 para Argentina) — el error más común es escribir el viejo
 * prefijo local "15" en vez de "54", lo que genera un link inválido que
 * WhatsApp rechaza con "no es un número de teléfono válido".
 */
export function WhatsappInput({
  defaultValue,
  inputClass,
}: {
  defaultValue: string;
  inputClass: string;
}) {
  const [valor, setValor] = useState(defaultValue);
  const digitos = valor.replace(/\D/g, "");
  const faltaCodigoPais = digitos.length > 0 && !digitos.startsWith("54");

  return (
    <div>
      <input
        name="whatsapp"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        placeholder="+54 9 11 2297-8803"
        className={inputClass}
      />
      {digitos.length > 0 && (
        <p className={`mt-1 text-xs ${faltaCodigoPais ? "text-brand-orange" : "text-base-muted"}`}>
          {faltaCodigoPais
            ? `⚠ No empieza con 54 (código de país). Si usaste "15", reemplazalo por "54" o el link (wa.me/${digitos}) va a ser inválido.`
            : `Link que se va a generar: wa.me/${digitos}`}
        </p>
      )}
    </div>
  );
}
