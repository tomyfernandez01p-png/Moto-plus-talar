import type { Metadata } from "next";
import { NuevaContrasenaForm } from "./NuevaContrasenaForm";

export const metadata: Metadata = {
  title: "Nueva contraseña",
  robots: { index: false, follow: false },
};

export default function NuevaContrasenaPage() {
  return <NuevaContrasenaForm />;
}
