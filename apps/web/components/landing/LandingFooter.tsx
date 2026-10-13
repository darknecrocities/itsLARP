"use client";
import Link from "next/link";
import { FadeIn } from "@/components/motion";

export function LandingFooter() {
  return (
    <footer className="border-t border-line py-12 bg-bg2/50 text-xs font-mono">
      <FadeIn distance={14}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-between items-center gap-6">
          <div>
            <div className="font-display font-bold text-base tracking-tight text-ink">
              itsLARP
            </div>
            <p className="text-muted text-[11px] mt-0.5">Your AI Job-Hunting Team · No Manual Applications Needed</p>
          </div>

          <div className="flex flex-wrap gap-6 text-muted">
            <Link href="/dashboard" className="hover:text-ink transition-colors">Dashboard</Link>
            <Link href="/profile" className="hover:text-ink transition-colors">Profile</Link>
            <Link href="/resume" className="hover:text-ink transition-colors">APA Resume</Link>
            <Link href="/agents" className="hover:text-ink transition-colors">1,000 Agents</Link>
            <Link href="/applications" className="hover:text-ink transition-colors">Applications</Link>
            <Link href="/integrations" className="hover:text-ink transition-colors">Notion</Link>
            <Link href="/settings" className="hover:text-ink transition-colors">Settings</Link>
          </div>

          <div className="flex items-center gap-2 text-muted text-[11px]">
            <span className="w-2 h-2 rounded-full bg-black inline-block animate-pulse" />
            <span>Private & Local AI First</span>
            <span>·</span>
            <span>GitHub: darknecrocities/itsLARP</span>
          </div>
        </div>
      </FadeIn>
    </footer>
  );
}
