"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Download, Printer, ArrowRight, Check, SlidersHorizontal, FileText } from "lucide-react";
import { useStore, type ResumeFormatKey } from "@/lib/store";
import { Badge, Empty, PageHeader, Reveal } from "@/components/ui";
import { ApplicationConfigPanel } from "@/components/apply/ApplicationConfigPanel";
import { api, apiGet } from "@/lib/api";

const RESUME_FORMATS: { key: ResumeFormatKey; label: string; desc: string }[] = [
  { key: "apa_7th", label: "APA 7th Edition CV", desc: "Academic & Research Standard" },
  { key: "harvard_executive", label: "Harvard Executive", desc: "Reverse-Chronological" },
  { key: "silicon_valley_modern", label: "Silicon Valley Modern", desc: "Tech & Engineering Impact" },
  { key: "ieee_engineering", label: "IEEE Engineering", desc: "Numbered R&D Specification" },
  { key: "ats_strict", label: "ATS Strict Parser-Safe", desc: "Workday / Greenhouse / Lever" },
];

export default function ResumeStudio() {
  const { profile: p, apps, appConfig, setAppConfig } = useStore();
  const [renderedText, setRenderedText] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [formatLabel, setFormatLabel] = useState("APA 7th Edition");
  const [viewMode, setViewMode] = useState<"formatted" | "plaintext">("formatted");
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("master");
  const [loadingRender, setLoadingRender] = useState(false);
  const [copied, setCopied] = useState(false);
  const [appliedToast, setAppliedToast] = useState(false);

  const hasProfile = Boolean(p.name || p.skills.length > 0);

  useEffect(() => {
    apiGet<any[]>("/jobs?q=Engineer")
      .then((res) => {
        if (Array.isArray(res)) setAvailableJobs(res.slice(0, 25));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasProfile) return;
    const targetJob =
      selectedJobId === "master"
        ? null
        : availableJobs.find((j) => j.id === selectedJobId) || null;

    setLoadingRender(true);
    api<{
      text: string;
      html: string;
      format_label: string;
    }>("/profile/render-resume", {
      profile: p,
      format: appConfig.resumeFormat,
      job: targetJob,
      config: appConfig,
    })
      .then((res) => {
        if (res) {
          setRenderedText(res.text || "");
          setRenderedHtml(res.html || "");
          setFormatLabel(res.format_label || appConfig.resumeFormat);
        }
      })
      .catch(() => {})
      .finally(() => setLoadingRender(false));
  }, [p, appConfig, selectedJobId, availableJobs, hasProfile]);

  const handleApplyToAgents = () => {
    setAppliedToast(true);
    setTimeout(() => setAppliedToast(false), 4000);
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

  const openPrintWindow = () => {
    if (!renderedHtml) {
      window.print();
      return;
    }
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(renderedHtml);
      w.document.close();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="APA Resume & 20 Apply Configurations"
        sub="Configure 20 autonomous application parameters, select resume design architecture, and inspect real-time dynamic bot tailoring for target job descriptions."
        action={
          hasProfile ? (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleApplyToAgents}
                className="btn btn-primary text-xs flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Apply to Auto-Apply Agents</span>
              </button>
              <button
                className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5 hover:border-black"
                onClick={() =>
                  downloadTextFile(
                    renderedText,
                    `${(p.name || "Candidate").replace(/\s+/g, "_")}_${appConfig.resumeFormat}.txt`
                  )
                }
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.txt)</span>
              </button>
              <button
                className="btn text-xs bg-bg2 border border-line flex items-center gap-1.5 hover:border-black"
                onClick={openPrintWindow}
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print / Save PDF</span>
              </button>
              <Link href="/profile" className="btn text-xs border border-line flex items-center gap-1.5 hover:border-black">
                <span>Edit Career DNA</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : null
        }
      />

      {appliedToast && (
        <div className="card p-3 bg-black text-white rounded-lg flex items-center justify-between text-xs font-mono shadow-md">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>20 parameters and resume design format applied to auto-apply agent workforce.</span>
          </div>
          <Link href="/agents" className="underline text-neutral-300 hover:text-white">
            View Swarm →
          </Link>
        </div>
      )}

      {!hasProfile ? (
        <Empty
          title="No Career DNA Profile Found"
          hint="Construct your Career DNA from GitHub, LinkedIn, Portfolio links, or upload a resume first to generate real candidate resumes."
        >
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/profile" className="btn btn-primary text-xs">
              Construct Career DNA with LLM
            </Link>
            <Link href="/onboarding" className="btn text-xs">
              Upload Resume PDF / TXT
            </Link>
          </div>
        </Empty>
      ) : (
        <>
          {/* Section 1: 20 Apply Configurations */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Section 1: 20 Apply Configurations for Autonomous Swarm</span>
            </div>
            <ApplicationConfigPanel onApplyToAgents={handleApplyToAgents} />
          </section>

          {/* Section 2: Resume Design Format & Live Preview */}
          <section className="card p-5 bg-white border border-neutral-300 rounded-lg space-y-4 text-black">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
              <div>
                <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
                  SECTION 2: RESUME DESIGN ARCHITECTURE & LIVE PREVIEW
                </div>
                <h3 className="text-sm font-semibold text-black mt-0.5">
                  Live Design Preview (Updates instantly when you customize any configuration)
                </h3>
              </div>
              <div className="text-xs font-mono text-neutral-600">
                {p.evidence.length} Evidence Records
              </div>
            </div>

            {/* 5 Architecture Selector */}
            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1.5">
                Select Resume Design Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {RESUME_FORMATS.map((fmt) => {
                  const active = appConfig.resumeFormat === fmt.key;
                  return (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setAppConfig({ resumeFormat: fmt.key })}
                      className={`p-3 rounded border text-left transition ${
                        active
                          ? "bg-black text-white border-black"
                          : "bg-white text-black border-neutral-300 hover:border-black"
                      }`}
                    >
                      <div className="text-xs font-semibold">{fmt.label}</div>
                      <div className={`text-[10px] font-mono mt-1 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                        {fmt.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Job Fit Selector & View Mode */}
            <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1 min-w-[260px]">
                <label className="text-[11px] font-mono uppercase text-neutral-600 block mb-1">
                  Dynamic Bot Job-Fit Preview (Adjusts Skills, Summary & Projects to Target JD)
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-neutral-300 rounded bg-white text-black font-mono"
                >
                  <option value="master">Master Career DNA Resume (Unfiltered Baseline)</option>
                  {availableJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      Tailor for: {j.title} @ {j.company} ({j.skills?.slice(0, 3).join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode("formatted")}
                  className={`px-3 py-2 text-xs font-mono rounded border ${
                    viewMode === "formatted"
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-neutral-300"
                  }`}
                >
                  Document Preview
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("plaintext")}
                  className={`px-3 py-2 text-xs font-mono rounded border ${
                    viewMode === "plaintext"
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-neutral-300"
                  }`}
                >
                  Raw Text
                </button>
              </div>
            </div>

            {/* Live Rendered Display Box */}
            <div className="border border-neutral-300 rounded-lg p-4 bg-neutral-50 text-black">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-3 mb-3 border-b border-neutral-200 text-xs font-mono">
                <span className="text-neutral-700">
                  {loadingRender
                    ? "Updating live preview..."
                    : `Format: ${formatLabel} · Density: ${appConfig.pageDensity}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(renderedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 bg-black text-white rounded text-xs hover:bg-neutral-800"
                >
                  {copied ? "Copied Plaintext" : "Copy Resume Text"}
                </button>
              </div>

              {viewMode === "plaintext" ? (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-white p-5 border border-neutral-200 rounded overflow-x-auto text-black">
                  {renderedText}
                </pre>
              ) : (
                <iframe
                  title="Formatted Resume Document Preview"
                  srcDoc={renderedHtml}
                  className="w-full h-[760px] border border-neutral-200 rounded bg-white shadow-xs"
                />
              )}
            </div>
          </section>

          {/* Section 3: Job-Specific Tailored Applications List */}
          <Reveal i={1}>
            <section className="space-y-3">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-ink">Bot-Constructed Job Resumes ({apps.length})</h2>
                <span className="text-xs text-muted font-mono">Per-Job Tailored & Evidence-Verified</span>
              </div>

              {apps.length === 0 ? (
                <div className="card p-6 text-center text-muted text-sm border border-line">
                  No job-specific resumes constructed yet. Launch parallel bots in{" "}
                  <Link className="underline text-ink font-medium" href="/agents">
                    Auto-Apply Agents
                  </Link>{" "}
                  or browse openings in{" "}
                  <Link className="underline text-ink font-medium" href="/jobs">
                    Jobs
                  </Link>
                  .
                </div>
              ) : (
                <div className="space-y-3">
                  {apps.map((a) => (
                    <div key={a.id} className="card p-4 flex flex-wrap justify-between items-center gap-3 border border-line">
                      <div>
                        <div className="font-semibold text-base text-ink">
                          {a.role} — <span className="text-muted">{a.company}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge tone={a.match >= 80 ? "ok" : "n"}>{a.match}% Match</Badge>
                          <Badge>{a.status}</Badge>
                          {a.verified && <Badge tone="ok">Evidence Verified</Badge>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          className="btn text-xs flex items-center gap-1.5"
                          onClick={() =>
                            downloadTextFile(
                              a.resume || renderedText,
                              `${a.company.replace(/\s+/g, "_")}_Tailored_Resume.txt`
                            )
                          }
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Tailored Resume</span>
                        </button>
                        <Link href={`/apply/${a.jobId}`} className="btn text-xs">
                          Inspect in Studio
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </Reveal>
        </>
      )}
    </div>
  );
}
