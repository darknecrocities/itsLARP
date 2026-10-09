import Link from "next/link";
import { Reveal } from "@/components/ui";

const FEATURES = [
  ["Career DNA", "One verified source of truth: resume, GitHub, LinkedIn, portfolio. Experience is never invented."],
  ["1,000 Agent Workers", "Specialized workers discover, analyze, match, tailor, and prepare in parallel."],
  ["Evidence-Checked", "Every claim in a resume is traced to evidence or blocked. Never hallucinate."],
  ["Human Approval", "Safety boundary: The AI workforce prepares everything, but you press approve."],
];

export default function Landing() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <header className="flex justify-between items-center rise">
        <span className="font-display font-bold text-xl tracking-tight">HowToLarped</span>
        <div className="flex items-center gap-3">
          <Link href="/jobs" className="text-sm text-muted hover:text-fg font-medium">Browse Jobs</Link>
          <Link href="/login" className="btn text-xs py-1.5 px-3">Sign in</Link>
        </div>
      </header>

      <section className="py-20">
        <Reveal>
          <div className="inline-block px-3 py-1 bg-bg2 border border-line rounded text-xs font-mono mb-4 text-dmuted">
            Operating System for your Job Search · Local AI First
          </div>
        </Reveal>
        <Reveal i={1}>
          <h1 className="text-5xl md:text-7xl font-bold leading-[1.02] tracking-tight">
            Your AI Job-Hunting Workforce.
          </h1>
        </Reveal>
        <Reveal i={2}>
          <p className="text-dmuted text-lg md:text-xl mt-6 max-w-2xl leading-relaxed">
            Upload your career once. Deploy specialized AI workers to discover opportunities, understand job requirements, score compatibility, tailor evidence-backed applications, and track your entire search.
          </p>
        </Reveal>

        <Reveal i={3} className="mt-8 flex flex-wrap gap-3">
          <Link href="/onboarding" className="btn btn-primary text-base py-2.5 px-5">
            Build My Career DNA →
          </Link>
          <Link href="/agents" className="btn text-base py-2.5 px-5">
            Deploy Agent Workforce (1,000 Workers)
          </Link>
          <Link href="/jobs" className="btn text-base py-2.5 px-5">
            Live Jobs Board
          </Link>
        </Reveal>
      </section>

      {/* Philosophy banner */}
      <section className="card p-6 mb-12 bg-bg2/40 border border-line">
        <div className="label-xs mb-2">Core Philosophy</div>
        <p className="text-sm font-medium leading-relaxed max-w-3xl">
          HowToLarped is not "ChatGPT but for resumes." It is an operating system for your job search. 
          You maintain your career facts once inside your Career DNA profile. Every tailored version, cover letter, and answer is strictly generated from that verified source of truth.
        </p>
      </section>

      <section className="grid md:grid-cols-4 gap-4 border-t border-line pt-10">
        {FEATURES.map(([t, d], i) => (
          <Reveal key={t} i={i} className="card p-5">
            <h2 className="font-display font-semibold text-base">{t}</h2>
            <p className="text-muted mt-2 text-xs leading-relaxed">{d}</p>
          </Reveal>
        ))}
      </section>
    </div>
  );
}
