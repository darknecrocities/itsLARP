"use client";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Download, Printer, FileText, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";
import { Badge, PageHeader, Reveal } from "@/components/ui";
import { SAMPLE_PROFILE } from "@/lib/sampleResume";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function ResumeStudio() {
  const { profile: userProfile, apps } = useStore();
  const [activeFormat, setActiveFormat] = useState<"apa" | "standard">("apa");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isSample = !userProfile.skills || userProfile.skills.length === 0;
  const p = isSample ? SAMPLE_PROFILE : userProfile;

  const surname = useMemo(() => {
    const parts = (p.name || "Chen").trim().split(" ");
    return parts[parts.length - 1].toUpperCase();
  }, [p.name]);

  const year = new Date().getFullYear();

  const apaText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1\n`);
    lines.push("=".repeat(72) + "\n");
    lines.push((p.name || "Dr. Alex R. Chen").padStart(36 + (p.name?.length || 15) / 2));
    lines.push((p.headline || "Principal AI Systems Architect").padStart(36 + (p.headline?.length || 30) / 2));
    lines.push(`${p.email || ""}  |  ${p.location || "San Francisco, CA"}  |  ${p.links?.github || ""}`.padStart(50));
    lines.push("\n" + "=".repeat(72) + "\n");

    lines.push("Professional Abstract\n" + "-".repeat(72));
    lines.push(`Empirical technical practitioner with ${p.years || 6}+ years architecting high-throughput distributed software platforms, local LLM inference engines, and artificial intelligence infrastructure. Technical specializations span ${p.skills.slice(0, 8).join(", ")}. Assertions underpinned by verifiable source code evidence.\n`);

    lines.push("Academic Preparation & Credentials\n" + "-".repeat(72));
    lines.push(`${p.education}\n`);

    lines.push("Professional Employment History\n" + "-".repeat(72));
    (p.experience || []).forEach((exp) => {
      const role = exp.role || exp.title || "Software Engineer";
      const dates = exp.dates || "Recent";
      const bullets = exp.bullets || (exp.text ? [exp.text] : []);
      lines.push(`${role} — ${exp.company} (${dates})`);
      bullets.forEach((b) => {
        lines.push(`  • ${b}`);
      });
      lines.push("");
    });

    lines.push("Technical Competencies & Frameworks\n" + "-".repeat(72));
    lines.push(`Core Stack: ${p.skills.join(", ")}\n`);

    lines.push("Software Artifacts & Project Contributions (APA 7th Format)\n" + "-".repeat(72));
    p.projects.forEach((proj) => {
      lines.push(`${p.name || "Chen, A."}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ") || "Full Stack"}].`);
      lines.push(`    Description: ${proj.text}\n`);
    });

    lines.push("Verifiable Evidence Corpus (Anti-Hallucination Index)\n" + "-".repeat(72));
    p.evidence.forEach((ev, i) => {
      lines.push(`[${i + 1}] Source: ${ev.source}`);
      lines.push(`    Excerpt: "${ev.text}"\n`);
    });

    return lines.join("\n");
  }, [p, surname, year]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white flex flex-col justify-between">
      <LandingHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        {/* Navigation Breadcrumbs / Context Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-muted hover:text-ink flex items-center gap-1.5 transition-colors group"
          >
            <span className="group-hover:-translate-x-0.5 transition-transform">←</span>
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-ok animate-pulse" />
            <span className="text-dmuted">APA 7th Edition Empirical CV</span>
          </div>
        </div>

        <PageHeader
          title="APA Resume Studio"
          sub="Standard APA 7th Edition curriculum vitae format. Citations link directly to real software artifacts and verifiable repository evidence."
          action={
            <div className="flex flex-wrap items-center gap-2">
              <button
                className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5 hover:border-black transition-colors"
                onClick={() => downloadTextFile(apaText, `${surname}_Resume_APA_7th.txt`)}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download APA (.txt)</span>
              </button>
              <button
                className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5 hover:border-black transition-colors"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <Link href="/onboarding" className="btn btn-primary text-xs flex items-center gap-1.5">
                <span>Upload Your Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          }
        />

      {isSample && (
        <div className="p-3 mb-6 bg-neutral-100 border border-neutral-300 rounded text-xs font-mono flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-ok inline-block animate-pulse" />
            <strong className="text-black">Viewing Full Sample APA 7th Resume</strong>
            <span className="text-neutral-600">(Synthetic Candidate Data)</span>
          </div>
          <Link href="/onboarding" className="text-black underline font-semibold">
            Upload your own resume to replace with your real experience →
          </Link>
        </div>
      )}

      {/* Format Toggle Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-3 border-b border-line">
        <div className="flex gap-2">
          <button
            className={`btn text-xs py-1.5 px-3.5 font-mono flex items-center gap-1.5 ${
              activeFormat === "apa" ? "bg-black text-white" : ""
            }`}
            onClick={() => setActiveFormat("apa")}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>APA 7th Edition Academic / Industry Format</span>
          </button>
          <button
            className={`btn text-xs py-1.5 px-3.5 font-mono flex items-center gap-1.5 ${
              activeFormat === "standard" ? "bg-black text-white" : ""
            }`}
            onClick={() => setActiveFormat("standard")}
          >
            <span>Modern Dashboard Cards</span>
          </button>
        </div>

        <div className="text-xs font-mono text-muted">
          {p.evidence.length} Evidence Records Underpinning Assertions
        </div>
      </div>

      {activeFormat === "apa" ? (
        /* APA 7th Edition Document Paper Preview */
        <div className="card p-8 md:p-12 mb-10 bg-white text-black border border-line shadow-md max-w-4xl mx-auto font-serif leading-relaxed">
          {/* APA Running Head */}
          <div className="flex justify-between items-center text-xs text-neutral-600 border-b border-neutral-300 pb-2 mb-8 font-mono">
            <span>RUNNING HEAD: {surname} / CURRICULUM VITAE</span>
            <span>Page 1</span>
          </div>

          {/* APA Title Block */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold tracking-normal">{p.name}</h1>
            <div className="text-base italic text-neutral-700 mt-1">{p.headline}</div>
            <div className="text-xs text-neutral-600 mt-2 font-mono">
              {p.email} &nbsp;|&nbsp; {p.location}
              {p.links?.github && ` | ${p.links.github}`}
              {p.links?.linkedin && ` | ${p.links.linkedin}`}
            </div>
          </div>

          {/* Section 1: Professional Abstract */}
          <div className="mb-6">
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Professional Abstract
            </h2>
            <p className="text-justify text-sm text-neutral-800 leading-relaxed indent-8">
              Technical practitioner with {p.years || 6}+ years of experience architecting high-throughput distributed software platforms, local LLM inference engines, and artificial intelligence infrastructure. Technical specializations encompass {p.skills.slice(0, 8).join(", ")}. All technical achievements and competencies cited herein maintain traceable correspondence with primary source evidence repositories and published software artifacts.
            </p>
          </div>

          {/* Section 2: Academic Credentials */}
          <div className="mb-6">
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Academic Preparation and Credentials
            </h2>
            <div className="text-sm space-y-2 whitespace-pre-line text-neutral-800">
              {p.education}
            </div>
          </div>

          {/* Section 3: Professional Employment History */}
          <div className="mb-6">
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Professional Employment History
            </h2>
            <div className="space-y-4 text-sm">
              {(p.experience || []).map((exp, idx) => {
                const role = exp.role || exp.title || "Software Engineer";
                const dates = exp.dates || "Recent";
                const bullets = exp.bullets || (exp.text ? [exp.text] : []);
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-baseline font-sans">
                      <span className="font-bold text-black">{role}</span>
                      <span className="text-xs font-mono text-neutral-600">{dates}</span>
                    </div>
                    <div className="italic text-neutral-700 text-xs mb-1.5">{exp.company}</div>
                    <ul className="list-disc list-inside space-y-1 text-xs text-neutral-800 leading-relaxed pl-2">
                      {bullets.map((bullet, bIdx) => (
                        <li key={bIdx} className="text-justify">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 4: Technical Competencies */}
          <div className="mb-6">
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Technical Competencies and Frameworks
            </h2>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {p.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Section 5: Software Artifacts (APA 7th Format) */}
          <div className="mb-6">
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Software Artifacts and Project Contributions
            </h2>
            <p className="text-xs text-neutral-500 italic mb-3">
              Documented in accordance with APA 7th Edition software and technical repository citation standards:
            </p>
            <div className="space-y-3 text-sm">
              {p.projects.map((proj) => (
                <div key={proj.name} className="pl-6 -indent-6">
                  <p className="leading-snug">
                    <strong>{p.name || "Chen, A."}</strong>. ({year}). <em>{proj.name}</em> [Computer software / {proj.tech?.join(", ") || "Full Stack"}].
                  </p>
                  <p className="indent-0 text-xs text-neutral-700 mt-0.5 pl-6">
                    {proj.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6: Verifiable Evidence Index */}
          <div>
            <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider font-sans">
              Verifiable Evidence Corpus (Anti-Hallucination Index)
            </h2>
            <div className="space-y-2 text-xs font-mono text-neutral-700">
              {p.evidence.map((ev, i) => (
                <div key={i} className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                  <span className="font-bold text-black">[{i + 1}] Source: {ev.source}</span>
                  <div className="italic text-neutral-600 mt-0.5">"{ev.text}"</div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between items-center text-xs font-mono text-neutral-600 no-print">
            <span>APA 7th Standard · Verified via itsLARP</span>
            <div className="flex gap-2">
              <button
                className="btn text-xs py-1 px-3 bg-black text-white"
                onClick={() => copyToClipboard(apaText, "apa-text")}
              >
                {copiedId === "apa-text" ? "Copied!" : "Copy APA Plaintext"}
              </button>
              <button
                className="btn text-xs py-1 px-3"
                onClick={() => downloadTextFile(apaText, `${surname}_APA_Resume.txt`)}
              >
                Download .txt
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Modern Card View */
        <Reveal>
          <div className="card p-6 mb-10 bg-bg2/30">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-display text-2xl font-bold">{p.name}</h3>
                <div className="text-dmuted font-medium">{p.headline}</div>
                <div className="text-muted text-xs mt-1">
                  {p.email} · {p.location} · {p.years} years experience
                </div>
              </div>
              <button
                className="btn text-xs"
                onClick={() => copyToClipboard(apaText, "master")}
              >
                {copiedId === "master" ? "Copied!" : "Copy Master Text"}
              </button>
            </div>

            <div className="label-xs mt-5">Verified Technical Skills</div>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {p.skills.map((s) => (
                <span key={s} className="px-2 py-0.5 bg-line/60 rounded text-xs font-mono">
                  {s}
                </span>
              ))}
            </div>

            <div className="label-xs mt-5">Featured Evidence Projects</div>
            <div className="grid sm:grid-cols-2 gap-3 mt-2">
              {p.projects.map((x) => (
                <div key={x.name} className="card p-3 bg-bg">
                  <div className="font-medium text-sm">{x.name}</div>
                  <p className="text-muted text-xs mt-1">{x.text}</p>
                  {x.tech && x.tech.length > 0 && (
                    <div className="text-[10px] text-dmuted font-mono mt-2">
                      Stack: {x.tech.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      {/* Tailored Resumes Section */}
      <Reveal i={1}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Job-Specific Tailored Versions</h2>
          <span className="text-xs text-muted">Immutable & Evidence-Checked</span>
        </div>

        {apps.length === 0 ? (
          <div className="card p-6 text-center text-muted text-sm">
            No tailored resumes generated yet. Search jobs in{" "}
            <Link className="underline text-fg font-medium" href="/jobs">
              Jobs
            </Link>{" "}
            and click "Prepare Application" to create a role-specific tailored APA resume.
          </div>
        ) : (
          <div className="space-y-4">
            {apps.map((a) => (
              <div key={a.id} className="card p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">
                      {a.role} — <span className="text-muted">{a.company}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge tone={a.match >= 80 ? "ok" : "n"}>{a.match}% Compatibility</Badge>
                      <Badge>{a.status}</Badge>
                      {a.verified && <Badge tone="ok">✓ Evidence Verified</Badge>}
                      <Badge tone="n">APA Aligned</Badge>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="btn text-xs flex items-center gap-1.5"
                      onClick={() => downloadTextFile(a.resume || apaText, `${a.company}_Tailored_Resume_APA.txt`)}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Tailored APA</span>
                    </button>
                    <Link href={`/apply/${a.jobId}`} className="btn text-xs">
                      View in Studio
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Reveal>
      </main>

      <LandingFooter />
    </div>
  );
}
