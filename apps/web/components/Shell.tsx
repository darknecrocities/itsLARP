"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useStore } from "@/lib/store";
import { BrandLogo } from "@/components/BrandLogo";
import { UpdateNotificationModal } from "@/components/UpdateNotificationModal";
import { WalkthroughProvider, WalkthroughSpotlightOverlay } from "@/components/walkthrough";
import { MascotInteractive } from "@/components/mascot";
import {
  LayoutDashboard,
  User,
  Briefcase,
  FileCheck,
  Bot,
  BarChart2,
  Layers,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  FileText,
  Sparkles,
} from "lucide-react";

interface NavItem {
  href: string;
  target: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/dashboard", target: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/profile", target: "/profile", label: "Career Profile", icon: User },
  { href: "/resume", target: "/resume", label: "APA Resume & 20 Configs", icon: FileText },
  { href: "/jobs", target: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/apply", target: "/applications", label: "Applications", icon: FileCheck },
  { href: "/agents", target: "/agents", label: "Auto-Apply Agents", icon: Bot },
  { href: "/analytics", target: "/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/integrations", target: "/integrations", label: "Integrations & Email", icon: Layers },
  { href: "/settings", target: "/settings", label: "Settings", icon: Settings },
];

const BARE = ["/", "/login", "/onboarding", "/download", "/apa-resume"];

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
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
  const [isDesktop, setIsDesktop] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(250);
  const [isResizing, setIsResizing] = useState(false);

  const profile = useStore((s) => s.profile);
  const fetchProfile = useStore((s) => s.fetchProfile);
  const fetchApps = useStore((s) => s.fetchApps);
  const [backendLive, setBackendLive] = useState<boolean | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchApps();
  }, [fetchProfile, fetchApps]);

  useEffect(() => {
    let cancelled = false;
    async function checkBackend() {
      try {
        const res = await fetch("/api/backend");
        if (res.ok) {
          const d = await res.json();
          if (!cancelled) setBackendLive(d.status === "online");
        }
      } catch {
        if (!cancelled) setBackendLive(false);
      }
    }
    checkBackend();
    const t = setInterval(checkBackend, 25000);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCollapsed = localStorage.getItem("itslarp_sidebar_collapsed");
      if (savedCollapsed !== null) {
        setCollapsed(savedCollapsed === "true");
      }
      const savedWidth = localStorage.getItem("itslarp_sidebar_width");
      if (savedWidth) {
        const num = parseInt(savedWidth, 10);
        if (!isNaN(num) && num >= 200 && num <= 380) {
          setSidebarWidth(num);
        }
      }

      const desktop = Boolean(
        (window as any).electronAPI?.isDesktop ||
        (window as any).isDesktop ||
        navigator.userAgent.toLowerCase().includes("electron")
      );
      if (desktop) {
        setIsDesktop(true);
        if (path === "/" || path === "/login") {
          router.replace("/dashboard");
        }
      }
    }
  }, [path, router]);

  // Resizing mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.min(Math.max(e.clientX, 200), 380);
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (typeof window !== "undefined") {
          localStorage.setItem("itslarp_sidebar_width", String(sidebarWidth));
        }
      }
    };

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, sidebarWidth]);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("itslarp_sidebar_collapsed", String(next));
    }
  };

  const isBare = BARE.includes(path);
  if (isBare && !(isDesktop && (path === "/" || path === "/login"))) {
    return (
      <QueryClientProvider client={qc}>
        <WalkthroughProvider>
          {children}
          <WalkthroughSpotlightOverlay />
        </WalkthroughProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={qc}>
      <WalkthroughProvider>
        <div className="min-h-screen md:flex bg-bg">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between border-b border-line px-4 py-3 bg-bg">
            <div className="flex items-center gap-2">
              <BrandLogo size="sm" />
              <button
                onClick={() => setShowUpdateModal(true)}
                className="text-[10px] font-mono px-2 py-0.5 bg-bg2 border border-line rounded flex items-center gap-1 hover:border-black transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-ok inline-block" />
                <span>Updates</span>
              </button>
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

          {/* Collapsible & Resizable Desktop Sidebar */}
          <nav
            id="nav"
            aria-label="Primary"
            style={!collapsed ? { width: `${sidebarWidth}px` } : undefined}
            className={`${
              open ? "block" : "hidden"
            } md:flex md:flex-col md:justify-between ${
              collapsed ? "md:w-16 md:p-3" : "md:p-4"
            } md:shrink-0 md:sticky md:top-0 md:h-screen border-r border-line bg-bg2/40 transition-all duration-200 relative group/sidebar`}
          >
            {/* Top Brand & Minimizer Toggle */}
            <div>
              <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} mb-5`}>
                <Link
                  href={isDesktop ? "/dashboard" : "/"}
                  data-tour="nav-brand"
                  className="flex items-center gap-2"
                >
                  <BrandLogo variant={collapsed ? "mark" : "full"} size={collapsed ? "sm" : "md"} href={false} />
                </Link>
                {!collapsed && (
                  <button
                    type="button"
                    data-tour="nav-collapse"
                    onClick={toggleCollapse}
                    title="Minimize sidebar"
                    className="p-1 rounded text-muted hover:text-ink hover:bg-bg border border-transparent hover:border-line transition-colors"
                  >
                    <PanelLeftClose className="w-4 h-4" />
                  </button>
                )}
              </div>

              {collapsed && (
                <div className="flex justify-center mb-4">
                  <button
                    type="button"
                    data-tour="nav-collapse"
                    onClick={toggleCollapse}
                    title="Expand sidebar"
                    className="p-1.5 rounded text-muted hover:text-ink hover:bg-bg border border-line transition-colors"
                  >
                    <PanelLeftOpen className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!collapsed && (
                <p className="text-[11px] text-muted font-mono mb-4 px-1">
                  Autonomous Career OS
                </p>
              )}

              {/* Navigation links */}
              <ul className="space-y-1">
                {NAV.map((item) => {
                  const active = path === item.target || path.startsWith(item.target + "/");
                  const Icon = item.icon;
                  const tourKey = `nav-${item.target.replace("/", "")}`;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.target}
                        data-tour={tourKey}
                        onClick={() => setOpen(false)}
                        title={collapsed ? item.label : undefined}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center ${
                          collapsed ? "justify-center px-2 py-2.5" : "justify-between px-3 py-2"
                        } rounded text-xs font-medium transition-all ${
                          active
                            ? "bg-black text-white shadow-xs"
                            : "text-dmuted hover:bg-bg hover:text-ink border border-transparent hover:border-line"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Icon className="w-4 h-4 shrink-0" />
                          {!collapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!collapsed && active && (
                          <span className="w-1.5 h-1.5 rounded-full bg-white opacity-80 shrink-0" />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* User Profile Footer */}
            <div className="pt-3 border-t border-line mt-4">
              <Link
                href="/profile"
                data-tour="nav-profile-card"
                title={collapsed ? profile.name || "Career Profile" : undefined}
                className={`flex items-center ${
                  collapsed ? "justify-center p-2" : "justify-between p-2"
                } rounded hover:bg-bg transition-colors border border-transparent hover:border-line group`}
              >
                <div className={`truncate ${collapsed ? "hidden" : "block"}`}>
                  <div className="text-xs font-semibold text-ink truncate group-hover:underline">
                    {profile.name || "Career Profile"}
                  </div>
                  <div className="text-[11px] text-muted truncate">
                    {profile.headline || "Verified DNA"}
                  </div>
                </div>
                {collapsed && <User className="w-4 h-4 text-ink" />}
              </Link>

              {/* Scuttle Mascot Sidebar Dock */}
              <div
                className={`mt-2.5 p-2 bg-neutral-50 rounded border border-neutral-200 flex items-center ${
                  collapsed ? "justify-center" : "gap-2.5"
                } cursor-pointer hover:border-black transition-colors`}
                title="Scuttle the Crab Mascot (Tap to snip!)"
              >
                <MascotInteractive size={collapsed ? "xs" : "sm"} mood="idle" interactive={true} />
                {!collapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-bold text-black flex items-center justify-between">
                      <span>Scuttle</span>
                      <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded border border-emerald-200">
                        2D Bot
                      </span>
                    </div>
                    <div className="text-[10px] text-neutral-500 truncate font-mono">
                      Tap to snip & chat
                    </div>
                  </div>
                )}
              </div>

              {!collapsed && (
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-line/40 text-[10px] text-muted font-mono px-1">
                  <span
                    data-tour="nav-backend-status"
                    className="flex items-center gap-1.5"
                    title={
                      backendLive === true
                        ? "FastAPI backend active on port 8000"
                        : backendLive === false
                        ? "FastAPI backend is bootstrapping..."
                        : "Verifying backend telemetry..."
                    }
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full inline-block ${
                        backendLive === true
                          ? "bg-ok animate-pulse"
                          : backendLive === false
                          ? "bg-amber-500 animate-pulse"
                          : "bg-neutral-400"
                      }`}
                    />
                    <span>
                      {backendLive === true
                        ? "FastAPI :8000"
                        : backendLive === false
                        ? "FastAPI Booting..."
                        : "Auto-Sync Ready"}
                    </span>
                  </span>
                  <button
                    type="button"
                    data-tour="nav-updates-pill"
                    onClick={() => setShowUpdateModal(true)}
                    className="hover:text-ink underline transition-colors text-[10px]"
                  >
                    v1.0.0
                  </button>
                </div>
              )}
            </div>

            {/* Draggable Resizer Handle on Right Border */}
            {!collapsed && (
              <div
                data-tour="nav-resizer"
                onMouseDown={() => setIsResizing(true)}
                className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-black/20 transition-colors z-20"
                title="Drag to resize sidebar"
              />
            )}
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl overflow-x-hidden">
            {children}
          </main>
        </div>

        {/* App Updates & Changelog Modal */}
        <UpdateNotificationModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
        />

        {/* Global Walkthrough Spotlight Overlay */}
        <WalkthroughSpotlightOverlay />
      </WalkthroughProvider>
    </QueryClientProvider>
  );
}
