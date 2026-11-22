import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";
import { getConfiguracion } from "@/lib/config.server";

/**
 * Server Component: solo envuelve `AdminLoginForm` (que usa
 * `useSearchParams()`) en <Suspense>, como exige Next.js para poder
 * prerenderizar la ruta estáticamente. Ver `AdminLoginForm.tsx` para la
 * lógica real del login de admin.
 */
export default async function AdminLoginPage() {
  const config = await getConfiguracion();
  return (
    <Suspense fallback={null}>
      <AdminLoginForm logoUrl={config.logo_url} />
    </Suspense>
  );
}
