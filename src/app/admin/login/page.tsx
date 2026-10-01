import { Suspense } from "react";
import { AdminLoginForm } from "./AdminLoginForm";

/**
 * Server Component: solo envuelve `AdminLoginForm` (que usa
 * `useSearchParams()`) en <Suspense>, como exige Next.js para poder
 * prerenderizar la ruta estáticamente. Ver `AdminLoginForm.tsx` para la
 * lógica real del login de admin.
 */
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
