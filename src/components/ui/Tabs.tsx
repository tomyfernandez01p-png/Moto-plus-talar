"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

/**
 * Tabs simples (brief #24: "usar tabs/accordions donde ayude a reducir
 * altura"). Genérico -- no sabe nada de productos, solo recibe contenido ya
 * armado por quien lo usa.
 */
export function Tabs({ tabs }: { tabs: Tab[] }) {
  const [activo, setActivo] = useState(tabs[0]?.id);
  if (tabs.length === 0) return null;

  return (
    <div>
      <div role="tablist" className="fade-edge-x no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-base-border px-4 md:mx-0 md:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={activo === tab.id}
            onClick={() => setActivo(tab.id)}
            className={cn(
              "focus-ring shrink-0 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition-colors duration-200",
              activo === tab.id
                ? "border-brand-orange text-brand-orange"
                : "border-transparent text-base-muted hover:text-base-white"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map(
        (tab) =>
          activo === tab.id && (
            <div key={tab.id} role="tabpanel" className="animate-fade-in py-5">
              {tab.content}
            </div>
          )
      )}
    </div>
  );
}
