import Link from "next/link";

export function SectionHeader({
  titulo,
  verTodoHref,
}: {
  titulo: string;
  verTodoHref?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-xl font-bold text-base-white md:text-2xl">{titulo}</h2>
      {verTodoHref && (
        <Link
          href={verTodoHref}
          className="group inline-flex items-center gap-1 text-sm font-semibold text-brand-orange hover:underline"
        >
          Ver todo
          <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
            →
          </span>
        </Link>
      )}
    </div>
  );
}
