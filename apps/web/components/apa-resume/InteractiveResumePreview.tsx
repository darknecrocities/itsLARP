"use client";
import React, { useState, useEffect } from "react";
import { Download, Printer, Copy, Check, ExternalLink, Sparkles, FileText, Code2 } from "lucide-react";
import { useStore, type ResumeFormatKey, type Profile } from "@/lib/store";
import { api, apiGet } from "@/lib/api";

const SHOWCASE_PREVIEW_PROFILE: Profile = {
  name: "Alex Rivera",
  headline: "Lead AI Systems Engineer & Distributed Architect",
  email: "alex.rivera.systems@example.org",
  phone: "+1 (555) 019-2834",
  location: "San Francisco, CA (Open to Remote)",
  years: 6,
  education: "B.S. in Computer Science, UC Berkeley (Honors in Systems)",
  summary:
    "Lead AI Systems Engineer with 6+ years of experience architecting high-throughput inference engines, distributed model serving pipelines, and resilient multi-agent swarms using PyTorch, FastAPI, and Kubernetes.",
  skills: [
    "Python",
    "PyTorch",
    "Distributed Systems",
    "vLLM",
    "FastAPI",
    "Kubernetes",
    "Docker",
    "PostgreSQL",
    "TypeScript",
    "Next.js",
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
        "Reduced cluster GPU idle memory by 35% through dynamic KV-cache page re-allocation.",
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
    {
      name: "Quantized Inference Engine (QInfer)",
      tech: ["PyTorch", "CUDA", "C++"],
      text: "Zero-loss INT8 quantization runner achieving 2.4x throughput on consumer hardware.",
      url: "https://github.com/example/qinfer",
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

const SAMPLE_TAILOR_TARGETS = [
  {
    id: "master",
    label: "Master Baseline (Unfiltered Career DNA)",
    company: "Standard Baseline",
    skills: ["Python", "Distributed Systems", "PyTorch"],
  },
  {
    id: "ai_research",
    label: "Tailor for: AI Research Scientist @ DeepMind",
    company: "Google DeepMind",
    title: "AI Research Scientist",
    skills: ["PyTorch", "vLLM", "CUDA", "Distributed Systems"],
    description: "Seeking AI Research Scientist with expertise in large language model inference, distributed training, and PyTorch optimization.",
  },
  {
    id: "distributed_stripe",
    label: "Tailor for: Staff Distributed Systems Engineer @ Stripe",
    company: "Stripe",
    title: "Staff Distributed Systems Engineer",
    skills: ["Distributed Systems", "Kubernetes", "PostgreSQL", "High Throughput"],
    description: "Seeking a Staff Distributed Systems Engineer to scale core payment processing pipelines with strict SLAs and sub-50ms latency.",
  },
  {
    id: "yc_fullstack",
    label: "Tailor for: Founding Fullstack Engineer @ YC Startup",
    company: "YC Series A Startup",
    title: "Founding Fullstack Engineer",
    skills: ["TypeScript", "Next.js", "Python", "FastAPI"],
    description: "Looking for an agile founding fullstack engineer to ship rapid customer-facing AI workflows with Next.js and FastAPI.",
  },
];

const FORMAT_OPTIONS: { key: ResumeFormatKey; label: string; desc: string }[] = [
  { key: "apa_7th", label: "APA 7th Edition", desc: "Academic running head & citations" },
  { key: "harvard_executive", label: "Harvard Executive", desc: "Reverse-chronological leadership" },
  { key: "silicon_valley_modern", label: "Silicon Valley Modern", desc: "Impact-first engineering format" },
  { key: "ieee_engineering", label: "IEEE Engineering", desc: "Numbered technical specification" },
  { key: "ats_strict", label: "ATS Strict Parser-Safe", desc: "100% parse-proof ASCII hierarchy" },
];

function generateClientFallback(
  p: Profile,
  fmt: ResumeFormatKey
): { text: string; html: string; format_label: string } {
  const name = p.name || "Alex Rivera";
  const headline = p.headline || "Lead AI Systems Engineer & Distributed Architect";
  const surname = (name.trim().split(" ").pop() || "RIVERA").toUpperCase();
  const year = new Date().getFullYear();
  const skillsList = p.skills?.join(", ") || "Python, PyTorch, Distributed Systems, FastAPI";

  const lines: string[] = [];
  if (fmt === "apa_7th") {
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1`);
    lines.push("=".repeat(72));
    lines.push(name.padStart(36 + name.length / 2));
    lines.push(headline.padStart(36 + headline.length / 2));
    lines.push(`${p.email} | ${p.location} | ${p.links?.github}`.padStart(50));
    lines.push("=".repeat(72));
    lines.push("\nProfessional Abstract\n" + "-".repeat(72));
    lines.push(p.summary || "Technical practitioner with 6+ years delivering verified systems.");
    lines.push("\nAcademic Credentials & Honors\n" + "-".repeat(72));
    lines.push(p.education || "B.S. in Computer Science");
    lines.push("\nCore Competencies\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nSoftware Artifacts & Contributions (APA 7th Format)\n" + "-".repeat(72));
    p.projects.forEach((proj) => {
      lines.push(`${name}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ")}].`);
      lines.push(`    Evidence URL: ${proj.url}`);
      lines.push(`    System Description: ${proj.text}`);
    });
  } else {
    lines.push(name.toUpperCase());
    lines.push(headline);
    lines.push(`${p.email} | ${p.phone} | ${p.location}`);
    lines.push("=".repeat(72));
    lines.push("\nEXECUTIVE SUMMARY\n" + "-".repeat(72));
    lines.push(p.summary || "Technical leader specializing in high-throughput distributed systems.");
    lines.push("\nCORE COMPETENCIES & TOOLING\n" + "-".repeat(72));
    lines.push(skillsList);
    lines.push("\nPROFESSIONAL SYSTEMS EXPERIENCE\n" + "-".repeat(72));
    p.experience.forEach((exp) => {
      lines.push(`${exp.role} | ${exp.company} (${exp.dates})`);
      if (exp.metrics) lines.push(`Verified Impact: ${exp.metrics}`);
      exp.bullets?.forEach((b) => lines.push(`  - ${b}`));
    });
    lines.push("\nACADEMIC PREPARATION\n" + "-".repeat(72));
    lines.push(p.education);
  }

  const rawText = lines.join("\n");
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${name} - Resume (${fmt})</title>
  <style>
    body { font-family: ${fmt === "apa_7th" ? "Georgia, serif" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"}; font-size: 10.5pt; line-height: 1.5; color: #111; background: #fff; margin: 0 auto; max-width: 8.2in; padding: 0.4in; }
    .header { text-align: ${fmt === "harvard_executive" ? "center" : "left"}; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
    h1 { font-size: 18pt; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
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
    <div class="contact">${p.email} | ${p.location} | ${p.links?.github}</div>
  </div>
  <div class="section-title">Professional Summary</div>
  <p>${p.summary}</p>
  <div class="section-title">Core Competencies</div>
  <p>${skillsList}</p>
  <div class="section-title">Experience</div>
  ${p.experience
    .map(
      (e) => `<div class="item">
        <div class="item-header"><span>${e.role} &mdash; ${e.company}</span><span>${e.dates}</span></div>
        ${e.metrics ? `<p style="font-size: 9pt; font-style: italic;">Verified Metric: ${e.metrics}</p>` : ""}
        <p>${e.bullets?.join(" ") || ""}</p>
      </div>`
    )
    .join("")}
  <div class="section-title">Software Artifacts & Contributions</div>
  ${p.projects
    .map(
      (proj) => `<div class="item">
        <div class="item-header"><span>${proj.name}</span><span>${proj.tech?.join(", ")}</span></div>
        <p>${proj.text}</p>
      </div>`
    )
    .join("")}
  <div class="section-title">Academic Preparation</div>
  <p><strong>${p.education}</strong></p>
</body>
</html>`;

  const labelObj = FORMAT_OPTIONS.find((f) => f.key === fmt);
  return {
    text: rawText,
    html,
    format_label: labelObj ? labelObj.label : fmt,
  };
}

interface InteractiveResumePreviewProps {
  initialFormat?: ResumeFormatKey;
}

export function InteractiveResumePreview({
  initialFormat = "apa_7th",
}: InteractiveResumePreviewProps) {
  const [selectedFormat, setSelectedFormat] = useState<ResumeFormatKey>(initialFormat);
  const [targetJobId, setTargetJobId] = useState<string>("master");
  const [viewMode, setViewMode] = useState<"formatted" | "plaintext">("formatted");
  const [renderedText, setRenderedText] = useState("");
  const [renderedHtml, setRenderedHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const targetJob =
      targetJobId === "master"
        ? null
        : SAMPLE_TAILOR_TARGETS.find((j) => j.id === targetJobId) || null;

    api<{ text: string; html: string; format_label: string }>("/profile/render-resume", {
      profile: SHOWCASE_PREVIEW_PROFILE,
      format: selectedFormat,
      job: targetJob,
      config: { resumeFormat: selectedFormat, pageDensity: "comfortable" },
    })
      .then((res) => {
        if (!cancelled && res) {
          setRenderedText(res.text || "");
          setRenderedHtml(res.html || "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          const fallback = generateClientFallback(SHOWCASE_PREVIEW_PROFILE, selectedFormat);
          setRenderedText(fallback.text);
          setRenderedHtml(fallback.html);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedFormat, targetJobId]);

  const handleDownload = () => {
    const filename = `Alex_Rivera_Resume_${selectedFormat}.txt`;
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
    <section id="live-preview" className="py-12 sm:py-16 border-b border-line bg-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="max-w-xl">
            <div className="text-[11px] font-mono uppercase tracking-widest text-neutral-500 font-semibold">
              Live Interactive Document Preview
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-950 mt-1">
              Inspect Real Generated Resumes
            </h2>
            <p className="text-neutral-600 text-xs sm:text-sm mt-1.5 leading-relaxed">
              Toggle between the 5 architectures below to witness how running heads, academic citations,
              leadership scopes, and technical Roman numerals transform the document in real time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownload}
              className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5 py-1.5 px-3"
              title="Download plaintext (.txt)"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="btn text-xs bg-white border border-neutral-300 hover:border-black flex items-center gap-1.5 py-1.5 px-3"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="btn text-xs bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5 py-1.5 px-3"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy Plaintext"}</span>
            </button>
          </div>
        </div>

        {/* Style Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
          {FORMAT_OPTIONS.map((opt) => {
            const active = selectedFormat === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => setSelectedFormat(opt.key)}
                className={`p-3 rounded-lg border text-left transition-all ${
                  active
                    ? "bg-black text-white border-black shadow-xs"
                    : "bg-white text-neutral-900 border-neutral-300 hover:border-black"
                }`}
              >
                <div className="text-xs font-bold">{opt.label}</div>
                <div className={`text-[10px] font-mono mt-0.5 line-clamp-1 ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                  {opt.desc}
                </div>
              </button>
            );
          })}
        </div>

        {/* Target Job Simulator Dropdown & View Mode Switcher */}
        <div className="p-3 bg-neutral-100 border border-neutral-300 rounded-t-lg flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <span className="text-[11px] font-mono uppercase text-neutral-600 font-semibold whitespace-nowrap">
              Test Agent Job Fit:
            </span>
            <select
              value={targetJobId}
              onChange={(e) => setTargetJobId(e.target.value)}
              className="w-full max-w-md px-2.5 py-1.5 text-xs border border-neutral-300 rounded bg-white text-black font-mono focus:outline-none"
            >
              {SAMPLE_TAILOR_TARGETS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 rounded border border-neutral-300 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("formatted")}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === "formatted" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Document Paper</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("plaintext")}
              className={`px-3 py-1 rounded text-xs font-mono font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === "plaintext" ? "bg-black text-white" : "text-neutral-600 hover:text-black"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Raw Monospace</span>
            </button>
          </div>
        </div>

        {/* Document Display Box */}
        <div className="border-x border-b border-neutral-300 rounded-b-lg p-4 sm:p-6 bg-neutral-200/60 flex justify-center">
          {viewMode === "plaintext" ? (
            <div className="w-full max-w-4xl bg-white border border-neutral-300 rounded-lg p-5 font-mono text-xs text-black leading-relaxed shadow-sm overflow-x-auto max-h-[700px]">
              <div className="pb-3 mb-3 border-b border-neutral-200 text-neutral-500 flex justify-between">
                <span>FORMAT: {selectedFormat.toUpperCase()}</span>
                <span>PARSER SAFETY: GUARANTEED ASCII</span>
              </div>
              <pre className="whitespace-pre-wrap">{renderedText}</pre>
            </div>
          ) : (
            <div className="w-full max-w-4xl bg-white border border-neutral-300 rounded-lg shadow-md overflow-hidden">
              <iframe
                title="Formatted Live Resume Document"
                srcDoc={renderedHtml}
                className="w-full h-[720px] bg-white border-0"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
