"use client";
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: React.ReactNode;
  defaultOpen?: boolean;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  dataTour?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  badge,
  icon,
  defaultOpen = true,
  action,
  children,
  className = "card p-5 mb-5",
  dataTour,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className={className} data-tour={dataTour}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200/80 pb-3">
        <div
          className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-[200px]"
          onClick={() => setOpen(!open)}
        >
          {icon && (
            <div className="p-1.5 rounded bg-neutral-100 text-neutral-800 border border-neutral-200">
              {icon}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-black tracking-tight">{title}</h2>
              {badge && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium border border-neutral-200">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {open && action}
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="p-1 text-neutral-500 hover:text-black hover:bg-neutral-100 rounded transition"
            aria-label={open ? `Minimize ${title}` : `Expand ${title}`}
          >
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && <div className="pt-4">{children}</div>}
    </section>
  );
}
