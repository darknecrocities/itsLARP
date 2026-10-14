"use client";
import { FadeIn, StaggerContainer, StaggerItem, CardMotion } from "@/components/motion";
import { PRINCIPLES } from "./constants";

export function PrinciplesSection() {
  return (
    <section id="principles" className="py-20 border-b border-line">
      <div className="max-w-6xl mx-auto px-6">
        <FadeIn distance={24} className="max-w-2xl mb-12">
          <h2 className="text-3xl font-bold tracking-tight">Why Job Seekers Love itsLARP</h2>
          <p className="text-muted text-sm mt-2">
            Built to save you hundreds of hours while keeping you completely honest and in control.
          </p>
        </FadeIn>

        <StaggerContainer delay={0.1} stagger={0.07} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PRINCIPLES.map((p) => (
            <StaggerItem key={p.num}>
              <CardMotion hoverLift={-4} className="h-full">
                <div className="card p-6 bg-bg flex flex-col justify-between h-full border border-line hover:border-black transition-colors">
                  <div>
                    <div className="font-mono text-xs text-muted mb-2 font-semibold">{p.num}</div>
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-muted text-xs leading-relaxed">{p.desc}</p>
                  </div>
                  <div className="mt-6 pt-3 border-t border-line flex items-center justify-between text-[11px] font-mono text-muted">
                    <span>Our Promise</span>
                    <span className="text-ink font-semibold">Guaranteed</span>
                  </div>
                </div>
              </CardMotion>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
