import Link from "next/link";

/**
 * Acceso visible a cuenta/login desde el header. `/cuenta` ya redirige a
 * `/login?next=/cuenta` cuando no hay sesión, así que este único botón
 * cubre "acceso a cuenta" y "acceso a login" al mismo tiempo.
 */
export function AccountButton() {
  return (
    <Link
      href="/cuenta"
      aria-label="Mi cuenta / Iniciar sesión"
      className="flex h-11 w-11 items-center justify-center rounded-lg text-base-white transition-colors duration-200 hover:bg-base-surface hover:text-brand-orange"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0"
        />
      </svg>
    </Link>
  );
}
