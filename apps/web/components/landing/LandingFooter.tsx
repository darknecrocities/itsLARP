"use client";
import Link from "next/link";
import { FadeIn } from "@/components/motion";
import { BrandLogo } from "@/components/BrandLogo";

export function LandingFooter() {
  return (
    <footer className="border-t border-line py-12 bg-bg2/50 text-xs font-mono">
      <FadeIn distance={14}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div>
            <BrandLogo size="sm" variant="full" />
            <p className="text-muted text-[11px] mt-1.5">Your AI Job-Hunting Team · Windows & macOS Native Desktop</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-muted">
            <Link href="/download" className="hover:text-ink transition-colors font-semibold text-ink">Download</Link>
            <Link href="/#workforce-demo" className="hover:text-ink transition-colors">How It Works</Link>
            <Link href="/apa-resume" className="hover:text-ink transition-colors flex items-center gap-1 font-medium">
              <span>APA Resume</span>
              <span className="text-[9px] font-mono px-1 py-0.2 bg-neutral-200 text-neutral-800 rounded font-bold">CV</span>
            </Link>
            <Link href="/#principles" className="hover:text-ink transition-colors">Explore</Link>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
            <span>Private & Local AI First</span>
            <span>·</span>
            <span>macOS & Windows</span>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
