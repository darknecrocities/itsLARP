"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "@/lib/store";

const NAV = [
  ["/dashboard", "Dashboard", "Command center"],
  ["/profile", "Career DNA", "Source of truth"],
  ["/jobs", "Jobs", "Live discovery & scoring"],
  ["/resume", "Resume Studio", "Master & versions"],
  ["/apply", "Applications", "Pipeline tracker"],
  ["/agents", "Agent Workforce", "1,000 parallel workers"],
  ["/analytics", "Analytics", "Conversion metrics"],
  ["/integrations", "Integrations", "Notion mirror"],
  ["/settings", "Settings", "Local AI / Ollama"],
] as const;

const BARE = ["/", "/login", "/onboarding"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [qc] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      })
  );
  const [open, setOpen] = useState(false);
  const profile = useStore((s) => s.profile);

  if (BARE.includes(path)) {
    return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
  }

  return (
    <QueryClientProvider client={qc}>
      <div className="min-h-screen md:flex bg-bg">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3 bg-bg">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base tracking-tight">HowToLarped</span>
            <span className="text-[10px] font-mono px-1 py-0.5 bg-bg2 border border-line rounded">OS</span>
          </div>
          <button
            className="btn text-xs py-1 px-2.5"
            aria-expanded={open}
            aria-controls="nav"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close" : "Menu"}
          </button>
        </header>

        {/* Desktop Sidebar Navigation */}
        <nav
          id="nav"
          aria-label="Primary"
          className={`${
            open ? "block" : "hidden"
          } md:flex md:flex-col md:justify-between md:w-64 md:shrink-0 md:sticky md:top-0 md:h-screen border-r border-line bg-bg2/40 p-5`}
        >
          <div>
            {/* Logo */}
            <div className="mb-6">
              <Link href="/" className="flex items-center gap-2 group">
                <span className="font-display font-bold text-lg tracking-tight text-ink group-hover:opacity-80 transition-opacity">
                  HowToLarped
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-black text-white rounded font-medium">
                  v1.0
                </span>
              </Link>
              <p className="text-[11px] text-muted font-mono mt-1">AI Job-Hunting Workforce</p>
            </div>

            {/* Navigation links */}
            <ul className="space-y-1">
              {NAV.map(([href, label]) => {
                const target: string = href === "/apply" ? "/applications" : href;
                const active = path === target || path.startsWith(target + "/");
                return (
                  <li key={href}>
                    <Link
                      href={target}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center justify-between rounded px-3 py-2 text-xs font-medium transition-all ${
                        active
                          ? "bg-black text-white shadow-sm"
                          : "text-dmuted hover:bg-bg hover:text-ink border border-transparent hover:border-line"
                      }`}
                    >
                      <span>{label}</span>
                      {active && (
                        <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* User profile footer */}
          <div className="pt-4 border-t border-line mt-6">
            <Link
              href="/profile"
              className="flex items-center justify-between p-2 rounded hover:bg-bg transition-colors border border-transparent hover:border-line group"
            >
              <div className="truncate">
                <div className="text-xs font-semibold text-ink truncate group-hover:underline">
                  {profile.name || "Career Profile"}
                </div>
                <div className="text-[11px] text-muted truncate">
                  {profile.headline || "Build your Career DNA"}
                </div>
              </div>
              <span className="text-[10px] font-mono text-muted shrink-0 ml-2">
                {profile.evidence.length} ev.
              </span>
            </Link>

            <div className="flex items-center justify-between mt-3 text-[10px] text-muted font-mono px-1">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-ok inline-block animate-pulse" />
                Local AI Ready
              </span>
              <span>Postgres Core</span>
            </div>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-6 md:p-10 max-w-6xl overflow-x-hidden">
          {children}
        </main>
      </div>
    </QueryClientProvider>
  );
}
