"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Download, Printer, ArrowRight } from "lucide-react";
import { useStore, type ResumeFormatKey } from "@/lib/store";
import { Badge, Empty, PageHeader, Reveal } from "@/components/ui";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { api, apiGet } from "@/lib/api";

const RESUME_FORMATS: { key: ResumeFormatKey; label: string; badge: string }[] = [
  { key: "apa_7th", label: "APA 7th Edition CV", badge: "Academic & Research Standard" },
  { key: "harvard_executive", label: "Harvard Executive", badge: "Reverse-Chronological" },
  { key: "silicon_valley_modern", label: "Silicon Valley Modern", badge: "Tech & Engineering Impact" },
  { key: "ieee_engineering", label: "IEEE Engineering", badge: "Numbered R&D Specification" },
  { key: "ats_strict", label: "ATS Strict Parser-Safe", badge: "Workday / Greenhouse / Lever" },
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
    <div className="min-h-screen bg-bg text-ink selection:bg-black selection:text-white flex flex-col justify-between">
      <LandingHeader />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-line">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-muted hover:text-ink flex items-center gap-1.5 transition-colors"
          >
            <span>← Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span className="text-dmuted">Active Bot Format: {formatLabel}</span>
          </div>
        </div>

        <PageHeader
          title="Multi-Format Resume & Bot Tailoring Studio"
          sub="Choose the exact resume architecture (APA 7th, Harvard Executive, Silicon Valley Modern, IEEE, or ATS Strict) that autonomous bots construct and dynamically adjust for each job description."
          action={
            hasProfile ? (
              <div className="flex flex-wrap items-center gap-2">
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
                <Link href="/profile" className="btn btn-primary text-xs flex items-center gap-1.5">
                  <span>Edit Career DNA</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : null
          }
        />

        {!hasProfile ? (
          <Empty
            title="No Career DNA Profile Found"
            hint="Construct your Career DNA from GitHub, LinkedIn, Portfolio links, or upload a resume first. All static sample profiles have been removed so your studio uses 100% real candidate data."
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
            {/* 5 Resume Format Selector */}
            <section className="card p-4 mb-6 bg-white border border-neutral-300">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="text-xs font-mono uppercase tracking-wider text-neutral-600">
                  SELECT BOT RESUME DESIGN FORMAT (5 ARCHITECTURES)
                </div>
                <div className="text-xs font-mono text-neutral-500">
                  {p.evidence.length} Verified Evidence Records
                </div>
              </div>
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
                        {fmt.badge}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Per-Job Dynamic Bot Tailoring Selector */}
              <div className="mt-4 pt-4 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex-1 min-w-[240px]">
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
                        Tailor for: {j.title} @ {j.company} ({j.skills?.slice(0, 4).join(", ")})
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
                    Raw Text ({appConfig.resumeFormat})
                  </button>
                </div>
              </div>
            </section>

            {/* Live Rendered Resume Preview */}
            <div className="card p-6 md:p-8 mb-10 bg-white text-black border border-neutral-300 shadow-xs">
              <div className="flex flex-wrap justify-between items-center gap-2 pb-3 mb-4 border-b border-neutral-200 text-xs font-mono">
                <span>
                  {loadingRender
                    ? "Bot tailoring resume to target job description..."
                    : `Rendered in ${formatLabel}`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(renderedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1 bg-black text-white rounded text-xs"
                >
                  {copied ? "Copied Plaintext" : "Copy Resume Text"}
                </button>
              </div>

              {viewMode === "plaintext" ? (
                <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-neutral-50 p-5 border border-neutral-200 rounded overflow-x-auto">
                  {renderedText}
                </pre>
              ) : (
                <iframe
                  title="Formatted Resume Document Preview"
                  srcDoc={renderedHtml}
                  className="w-full h-[760px] border border-neutral-200 rounded bg-white"
                />
              )}
            </div>

            {/* Job-Specific Tailored Applications List */}
            <Reveal i={1}>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold">Bot-Constructed Job Resumes ({apps.length})</h2>
                <span className="text-xs text-muted font-mono">Per-Job Tailored & Evidence-Verified</span>
              </div>

              {apps.length === 0 ? (
                <div className="card p-6 text-center text-muted text-sm">
                  No job-specific resumes constructed yet. Launch parallel bots in{" "}
                  <Link className="underline text-fg font-medium" href="/agents">
                    Auto-Apply Agents
                  </Link>{" "}
                  or tailor an individual role in{" "}
                  <Link className="underline text-fg font-medium" href="/jobs">
                    Jobs
                  </Link>
                  .
                </div>
              ) : (
                <div className="space-y-3">
                  {apps.map((a) => (
                    <div key={a.id} className="card p-4 flex flex-wrap justify-between items-center gap-3">
                      <div>
                        <div className="font-semibold text-base">
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
            </Reveal>
          </>
        )}
      </main>

      <LandingFooter />
    </div>
  );
}
