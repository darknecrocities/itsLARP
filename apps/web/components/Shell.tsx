"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const NAV = [
  ["/dashboard", "Dashboard"], ["/profile", "Career DNA"], ["/jobs", "Jobs"],
  ["/resume", "Resume Studio"], ["/applications", "Applications"], ["/agents", "Agents"],
  ["/analytics", "Analytics"], ["/integrations", "Integrations"], ["/settings", "Settings"],
] as const;
const BARE = ["/", "/login", "/onboarding"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [qc] = useState(() => new QueryClient());
  const [open, setOpen] = useState(false);
  if (BARE.includes(path)) return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen md:flex">
        <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-display font-semibold">HowToLarped</span>
          <button className="btn" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>Menu</button>
        </header>
        <nav id="nav" aria-label="Primary" className={`${open ? "block" : "hidden"} md:block md:w-56 md:shrink-0 md:sticky md:top-0 md:h-screen border-r border-line bg-bg2 p-4`}>
          <Link href="/" className="hidden md:block font-display font-semibold text-lg mb-6">HowToLarped</Link>
          <ul className="space-y-0.5">
            {NAV.map(([href, label]) => (
              <li key={href}>
                <Link href={href} onClick={() => setOpen(false)} aria-current={path === href ? "page" : undefined}
                  className={`block rounded px-3 py-1.5 transition-colors ${path === href ? "bg-black text-white" : "text-dmuted hover:bg-white hover:text-ink"}`}>{label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 min-w-0 p-5 md:p-10 max-w-6xl">{children}</main>
      </div>
    </QueryClientProvider>
  );
}
