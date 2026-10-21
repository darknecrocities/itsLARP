"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, ArrowRight, Menu, X, ChevronDown, ExternalLink } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

function GithubIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/#app-demos", label: "Watch Demos", pulse: true },
  { href: "/#workforce-demo", label: "How It Works" },
  { href: "/apa-resume", label: "APA Resume" },
  { href: "/#principles", label: "Why itsLARP" },
  { href: "/#architecture", label: "4 Easy Steps" },
  { href: "/download#benchmarks", label: "Hardware Benchmarks" },
];

export function LandingHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreDropdownOpen, setMoreDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMoreDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setMoreDropdownOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="border-b border-line bg-bg/90 backdrop-blur-md sticky top-0 z-50"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <BrandLogo size="md" variant="full" className="group flex items-center" />
        </div>

        {/* Center: Desktop Clean Navigation */}
        <nav className="hidden lg:flex items-center gap-5 text-xs font-medium text-dmuted">
          <Link
            href="/#app-demos"
            className="text-ink font-semibold flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Watch Demos
          </Link>
          <Link href="/#workforce-demo" className="hover:text-ink transition-colors">
            How It Works
          </Link>
          <Link
            href="/apa-resume"
            className="hover:text-ink transition-colors font-medium flex items-center gap-1"
          >
            APA Resume
            <span className="text-[10px] font-mono px-1 py-0.2 bg-neutral-200 text-neutral-800 rounded">CV</span>
          </Link>

          {/* More Dropdown for secondary pages */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMoreDropdownOpen(!moreDropdownOpen)}
              className="flex items-center gap-1 hover:text-ink transition-colors focus:outline-none"
              aria-expanded={moreDropdownOpen}
            >
              <span>Explore</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  moreDropdownOpen ? "rotate-180 text-ink" : ""
                }`}
              />
            </button>

            <AnimatePresence>
              {moreDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-52 bg-bg border border-line rounded-lg shadow-xl py-2 z-50 text-xs font-medium"
                >
                  <Link
                    href="/#principles"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-neutral-100 hover:text-ink transition-colors"
                  >
                    Why itsLARP (Principles)
                  </Link>
                  <Link
                    href="/#architecture"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-neutral-100 hover:text-ink transition-colors"
                  >
                    4 Easy Steps
                  </Link>
                  <Link
                    href="/download#benchmarks"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-neutral-100 hover:text-ink transition-colors"
                  >
                    Hardware Benchmarks
                  </Link>
                  <div className="border-t border-line my-1" />
                  <a
                    href="https://github.com/darknecrocities/itsLARP"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMoreDropdownOpen(false)}
                    className="flex items-center justify-between px-4 py-2 hover:bg-neutral-100 text-ink transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <GithubIcon className="w-3.5 h-3.5" />
                      GitHub Repo
                    </span>
                    <ExternalLink className="w-3 h-3 text-muted" />
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Right: Actions, GitHub Button & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* GitHub Open Source Button */}
          <a
            href="https://github.com/darknecrocities/itsLARP"
            target="_blank"
            rel="noopener noreferrer"
            className="btn text-xs py-1.5 px-2.5 sm:px-3 font-medium !hidden sm:!flex items-center gap-1.5 border border-line hover:border-black hover:bg-neutral-100 transition-colors"
            title="View itsLARP on GitHub (Open Source)"
          >
            <GithubIcon className="w-3.5 h-3.5 text-ink" />
            <span>GitHub</span>
          </a>

          {/* Download Desktop */}
          <Link
            href="/download"
            className="btn text-xs py-1.5 px-2.5 sm:px-3 font-medium !hidden sm:!inline-flex items-center gap-1.5 border border-line hover:border-black transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-ink" />
            <span>Download</span>
          </Link>

          {/* Primary CTA */}
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/onboarding"
              className="btn btn-primary text-xs py-1.5 px-3 sm:px-4 font-semibold inline-flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>Auto-Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          {/* Mobile / Tablet Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden btn text-xs p-2 border border-line hover:border-black transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile / Tablet Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden border-t border-line bg-bg/98 backdrop-blur-xl px-4 py-5 shadow-2xl overflow-hidden"
          >
            <div className="flex flex-col space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-muted px-2">
                Navigation
              </div>

              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-2 rounded-md hover:bg-neutral-100 text-sm font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    {link.pulse && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    )}
                    {link.label}
                  </span>
                  {link.href === "/apa-resume" && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-neutral-200 text-neutral-800 rounded">
                      Standalone CV
                    </span>
                  )}
                </Link>
              ))}

              <div className="border-t border-line pt-3 mt-1 flex flex-col space-y-2">
                <a
                  href="https://github.com/darknecrocities/itsLARP"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn text-xs py-2 px-3 font-medium flex items-center justify-center gap-2 border border-line hover:border-black"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>Star on GitHub (Open Source)</span>
                  <ExternalLink className="w-3.5 h-3.5 text-muted ml-auto" />
                </a>

                <Link
                  href="/download"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn text-xs py-2 px-3 font-medium flex items-center justify-center gap-2 border border-line hover:border-black"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Desktop (macOS / Windows)</span>
                </Link>

                <div className="pt-1">
                  <Link
                    href="/onboarding"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-primary text-xs py-2.5 text-center font-semibold w-full flex items-center justify-center gap-1.5"
                  >
                    <span>Auto-Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

