import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Moto Plus Talar: repuestos, accesorios y equipamiento para motos en El Talar, Buenos Aires, con servicio de mecánica con turno.",
};

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <h1 className="mb-2 text-2xl font-bold text-base-white md:text-3xl">Somos Moto Plus Talar</h1>
      <p className="mb-8 text-lg font-semibold text-brand-orange">
        Somos parte del mundo de las motos.
      </p>

      <div className="flex flex-col gap-5 text-base leading-relaxed text-base-muted">
        <p>
          Somos una empresa ubicada en El Talar, Buenos Aires, dedicada a la comercialización de
          repuestos, accesorios y equipamiento para motos.
        </p>
        <p>
          Trabajamos con las principales marcas del mercado, ofreciendo variedad, calidad y
          asesoramiento personalizado para ayudarte a encontrar la solución que necesitás.
        </p>
        <p>
          Además, contamos con servicio de mecánica con turno, para acompañarte en el mantenimiento
          y cuidado de tu moto.
        </p>
        <p>
          Nuestro compromiso es brindarte confianza, soluciones y una atención que marque la
          diferencia.
        </p>
      </div>

      <div className="mt-10 border-t border-base-border pt-6">
        <p className="text-lg font-bold text-base-white">MOTO PLUS TALAR</p>
        <p className="text-base-muted">Tu moto, nuestro compromiso. 🖤🧡</p>
      </div>
    </div>
  );
}
