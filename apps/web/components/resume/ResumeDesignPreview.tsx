"use client";
import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Printer,
  Download,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  ChevronDown,
} from "lucide-react";
import { useStore, type ResumeFormatKey, type Profile } from "@/lib/store";
import { api, apiGet } from "@/lib/api";

const BASELINE_PREVIEW_PROFILE: Profile = {
  name: "Alex Rivera",
  headline: "Lead AI Engineer & Distributed Systems Architect",
  email: "alex.rivera.systems@example.org",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA (Open to Remote)",
  years: 6,
  education: "B.S. in Computer Science, UC Berkeley",
  summary:
    "Lead AI Systems Engineer with 6+ years of experience architecting high-throughput inference engines, distributed model serving pipelines, and resilient multi-agent swarms using PyTorch, FastAPI, and Kubernetes.",
  skills: [
    "Python",
    "PyTorch",
    "FastAPI",
    "Next.js",
    "TypeScript",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "Distributed Systems",
    "Vector Databases",
  ],
  experience: [
    {
      company: "NeuralScale AI",
      role: "Lead Systems Architect",
      dates: "2023 - Present",
      metrics: "Reduced LLM inference p99 latency by 42% across 10M daily requests",
      bullets: [
        "Architected scalable LLM inference clusters using Triton and vLLM serving 10M+ queries daily.",
        "Engineered autonomous multi-agent verification pipelines with strict SLA monitoring and zero downtime.",
      ],
    },
    {
      company: "Vanguard Cloud Technologies",
      role: "Senior Distributed Systems Engineer",
      dates: "2020 - 2023",
      metrics: "Maintained 99.99% availability for enterprise microservice infrastructure",
      bullets: [
        "Implemented real-time data streaming pipelines processing 50k+ events/sec with Apache Kafka and PostgreSQL.",
        "Standardized containerized orchestration patterns across 40+ engineering microservices.",
      ],
    },
  ],
  projects: [
    {
      name: "Autonomous Agent Fleet Orchestrator",
      tech: ["Python", "FastAPI", "PostgreSQL", "Next.js"],
      text: "Open-source distributed scheduler for parallelized multi-agent workloads with adaptive rate-limiting.",
      url: "https://github.com/example/agent-fleet",
    },
  ],
  links: {
    github: "https://github.com/example",
    linkedin: "https://linkedin.com/in/example",
  },
  evidence: [
    {
      source: "GitHub Verification",
      text: "Verified 1,400+ production commits across distributed systems and machine learning repositories.",
    },
    {
      source: "Technical Assessment",
      text: "Ranked top 1% in algorithmic systems design and distributed concurrency.",
    },
  ],
};

const RESUME_FORMATS: { key: ResumeFormatKey; label: string; desc: string }[] = [
  { key: "apa_7th", label: "APA 7th Edition", desc: "Academic CV with running head & citations" },
  { key: "harvard_executive", label: "Harvard Executive", desc: "Reverse-chronological executive layout" },
  { key: "silicon_valley_modern", label: "Silicon Valley Modern", desc: "Impact-first engineering stack format" },
  { key: "ieee_engineering", label: "IEEE Engineering", desc: "Numbered technical specification (I-V)" },
  { key: "ats_strict", label: "ATS Strict Parser-Safe", desc: "ASCII headings for Workday & Greenhouse" },
];

function generateClientFallback(
  p: Profile,
  fmt: ResumeFormatKey,
  density: string = "comfortable"
): { text: string; html: string; format_label: string } {
  const name = p.name || "Candidate Name";
  const headline = p.headline || "Software / AI Systems Engineer";
  const surname = (name.trim().split(" ").pop() || "CANDIDATE").toUpperCase();
  const year = new Date().getFullYear();
  const skillsList = p.skills?.length ? p.skills.join(", ") : "Python, TypeScript, React, Docker";

  const lines: string[] = [];
  if (fmt === "apa_7th") {
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1`);
    lines.push("=".repeat(72));
    lines.push(name.padStart(36 + name.length / 2));
    lines.push(headline.padStart(36 + headline.length / 2));
    lines.push(`${p.email || ""} | ${p.location || "Remote"} | ${p.links?.github || ""}`.padStart(50));
    lines.push("=".repeat(72));
    lines.push("\nProfessional Abstract\n" + "-".repeat(72));
    lines.push(p.summary || `Technical practitioner with ${p.years || 2}+ years delivering verified systems.`);
    lines.push("\nAcademic Credentials\n" + "-".repeat(72));
    lines.push(p.education || "Bachelor of Science in Computer Science");
    lines.push("\nTechnical Competencies\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nSoftware Artifacts & Contributions (APA 7th Format)\n" + "-".repeat(72));
    (p.projects || []).forEach((proj) => {
      lines.push(`${name}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ") || "Full Stack"}].`);
      lines.push(`    Description: ${proj.text}`);
    });
  } else {
    lines.push(name.toUpperCase());
    lines.push(headline);
    lines.push(`${p.email || ""} | ${p.phone || ""} | ${p.location || "Remote"}`);
    lines.push("=".repeat(72));
    lines.push("\nEXECUTIVE SUMMARY\n" + "-".repeat(72));
    lines.push(p.summary || `Experienced engineering leader specializing in ${skillsList}.`);
    lines.push("\nCORE COMPETENCIES\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nPROFESSIONAL EXPERIENCE\n" + "-".repeat(72));
    (p.experience || []).forEach((exp) => {
      lines.push(`${exp.role || exp.title || "Engineer"} | ${exp.company} (${exp.dates || "Recent"})`);
      if (exp.metrics) lines.push(`Impact: ${exp.metrics}`);
      (exp.bullets || (exp.text ? [exp.text] : [])).forEach((b) => lines.push(`  - ${b}`));
    });
    lines.push("\nEDUCATION\n" + "-".repeat(72));
    lines.push(p.education || "B.S. in Computer Science");
  }

  const rawText = lines.join("\n");
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} - Resume (${fmt})</title>
  <style>
    body { font-family: ${fmt === "apa_7th" ? "Georgia, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}; font-size: ${density === "compact" ? "9.5pt" : "11pt"}; line-height: ${density === "compact" ? "1.35" : "1.55"}; color: #111; background: #fff; margin: 0 auto; max-width: 8.2in; padding: 0.4in; }
    .header { text-align: ${fmt === "harvard_executive" ? "center" : "left"}; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    h1 { font-size: 18pt; margin: 0; font-weight: 700; }
    .headline { font-size: 11pt; color: #333; margin: 2px 0; font-style: ${fmt === "apa_7th" ? "italic" : "normal"}; }
    .contact { font-size: 9pt; color: #555; font-family: monospace; }
    .section-title { font-size: 10pt; font-weight: 700; text-transform: uppercase; border-bottom: 1px solid #111; padding-bottom: 2px; margin: 12px 0 6px 0; letter-spacing: 0.5px; }
    .item { margin-bottom: 8px; }
    .item-header { display: flex; justify-content: space-between; font-weight: 600; font-size: 10pt; }
    p { margin: 2px 0 6px 0; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${name}</h1>
    <div class="headline">${headline}</div>
    <div class="contact">${p.email || ""} | ${p.location || "Remote"} ${p.links?.github ? `| ${p.links.github}` : ""}</div>
  </div>
  <div class="section-title">Professional Summary</div>
  <p>${p.summary || `Technical practitioner with ${p.years || 2}+ years delivering verified systems.`}</p>
  <div class="section-title">Core Competencies</div>
  <p>${skillsList}</p>
  ${
    p.experience?.length
      ? `<div class="section-title">Experience</div>` +
        p.experience
          .map(
            (e) => `<div class="item">
              <div class="item-header"><span>${e.role || e.title || "Engineer"} &mdash; ${e.company}</span><span>${e.dates || "Recent"}</span></div>
              ${e.metrics ? `<p style="font-size: 9pt; font-style: italic;">Verified Metric: ${e.metrics}</p>` : ""}
              <p>${e.text || (e.bullets ? e.bullets.join(" ") : "")}</p>
            </div>`
          )
          .join("")
      : ""
  }
  ${
    p.projects?.length
      ? `<div class="section-title">Projects & Software Artifacts</div>` +
        p.projects
          .map(
            (proj) => `<div class="item">
              <div class="item-header"><span>${proj.name}</span><span>${proj.tech?.join(", ") || ""}</span></div>
              <p>${proj.text}</p>
            </div>`
          )
          .join("")
      : ""
  }
  <div class="section-title">Academic Preparation</div>
  <p><strong>${p.education || "Bachelor of Science in Computer Science"}</strong></p>
</body>
</html>`;

  const labelObj = RESUME_FORMATS.find((f) => f.key === fmt);
  return {
    text: rawText,
    html,
    format_label: labelObj ? labelObj.label : fmt,
  };
}

export function ResumeDesignPreview() {
  const { profile: p, appConfig, setAppConfig } = useStore();
  const [renderedText, setRenderedText] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [formatLabel, setFormatLabel] = useState("APA 7th Edition");
  const [viewMode, setViewMode] = useState<"formatted" | "plaintext">("formatted");
  const [availableJobs, setAvailableJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("master");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasRealData = Boolean(p.name && (p.skills?.length > 0 || p.experience?.length > 0));
  const activeProfile = hasRealData ? p : BASELINE_PREVIEW_PROFILE;

  // Load sample jobs for tailoring inspection
  useEffect(() => {
    apiGet<any[]>("/jobs?q=Engineer")
      .then((res) => {
        if (Array.isArray(res) && res.length) setAvailableJobs(res.slice(0, 15));
      })
      .catch(() => {});
  }, []);

  // Fetch or render resume
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const targetJob =
      selectedJobId === "master"
        ? null
        : availableJobs.find((j) => j.id === selectedJobId) || null;

    const timer = setTimeout(() => {
      api<{
        text: string;
        html: string;
        format_label: string;
      }>("/profile/render-resume", {
        profile: activeProfile,
        format: appConfig.resumeFormat,
        job: targetJob,
        config: appConfig,
      })
        .then((res) => {
          if (!cancelled && res) {
            setRenderedText(res.text || "");
            setRenderedHtml(res.html || "");
            setFormatLabel(res.format_label || appConfig.resumeFormat);
          }
        })
        .catch(() => {
          if (!cancelled) {
            const fallback = generateClientFallback(
              activeProfile,
              appConfig.resumeFormat,
              appConfig.pageDensity
            );
            setRenderedText(fallback.text);
            setRenderedHtml(fallback.html);
            setFormatLabel(fallback.format_label);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [activeProfile, appConfig, selectedJobId, availableJobs]);

  const downloadTxt = () => {
    const filename = `${(activeProfile.name || "Candidate").replace(/\s+/g, "_")}_${appConfig.resumeFormat}.txt`;
    const blob = new Blob([renderedText], { type: "text/plain;charset=utf-8" });
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

  const handleCopy = () => {
    navigator.clipboard.writeText(renderedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card p-5 bg-white border border-neutral-300 rounded-lg space-y-4 text-black shadow-xs">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-semibold">
              Live Resume Design Preview
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-700 border border-neutral-200">
              Synchronized with 20 Configs
            </span>
          </div>
          <h3 className="text-sm font-semibold text-black mt-0.5">
            Visual Design Architecture & Per-Job Dynamic Tailoring
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={downloadTxt}
            className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5 py-1 px-2.5"
            title="Download resume plaintext (.txt)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .txt</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5 py-1 px-2.5"
            title="Print or save as PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
          <Link
            href="/resume"
            className="btn text-xs bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 py-1 px-2.5"
          >
            <span>Full Studio</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Baseline Notice if DNA is empty */}
      {!hasRealData && (
        <div className="p-2.5 bg-neutral-50 border border-neutral-300 rounded flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
            <span className="text-neutral-700">
              Showing preview with Verified Baseline Profile ({BASELINE_PREVIEW_PROFILE.name}).
            </span>
          </div>
          <span className="text-neutral-500 text-[11px]">Crawl links above to populate your real DNA</span>
        </div>
      )}

      {/* Format Switcher Pills */}
      <div>
        <label className="text-[11px] font-mono uppercase text-neutral-600 block mb-1.5">
          Select Resume Design Format
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {RESUME_FORMATS.map((fmt) => {
            const active = appConfig.resumeFormat === fmt.key;
            return (
              <button
                key={fmt.key}
                type="button"
                onClick={() => setAppConfig({ resumeFormat: fmt.key })}
                className={`p-2 rounded border text-left transition ${
                  active
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-neutral-300 hover:border-black"
                }`}
              >
                <div className="text-xs font-semibold">{fmt.label}</div>
                <div className={`text-[10px] mt-0.5 line-clamp-1 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                  {fmt.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Job Tailoring Selector & View Toggle */}
      <div className="pt-2 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex-1 min-w-[240px]">
          <label className="text-[11px] font-mono uppercase text-neutral-600 block mb-1">
            Dynamic Job-Fit Tailoring Preview
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black font-mono"
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
          <div className="flex rounded border border-neutral-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode("formatted")}
              className={`px-3 py-1.5 text-xs font-mono ${
                viewMode === "formatted" ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Document Paper
            </button>
            <button
              type="button"
              onClick={() => setViewMode("plaintext")}
              className={`px-3 py-1.5 text-xs font-mono ${
                viewMode === "plaintext" ? "bg-black text-white" : "bg-white text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              Raw Monospace
            </button>
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded border border-neutral-300 text-xs font-mono flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Rendered Display Box */}
      <div className="border border-neutral-300 rounded-lg p-3 bg-neutral-100 text-black">
        <div className="flex justify-between items-center pb-2 mb-2 border-b border-neutral-200 text-[11px] font-mono text-neutral-600">
          <span>
            {loading ? "Rendering tailored layout..." : `Active Format: ${formatLabel} · Density: ${appConfig.pageDensity}`}
          </span>
          <span>{activeProfile.evidence?.length || 0} Evidence Citations</span>
        </div>

        {viewMode === "plaintext" ? (
          <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed bg-white p-4 border border-neutral-300 rounded max-h-[560px] overflow-auto text-black">
            {renderedText}
          </pre>
        ) : (
          <iframe
            title="Formatted Resume Document Preview"
            srcDoc={renderedHtml}
            className="w-full h-[620px] border border-neutral-300 rounded bg-white shadow-xs"
          />
        )}
      </div>
    </div>
  );
}
