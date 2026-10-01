import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

/**
 * Server Component: solo envuelve `LoginForm` (que usa `useSearchParams()`)
 * en <Suspense>, como exige Next.js para poder prerenderizar la ruta
 * estáticamente. Ver `LoginForm.tsx` para la lógica real del login.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
