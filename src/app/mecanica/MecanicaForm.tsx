"use client";

import { useState, type ReactNode } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappLink, type Configuracion } from "@/lib/config";
import { mensajeSolicitudMecanica } from "@/lib/whatsapp";
import { crearSolicitudMecanicaAction } from "./actions";

interface ServicioMecanica {
  id: string;
  nombre: string;
  descripcion: string | null;
}

type Modo = "se" | "general" | "nose";

// Nombres de los servicios "comodín" que existen en la tabla `servicios_mecanica`
// y que se envían cuando el cliente no sabe qué necesita. El envío exige al menos
// un servicio, por eso viajan como un servicio más.
const SERVICIO_REVISION_GENERAL = "Revisión general";
const SERVICIO_NO_SE = "No sé qué necesita mi moto (diagnóstico)";

// Cada servicio es un registro de `servicios_mecanica`; acá solo se agrupan para
// mostrarlos. Un servicio que no figure en ninguna categoría no se muestra.
const CATEGORIAS: { titulo: string; icono: ReactNode; items: string[] }[] = [
  {
    titulo: "Mantenimiento y aceite",
    icono: <path d="M12 3s6 6.2 6 10.2A6 6 0 0 1 6 13.2C6 9.2 12 3 12 3Z" />,
    items: [
      "Cambio de aceite",
      "Cambio de filtro de aceite",
      "Cambio de aceite y filtro",
      "Limpieza o reemplazo del filtro de aire",
      "Verificación de bujías",
      "Regulación de válvulas",
      "Ajustes de tornillería",
      "Lubricación de cables",
      "Lubricación general",
      "Ajuste general",
    ],
  },
  {
    titulo: "Frenos y seguridad",
    icono: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 9 2.2 2.2L15.5 10" />,
    items: [
      "Revisión rápida de frenos",
      "Mantenimiento de ambos frenos",
      "Mantenimiento de freno delantero",
      "Mantenimiento de freno trasero",
    ],
  },
  {
    titulo: "Cubiertas y neumáticos",
    icono: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="3" />
        <path d="M12 3.5V9m0 6v5.5M3.5 12H9m6 0h5.5" />
      </>
    ),
    items: [
      "Cambio de cubiertas",
      "Reparación de pinchaduras",
      "Control de presión",
      "Revisión de desgaste",
    ],
  },
  {
    titulo: "Electricidad",
    icono: <path d="M13 2 5 13.5h6L10 22l9-12h-6l0-8Z" />,
    items: [
      "Diagnóstico eléctrico",
      "Revisión de batería y sistema de carga",
      "Verificación de estator y regulador",
      "Cambio de lámparas",
      "Revisión de luces",
      "Mantenimiento eléctrico",
    ],
  },
  {
    titulo: "Transmisión y suspensión",
    icono: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.5v3m0 13v3M2.5 12h3m13 0h3M5.3 5.3l2.1 2.1m9.2 9.2 2.1 2.1m0-13.4-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </>
    ),
    items: [
      "Mantenimiento de transmisión",
      "Tensado y lubricación de cadena",
      "Cambio de transmisión",
      "Revisión y mantenimiento de suspensión",
      "Ajustes y puesta a punto",
    ],
  },
  {
    titulo: "Otros servicios o problemas",
    icono: (
      <path d="M14.7 6.3a4 4 0 0 0-5 5L3.5 17.5 6.5 20.5l6.2-6.2a4 4 0 0 0 5-5l-2.5 2.5-2.2-.5-.5-2.2 2.5-2.5Z" />
    ),
    items: [SERVICIO_REVISION_GENERAL, "Otro servicio o problema"],
  },
];

const MODOS: { id: Modo; titulo: string; detalle: string }[] = [
  { id: "se", titulo: "Sé qué servicio necesito", detalle: "Elijo los servicios" },
  { id: "general", titulo: "Quiero una revisión general", detalle: "Que la revisen completa" },
  { id: "nose", titulo: "No sé qué necesita mi moto", detalle: "Que la diagnostiquen" },
];

const inputClass =
  "w-full rounded-xl border border-base-border bg-base-dark px-4 py-3 text-sm text-base-white placeholder:text-base-muted focus:border-brand-orange focus:outline-none focus:ring-1 focus:ring-brand-orange";

function Icono({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Bloque({ n, titulo, children }: { n: number; titulo: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-base-border bg-base-surface p-4 sm:p-5">
      <h2 className="flex items-center gap-2.5 text-sm font-bold text-base-white">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange text-xs font-bold text-white">
          {n}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

export function MecanicaForm({
  servicios,
  config,
}: {
  servicios: ServicioMecanica[];
  config: Configuracion;
}) {
  const [modo, setModo] = useState<Modo>("se");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [abiertas, setAbiertas] = useState<string[]>([]);
  const [disclaimerAceptado, setDisclaimerAceptado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<{ numero: number; mensajeWhatsapp: string } | null>(
    null
  );

  const categorias = CATEGORIAS.map((cat) => ({
    ...cat,
    servicios: cat.items
      .map((nombre) => servicios.find((s) => s.nombre === nombre))
      .filter((s): s is ServicioMecanica => !!s),
  })).filter((cat) => cat.servicios.length > 0);

  const porNombre = (nombre: string) => servicios.find((s) => s.nombre === nombre);

  // Servicios que realmente se van a enviar según la opción elegida arriba.
  function serviciosAEnviar(): ServicioMecanica[] {
    if (modo === "general") {
      const s = porNombre(SERVICIO_REVISION_GENERAL);
      return s ? [s] : [];
    }
    if (modo === "nose") {
      const s = porNombre(SERVICIO_NO_SE);
      return s ? [s] : [];
    }
    return servicios.filter((s) => serviciosSeleccionados.includes(s.id));
  }

  const aEnviar = serviciosAEnviar();

  function toggleServicio(id: string) {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  function toggleCategoria(titulo: string) {
    setAbiertas((prev) =>
      prev.includes(titulo) ? prev.filter((t) => t !== titulo) : [...prev, titulo]
    );
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (aEnviar.length === 0) {
      setError(
        modo === "se"
          ? "Elegí al menos un servicio, o tocá “Quiero una revisión general” / “No sé qué necesita mi moto”."
          : "No pudimos registrar esa opción. Elegí “Sé qué servicio necesito” o escribinos por WhatsApp."
      );
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
    const anio = String(form.get("motoAnio") || "").trim();
    // La base no tiene una columna para el año: se guarda junto al modelo para que
    // le llegue completo al taller.
    const modeloBase = String(form.get("motoModelo") || "").trim();
    const motoModelo = anio ? `${modeloBase}${modeloBase ? " " : ""}(${anio})` : modeloBase;
    const descripcionProblema = String(form.get("descripcionProblema") || "");
    const repuestoCliente = String(form.get("repuestoCliente") || "");

    const respuesta = await crearSolicitudMecanicaAction({
      nombre,
      apellido,
      telefono,
      email: String(form.get("email") || ""),
      motoMarca,
      motoModelo,
      serviciosIds: aEnviar.map((s) => s.id),
      descripcionProblema,
      repuestoCliente,
      disclaimerAceptado,
    });

    setEnviando(false);

    if (!respuesta.ok) {
      setError(respuesta.error);
      return;
    }

    const mensajeWhatsapp = mensajeSolicitudMecanica({
      numero: respuesta.numero,
      nombre,
      apellido,
      telefono,
      motoMarca,
      motoModelo,
      servicios: aEnviar.map((s) => s.nombre),
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
          Solicitud #{resultado.numero} · Ya quedó registrada y le llegó al taller. La vamos a
          revisar y te confirmamos el turno a la brevedad.
        </p>
        <p className="mt-3 text-sm text-base-muted">
          No hace falta que mandes nada por WhatsApp. Si querés consultar algo, podés escribirnos:
        </p>
        <ButtonLink
          href={whatsappLink(config, resultado.mensajeWhatsapp)}
          target="_blank"
          variant="secondary"
          className="mt-4"
          size="lg"
        >
          Consultar por WhatsApp
        </ButtonLink>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Bloque n={1} titulo="¿Qué necesita tu moto?">
        <div role="radiogroup" aria-label="Tipo de pedido" className="grid gap-2 sm:grid-cols-3">
          {MODOS.map((m) => {
            const activo = modo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setModo(m.id)}
                className={`rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  activo
                    ? "border-brand-orange bg-brand-orange/10"
                    : "border-base-border bg-base-dark hover:border-brand-orange/50"
                }`}
              >
                <span className="block text-sm font-semibold text-base-white">{m.titulo}</span>
                <span className="block text-xs text-base-muted">{m.detalle}</span>
              </button>
            );
          })}
        </div>

        {modo === "se" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-base-muted">Abrí las categorías que necesitás.</p>
              <span
                aria-live="polite"
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  serviciosSeleccionados.length > 0
                    ? "bg-brand-orange text-white"
                    : "border border-base-border text-base-muted"
                }`}
              >
                {serviciosSeleccionados.length === 0
                  ? "Ninguno elegido"
                  : serviciosSeleccionados.length === 1
                  ? "1 servicio elegido"
                  : `${serviciosSeleccionados.length} servicios elegidos`}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {categorias.map((cat) => {
                const abierta = abiertas.includes(cat.titulo);
                const cantidad = cat.servicios.filter((s) =>
                  serviciosSeleccionados.includes(s.id)
                ).length;
                const panelId = `cat-${cat.titulo.replace(/\W+/g, "-")}`;
                return (
                  <div
                    key={cat.titulo}
                    className={`rounded-xl border bg-base-dark transition-colors ${
                      cantidad > 0 ? "border-brand-orange/70" : "border-base-border"
                    }`}
                  >
                    <button
                      type="button"
                      aria-expanded={abierta}
                      aria-controls={panelId}
                      onClick={() => toggleCategoria(cat.titulo)}
                      className="flex w-full items-center gap-3 px-3.5 py-3 text-left"
                    >
                      <span className="text-brand-orange">
                        <Icono>{cat.icono}</Icono>
                      </span>
                      <span className="flex-1 text-sm font-semibold text-base-white">
                        {cat.titulo}
                      </span>
                      {cantidad > 0 && (
                        <span className="rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
                          {cantidad}
                        </span>
                      )}
                      <svg
                        viewBox="0 0 24 24"
                        className={`h-4 w-4 shrink-0 text-base-muted transition-transform duration-300 motion-reduce:transition-none ${
                          abierta ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    <div
                      id={panelId}
                      className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                        abierta ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden" aria-hidden={!abierta}>
                        <ul className="grid gap-x-4 gap-y-0.5 border-t border-base-border/70 px-3.5 py-2.5 sm:grid-cols-2">
                          {cat.servicios.map((servicio) => {
                            const marcado = serviciosSeleccionados.includes(servicio.id);
                            return (
                              <li key={servicio.id}>
                                <label className="flex min-h-[40px] cursor-pointer items-center gap-3 rounded-lg px-1 py-1.5 text-sm text-base-white hover:bg-base-surface">
                                  <input
                                    type="checkbox"
                                    checked={marcado}
                                    tabIndex={abierta ? 0 : -1}
                                    onChange={() => toggleServicio(servicio.id)}
                                    className="h-[18px] w-[18px] shrink-0 accent-brand-orange"
                                  />
                                  <span className={marcado ? "font-semibold" : ""}>
                                    {servicio.nombre}
                                  </span>
                                </label>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <p className="rounded-xl border border-brand-orange/30 bg-brand-orange/5 p-3 text-sm text-base-muted">
            {modo === "general"
              ? "Perfecto: el taller revisa la moto completa. No hace falta que marques servicios."
              : "No hay problema: el mecánico la revisa y te dice qué necesita. No hace falta que marques servicios."}
          </p>
        )}

        <textarea
          name="descripcionProblema"
          rows={3}
          placeholder={
            modo === "se"
              ? "Contanos qué le pasa a la moto con tus palabras (opcional)"
              : "Contanos qué le pasa o qué notás raro, con tus palabras (opcional)"
          }
          className={inputClass}
        />
      </Bloque>

      <Bloque n={2} titulo="Tu moto">
        <div className="grid gap-3 sm:grid-cols-3">
          <input name="motoMarca" placeholder="Marca (ej: Honda)" className={inputClass} />
          <input name="motoModelo" placeholder="Modelo (ej: Wave 110)" className={inputClass} />
          <input
            name="motoAnio"
            inputMode="numeric"
            maxLength={4}
            placeholder="Año (opcional)"
            className={inputClass}
          />
        </div>
      </Bloque>

      <Bloque n={3} titulo="Tus datos">
        <div className="grid gap-3 sm:grid-cols-2">
          <input name="nombre" required placeholder="Nombre" className={inputClass} />
          <input name="apellido" required placeholder="Apellido" className={inputClass} />
          <input
            name="telefono"
            required
            inputMode="tel"
            placeholder="Teléfono (ej: 11 2297-8803, sin 0 ni 15)"
            className={inputClass}
          />
          <input name="email" type="email" placeholder="Email (opcional)" className={inputClass} />
        </div>
      </Bloque>

      <Bloque n={4} titulo="Repuesto a usar (opcional)">
        <p className="text-xs text-base-muted">
          Si ya tenés en mente qué repuesto querés que te coloquemos (por marca, calidad o precio),
          contanoslo acá. Queda registrado tal cual lo pedís.
        </p>
        <input
          name="repuestoCliente"
          placeholder="Ej: quiero que me pongan una pastilla de freno marca X, la más económica"
          className={inputClass}
        />
      </Bloque>

      <Bloque n={5} titulo="Revisá y pedí el turno">
        <div className="rounded-xl border border-base-border bg-base-dark p-3 text-sm">
          <p className="text-xs text-base-muted">Servicios del pedido</p>
          {aEnviar.length > 0 ? (
            <p className="mt-1 text-base-white">{aEnviar.map((s) => s.nombre).join(" · ")}</p>
          ) : (
            <p className="mt-1 text-base-muted">Todavía no elegiste ninguno.</p>
          )}
        </div>

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-base-border bg-base-dark p-3 text-sm">
          <input
            type="checkbox"
            checked={disclaimerAceptado}
            onChange={(e) => setDisclaimerAceptado(e.target.checked)}
            required
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-brand-orange"
          />
          <span className="text-xs text-base-muted sm:text-sm">
            Entiendo que el diagnóstico final lo confirma el mecánico al revisar la moto, y que si
            yo elijo expresamente un repuesto puntual (por marca, calidad o precio), acepto esa
            elección y no voy a reclamar por su rendimiento o duración frente a otras opciones
            disponibles.
          </span>
        </label>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="rounded-xl bg-brand-orange py-4 text-base font-bold text-white shadow-glow-sm transition-all duration-200 hover:bg-brand-orange-dark hover:shadow-glow active:scale-95 active:shadow-none disabled:pointer-events-none disabled:opacity-60"
        >
          {enviando ? "Enviando pedido…" : "Pedir turno"}
        </button>
        <p className="text-center text-xs text-base-muted">
          Esto no confirma el turno automáticamente: lo revisamos y te contactamos para coordinar.
        </p>
      </Bloque>
    </form>
  );
}
