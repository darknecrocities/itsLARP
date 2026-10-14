"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Badge, Empty, PageHeader, Reveal } from "@/components/ui";
import { Download, Printer, FileText, Layers, Check, Copy, Briefcase } from "lucide-react";

export default function ResumeStudio() {
  const { profile: p, apps, fetchProfile, fetchApps } = useStore();
  const [activeFormat, setActiveFormat] = useState<"standard" | "apa">("apa");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchApps();
  }, [fetchProfile, fetchApps]);

  const surname = useMemo(() => {
    const parts = (p.name || "Candidate").trim().split(" ");
    return parts[parts.length - 1].toUpperCase();
  }, [p.name]);

  const year = new Date().getFullYear();

  const apaText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1\n`);
    lines.push("=".repeat(72) + "\n");
    lines.push((p.name || "Candidate Name").padStart(36 + (p.name?.length || 14) / 2));
    lines.push((p.headline || "Software / AI Systems Engineer").padStart(36 + (p.headline?.length || 28) / 2));
    lines.push(`${p.email || ""}  |  ${p.location || "Remote"}  |  ${p.links?.github || ""}`.padStart(50));
    lines.push("\n" + "=".repeat(72) + "\n");

    lines.push("Professional Abstract\n" + "-".repeat(72));
    lines.push(`Empirical technical practitioner with ${p.years || 2}+ years contributing to scalable software systems and artificial intelligence. Specialized technical competencies encompass ${p.skills.slice(0, 6).join(", ")}. Assertions underpinned by verifiable evidence repository.\n`);

    lines.push("Academic Preparation & Credentials\n" + "-".repeat(72));
    lines.push(`${p.education || "Bachelor of Science in Computer Science"}\nFocus: Applied Computing & Algorithmic Design (${year - Math.max(1, p.years || 2)}-${year})\n`);

    lines.push("Technical Competencies & Specializations\n" + "-".repeat(72));
    lines.push(`Core Frameworks: ${p.skills.join(", ")}\n`);

    if (p.experience && p.experience.length > 0) {
      lines.push("Professional Experience & Appointments\n" + "-".repeat(72));
      p.experience.forEach((exp) => {
        lines.push(`${exp.title}${exp.company ? ` | ${exp.company}` : ""}${exp.period ? ` (${exp.period})` : ""}`);
        if (exp.text) lines.push(`    ${exp.text}`);
        lines.push("");
      });
    }

    lines.push("Software Artifacts & Project Contributions (APA 7th Format)\n" + "-".repeat(72));
    p.projects.forEach((proj) => {
      lines.push(`${p.name || "Author"}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ") || "Full Stack"}].`);
      lines.push(`    Description: ${proj.text}\n`);
    });

    lines.push("Verifiable Evidence Corpus\n" + "-".repeat(72));
    p.evidence.slice(0, 8).forEach((ev, i) => {
      lines.push(`[${i + 1}] Source: ${ev.source}`);
      lines.push(`    Excerpt: "${ev.text.slice(0, 140)}..."\n`);
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <PageHeader
        title="Resume Studio"
        sub="Clean, professional APA-format resume generated from your real experience. Ready to download or customize for any job."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5"
              onClick={() => downloadTextFile(apaText, `${surname}_Resume_APA_7th.txt`)}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download APA (.txt)</span>
            </button>
            <button
              className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <Link href="/profile" className="btn text-xs">
              Edit Career DNA
            </Link>
            <Link href="/jobs" className="btn btn-primary text-xs">
              Tailor for a Job
            </Link>
          </div>
        }
      />

      {!p.skills.length ? (
        <Empty title="No Master Resume" hint="Create your Career DNA first.">
          <Link href="/onboarding" className="btn btn-primary">
            Onboarding
          </Link>
        </Empty>
      ) : (
        <>
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
                <span>APA 7th Edition Standard Format (Academic / Verified)</span>
              </button>
              <button
                className={`btn text-xs py-1.5 px-3.5 font-mono flex items-center gap-1.5 ${
                  activeFormat === "standard" ? "bg-black text-white" : ""
                }`}
                onClick={() => setActiveFormat("standard")}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Modern Cards View</span>
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
                <h1 className="text-2xl font-bold tracking-normal">{p.name || "Candidate Name"}</h1>
                <div className="text-base italic text-neutral-700 mt-1">{p.headline || "Software / AI Systems Engineer"}</div>
                <div className="text-xs text-neutral-600 mt-2 font-mono">
                  {p.email} &nbsp;|&nbsp; {p.location}
                  {p.links?.github && ` | ${p.links.github}`}
                  {p.links?.linkedin && ` | ${p.links.linkedin}`}
                </div>
              </div>

              {/* Section 1: Professional Abstract */}
              <div className="mb-6">
                <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
                  Professional Abstract
                </h2>
                <p className="text-justify text-sm text-neutral-800 leading-relaxed indent-8">
                  Technical practitioner with {p.years || 2}+ years of dedicated experience architecting distributed software applications and artificial intelligence systems. Specialized technical focus spans {p.skills.slice(0, 6).join(", ")}. All technical achievements and capabilities cited herein maintain traceable correspondence with primary source evidence repositories.
                </p>
              </div>

              {/* Section 2: Academic Credentials */}
              <div className="mb-6">
                <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
                  Academic Preparation and Credentials
                </h2>
                <div className="text-sm">
                  <div className="font-bold">{p.education || "Bachelor of Science in Computer Science"}</div>
                  <div className="text-xs text-neutral-600 mt-0.5">
                    Curriculum emphasis: Distributed Systems, Algorithmic Analysis, and Computational Logic ({year - Math.max(1, p.years || 2)}–{year})
                  </div>
                </div>
              </div>

              {/* Section 3: Technical Competencies */}
              <div className="mb-6">
                <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
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

              {/* Section 4: Professional Experience */}
              {p.experience && p.experience.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
                    Professional Experience and Appointments
                  </h2>
                  <div className="space-y-4 text-sm">
                    {p.experience.map((exp, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-baseline font-bold text-black">
                          <span>
                            {exp.title} {exp.company && <span className="font-normal italic">&mdash; {exp.company}</span>}
                          </span>
                          {exp.period && <span className="text-xs font-mono text-neutral-600">{exp.period}</span>}
                        </div>
                        {exp.text && <p className="text-xs text-neutral-700 leading-relaxed pl-4">{exp.text}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Section 5: Software Artifacts (APA Citations) */}
              <div className="mb-6">
                <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
                  Software Artifacts and Project Contributions
                </h2>
                <p className="text-xs text-neutral-500 italic mb-3">
                  Documented in accordance with APA 7th Edition software and technical repository citation standards:
                </p>
                <div className="space-y-4 text-sm">
                  {p.projects.map((proj) => (
                    <div key={proj.name} className="pl-6 -indent-6">
                      <p className="leading-snug">
                        <strong>{p.name || "Author"}</strong>. ({year}). <em>{proj.name}</em> [Computer software / {proj.tech?.join(", ") || "Full Stack"}].
                      </p>
                      <p className="indent-0 text-xs text-neutral-700 mt-1 pl-6">
                        {proj.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 6: Verifiable Evidence Index */}
              {p.evidence.length > 0 && (
                <div>
                  <h2 className="text-center font-bold text-sm border-b border-black pb-1 mb-3 uppercase tracking-wider">
                    Verifiable Evidence Corpus (Anti-Hallucination Index)
                  </h2>
                  <div className="space-y-2 text-xs font-mono text-neutral-700">
                    {p.evidence.slice(0, 6).map((ev, i) => (
                      <div key={i} className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                        <span className="font-bold text-black">[{i + 1}] Source: {ev.source}</span>
                        <div className="italic text-neutral-600 mt-0.5">"{ev.text.slice(0, 160)}..."</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="mt-8 pt-4 border-t border-neutral-300 flex justify-between items-center text-xs font-mono text-neutral-600 no-print">
                <span>APA 7th Standard · Verified via itsLARP</span>
                <div className="flex gap-2">
                  <button
                    className="btn text-xs py-1 px-3 bg-black text-white flex items-center gap-1.5"
                    onClick={() => copyToClipboard(apaText, "apa-text")}
                  >
                    {copiedId === "apa-text" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "apa-text" ? "Copied!" : "Copy APA Plaintext"}</span>
                  </button>
                  <button
                    className="btn text-xs py-1 px-3 flex items-center gap-1.5"
                    onClick={() => downloadTextFile(apaText, `${surname}_APA_Resume.txt`)}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .txt</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Modern Card View */
            <Reveal>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Master Resume (Source of Truth)</h2>
                <span className="text-xs font-mono text-muted">
                  {p.evidence.length} Evidence Records Indexed
                </span>
              </div>

              <div className="card p-6 mb-10 bg-bg2/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{p.name || "Candidate Name"}</h3>
                    <div className="text-dmuted font-medium">{p.headline || "Software / AI Engineer"}</div>
                    <div className="text-muted text-xs mt-1">
                      {p.email} · {p.location} {p.years > 0 ? `· ${p.years} years experience` : ""}
                    </div>
                  </div>
                  <button
                    className="btn text-xs flex items-center gap-1.5"
                    onClick={() => copyToClipboard(apaText, "master")}
                  >
                    {copiedId === "master" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === "master" ? "Copied!" : "Copy Master Text"}</span>
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

                {p.experience && p.experience.length > 0 && (
                  <>
                    <div className="label-xs mt-5 flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 inline text-muted" />
                      <span>Verified Work Experience</span>
                    </div>
                    <div className="space-y-2.5 mt-2">
                      {p.experience.map((exp, idx) => (
                        <div key={idx} className="card p-3 bg-bg border border-line">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm text-ink">{exp.title} &mdash; <span className="text-muted">{exp.company}</span></span>
                            {exp.period && <span className="text-[11px] font-mono text-muted">{exp.period}</span>}
                          </div>
                          {exp.text && <p className="text-muted text-xs mt-1.5 leading-relaxed">{exp.text}</p>}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                <div className="label-xs mt-5">Featured Evidence Projects</div>
                <div className="grid sm:grid-cols-2 gap-3 mt-2">
                  {p.projects.map((x) => (
                    <div key={x.name} className="card p-3 bg-bg">
                      <div className="font-medium text-sm">{x.name}</div>
                      <p className="text-muted text-xs mt-1">{x.text || "Project repository imported from GitHub"}</p>
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

          {/* Job-Specific Tailored Versions */}
          <Reveal i={1}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Job-Specific Tailored Versions</h2>
              <span className="text-xs text-muted">Immutable & Evidence-Checked</span>
            </div>

            {apps.length === 0 ? (
              <div className="card p-8 text-center text-muted text-sm">
                No tailored versions generated yet. Select a job in{" "}
                <Link className="underline text-fg font-medium" href="/jobs">
                  Jobs
                </Link>{" "}
                and click "Prepare Application".
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
                          {a.verified && (
                            <Badge tone="ok">
                              <Check className="w-3 h-3 inline mr-1" />
                              Evidence Verified
                            </Badge>
                          )}
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

                    {a.resume && (
                      <div className="mt-4 p-3 bg-bg2 rounded border border-line">
                        <div className="label-xs mb-1">Tailored Content Diff</div>
                        <pre className="font-mono text-xs whitespace-pre-wrap text-dmuted max-h-48 overflow-y-auto">
                          {a.resume}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </>
      )}
    </>
  );
}
