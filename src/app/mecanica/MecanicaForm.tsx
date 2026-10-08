"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeSolicitudMecanica } from "@/lib/whatsapp";
import { crearSolicitudMecanicaAction } from "./actions";

interface ServicioMecanica {
  id: string;
  nombre: string;
  descripcion: string | null;
}

const inputClass =
  "w-full rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange";

export function MecanicaForm({
  servicios,
  config,
}: {
  servicios: ServicioMecanica[];
  config: Configuracion;
}) {
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [disclaimerAceptado, setDisclaimerAceptado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ numero: number; mensajeWhatsapp: string } | null>(
    null
  );

  function toggleServicio(id: string) {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (serviciosSeleccionados.length === 0) {
      setError("Elegí al menos un servicio.");
      return;
    }
    if (!disclaimerAceptado) {
      setError("Tenés que aceptar la confirmación para poder enviar el pedido de turno.");
      return;
    }

    const form = new FormData(e.currentTarget);
    setEnviando(true);

    const nombre = String(form.get("nombre") || "");
    const apellido = String(form.get("apellido") || "");
    const telefono = String(form.get("telefono") || "");
    const motoMarca = String(form.get("motoMarca") || "");
    const motoModelo = String(form.get("motoModelo") || "");
    const descripcionProblema = String(form.get("descripcionProblema") || "");
    const repuestoCliente = String(form.get("repuestoCliente") || "");

    const respuesta = await crearSolicitudMecanicaAction({
      nombre,
      apellido,
      telefono,
      email: String(form.get("email") || ""),
      motoMarca,
      motoModelo,
      serviciosIds: serviciosSeleccionados,
      descripcionProblema,
      repuestoCliente,
      disclaimerAceptado,
    });

    setEnviando(false);

    if (!respuesta.ok) {
      setError(respuesta.error);
      return;
    }

    const nombresServicios = servicios
      .filter((s) => serviciosSeleccionados.includes(s.id))
      .map((s) => s.nombre);

    const mensajeWhatsapp = mensajeSolicitudMecanica({
      numero: respuesta.numero,
      nombre,
      apellido,
      telefono,
      motoMarca,
      motoModelo,
      servicios: nombresServicios,
      descripcionProblema,
      repuestoCliente,
    });

    setResultado({ numero: respuesta.numero, mensajeWhatsapp });
  }

  if (resultado) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
        <h2 className="text-xl font-bold text-base-white">¡Pedido de turno recibido!</h2>
        <p className="mt-1 text-sm text-base-muted">
          Solicitud #{resultado.numero} · La vamos a revisar y te confirmamos el turno a la brevedad.
        </p>
        <p className="mt-3 text-sm text-base-muted">
          Para acelerar la confirmación, mandanos el resumen por WhatsApp:
        </p>
        <ButtonLink
          href={whatsappLink(config, resultado.mensajeWhatsapp)}
          target="_blank"
          className="mt-4"
          size="lg"
        >
          Enviar resumen por WhatsApp
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">
          ¿Qué necesita tu moto?
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {servicios.map((servicio) => {
            const marcado = serviciosSeleccionados.includes(servicio.id);
            return (
              <label
                key={servicio.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm transition-colors ${
                  marcado ? "border-brand-orange bg-brand-orange/10" : "border-base-border"
                }`}
              >
                <input
                  type="checkbox"
                  checked={marcado}
                  onChange={() => toggleServicio(servicio.id)}
                  className="mt-0.5 h-4 w-4 accent-brand-orange"
                />
                <span className="text-base-white">{servicio.nombre}</span>
              </label>
            );
          })}
        </div>
        <textarea
          name="descripcionProblema"
          rows={3}
          placeholder="Contanos qué le pasa a la moto (opcional)"
          className={inputClass}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">Tu moto</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="motoMarca" placeholder="Marca (ej: Honda)" className={inputClass} />
          <input name="motoModelo" placeholder="Modelo (ej: Wave 110)" className={inputClass} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">Tus datos</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="nombre" required placeholder="Nombre" className={inputClass} />
          <input name="apellido" required placeholder="Apellido" className={inputClass} />
          <input
            name="telefono"
            required
            placeholder="Teléfono (ej: 11 2297-8803, sin 0 ni 15)"
            className={inputClass}
          />
          <input name="email" type="email" placeholder="Email (opcional)" className={inputClass} />
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-brand-orange">
          Repuesto a usar (opcional)
        </h2>
        <p className="text-xs text-base-muted">
          Si ya tenés en mente qué repuesto querés que te coloquemos (por marca, calidad o precio),
          contanoslo acá. Queda registrado tal cual lo pedís.
        </p>
        <input
          name="repuestoCliente"
          placeholder="Ej: quiero que me pongan una pastilla de freno marca X, la más económica"
          className={inputClass}
        />
      </section>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-base-border bg-base-surface p-4 text-sm">
        <input
          type="checkbox"
          checked={disclaimerAceptado}
          onChange={(e) => setDisclaimerAceptado(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4 accent-brand-orange"
        />
        <span className="text-base-muted">
          Entiendo que el diagnóstico final lo confirma el mecánico al revisar la moto, y que si yo
          elijo expresamente un repuesto puntual (por marca, calidad o precio), acepto esa elección
          y no voy a reclamar por su rendimiento o duración frente a otras opciones disponibles.
        </span>
      </label>

      {error && (
        <p role="alert" className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-xl border border-brand-orange/70 bg-base-black py-4 text-base font-bold text-base-white shadow-glow-sm transition-all duration-200 hover:border-brand-orange hover:bg-base-dark hover:shadow-glow active:scale-95 active:shadow-none disabled:pointer-events-none disabled:opacity-60"
      >
        {enviando ? "Enviando pedido…" : "Pedir turno"}
      </button>
      <p className="text-center text-xs text-base-muted">
        Esto no confirma el turno automáticamente: lo revisamos y te contactamos para coordinar.
      </p>
    </form>
  );
}
