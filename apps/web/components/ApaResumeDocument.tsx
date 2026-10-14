"use client";
import React, { useState, useMemo } from "react";
import { Check, Copy, Download, Printer } from "lucide-react";

export interface ApaCandidateData {
  name?: string;
  headline?: string;
  email?: string;
  location?: string;
  years?: number;
  education?: string;
  skills?: string[];
  experience?: Array<{ company: string; title: string; text: string; period?: string }>;
  projects?: Array<{ name: string; tech?: string[]; text: string }>;
  evidence?: Array<{ source: string; text: string }>;
  links?: { github?: string; linkedin?: string; portfolio?: string };
}

interface ApaResumeDocumentProps {
  candidate: ApaCandidateData;
  showToolbar?: boolean;
}

export function ApaResumeDocument({ candidate: c, showToolbar = true }: ApaResumeDocumentProps) {
  const [copied, setCopied] = useState(false);

  const surname = useMemo(() => {
    const parts = (c.name || "Candidate").trim().split(" ");
    return parts[parts.length - 1].toUpperCase();
  }, [c.name]);

  const year = new Date().getFullYear();

  const apaText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`RUNNING HEAD: ${surname} / CURRICULUM VITAE                               Page 1\n`);
    lines.push("=".repeat(72) + "\n");
    lines.push((c.name || "Candidate Name").padStart(36 + (c.name?.length || 14) / 2));
    lines.push((c.headline || "Software / AI Systems Engineer").padStart(36 + (c.headline?.length || 28) / 2));
    lines.push(`${c.email || ""}  |  ${c.location || "Remote"}  |  ${c.links?.github || ""}`.padStart(50));
    lines.push("\n" + "=".repeat(72) + "\n");

    lines.push("Professional Abstract\n" + "-".repeat(72));
    lines.push(
      `Technical practitioner with ${c.years || 2}+ years contributing to scalable software systems and artificial intelligence. Specialized technical competencies encompass ${(c.skills || []).slice(0, 6).join(", ")}. Assertions underpinned by verifiable evidence repository.\n`
    );

    lines.push("Academic Preparation & Credentials\n" + "-".repeat(72));
    lines.push(
      `${c.education || "Bachelor of Science in Computer Science"}\nFocus: Applied Computing & Algorithmic Design (${year - Math.max(1, c.years || 2)}-${year})\n`
    );

    lines.push("Technical Competencies & Specializations\n" + "-".repeat(72));
    lines.push(`Core Frameworks: ${(c.skills || []).join(", ")}\n`);

    if (c.experience && c.experience.length > 0) {
      lines.push("Professional Experience & Appointments\n" + "-".repeat(72));
      c.experience.forEach((exp) => {
        lines.push(`${exp.title}${exp.company ? ` | ${exp.company}` : ""}${exp.period ? ` (${exp.period})` : ""}`);
        if (exp.text) lines.push(`    ${exp.text}`);
        lines.push("");
      });
    }

    lines.push("Software Artifacts & Project Contributions (APA 7th Format)\n" + "-".repeat(72));
    (c.projects || []).forEach((proj) => {
      lines.push(`${c.name || "Author"}. (${year}). ${proj.name} [Computer software / ${proj.tech?.join(", ") || "Full Stack"}].`);
      lines.push(`    Description: ${proj.text}\n`);
    });

    if (c.evidence && c.evidence.length > 0) {
      lines.push("Verifiable Evidence Corpus\n" + "-".repeat(72));
      c.evidence.slice(0, 8).forEach((ev, i) => {
        lines.push(`[${i + 1}] Source: ${ev.source}`);
        lines.push(`    Excerpt: "${ev.text.slice(0, 140)}..."\n`);
      });
    }

    return lines.join("\n");
  }, [c, surname, year]);

  const handleCopy = () => {
    navigator.clipboard.writeText(apaText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([apaText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${surname}_Resume_APA_7th.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="card p-6 sm:p-10 bg-white text-black border border-neutral-300 shadow-md font-serif leading-relaxed text-sm">
      {/* APA Running Head */}
      <div className="flex justify-between items-center text-xs text-neutral-600 border-b border-neutral-300 pb-2 mb-8 font-mono">
        <span>RUNNING HEAD: {surname} / CURRICULUM VITAE</span>
        <span>Page 1</span>
      </div>

      {/* APA Title Block */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-normal text-black">{c.name || "Candidate Name"}</h1>
        <div className="text-base italic text-neutral-700 mt-1">{c.headline || "Software / AI Systems Engineer"}</div>
        <div className="text-xs text-neutral-600 mt-2 font-mono flex flex-wrap justify-center items-center gap-2">
          <span>{c.email || "email@example.com"}</span>
          <span>&bull;</span>
          <span>{c.location || "Remote"}</span>
          {c.links?.github && (
            <>
              <span>&bull;</span>
              <span>{c.links.github}</span>
            </>
          )}
          {c.links?.linkedin && (
            <>
              <span>&bull;</span>
              <span>{c.links.linkedin}</span>
            </>
          )}
        </div>
      </div>

      {/* Section 1: Professional Abstract */}
      <div className="mb-6">
        <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
          Professional Abstract
        </h2>
        <p className="text-justify text-sm text-neutral-800 leading-relaxed indent-8">
          Technical practitioner with {c.years || 2}+ years of dedicated experience architecting distributed software applications and artificial intelligence systems. Specialized technical focus spans {(c.skills || []).slice(0, 6).join(", ")}. All technical achievements and capabilities cited herein maintain traceable correspondence with primary source evidence repositories.
        </p>
      </div>

      {/* Section 2: Academic Credentials */}
      <div className="mb-6">
        <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
          Academic Preparation and Credentials
        </h2>
        <div className="text-sm">
          <div className="font-bold text-black">{c.education || "Bachelor of Science in Computer Science"}</div>
          <div className="text-xs text-neutral-600 mt-0.5">
            Curriculum emphasis: Distributed Systems, Algorithmic Analysis, and Computational Logic ({year - Math.max(1, c.years || 2)}&ndash;{year})
          </div>
        </div>
      </div>

      {/* Section 3: Technical Competencies */}
      <div className="mb-6">
        <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
          Technical Competencies and Frameworks
        </h2>
        <div className="flex flex-wrap gap-1.5 text-xs font-mono">
          {(c.skills || []).map((s) => (
            <span key={s} className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Section 4: Professional Experience */}
      {c.experience && c.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
            Professional Experience &amp; Appointments
          </h2>
          <div className="space-y-4 text-sm">
            {c.experience.map((exp, idx) => (
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
      {c.projects && c.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
            Software Artifacts and Project Contributions
          </h2>
          <p className="text-xs text-neutral-500 italic mb-3">
            Documented in accordance with APA 7th Edition software and technical repository citation standards:
          </p>
          <div className="space-y-4 text-sm">
            {c.projects.map((proj) => (
              <div key={proj.name} className="pl-6 -indent-6">
                <p className="leading-snug">
                  <strong>{c.name || "Author"}</strong>. ({year}). <em>{proj.name}</em> [Computer software / {proj.tech?.join(", ") || "Full Stack"}].
                </p>
                <p className="indent-0 text-xs text-neutral-700 mt-1 pl-6">
                  {proj.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 6: Verifiable Evidence Index */}
      {c.evidence && c.evidence.length > 0 && (
        <div className="mb-6">
          <h2 className="text-center font-bold text-xs uppercase border-b border-black pb-1 mb-3 tracking-wider">
            Verifiable Evidence Corpus (Anti-Hallucination Index)
          </h2>
          <div className="space-y-2 text-xs font-mono text-neutral-700">
            {c.evidence.slice(0, 6).map((ev, i) => (
              <div key={i} className="p-2 bg-neutral-50 border border-neutral-200 rounded">
                <span className="font-bold text-black">[{i + 1}] Source: {ev.source}</span>
                <div className="italic text-neutral-600 mt-0.5">&ldquo;{ev.text.slice(0, 160)}...&rdquo;</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Toolbar */}
      {showToolbar && (
        <div className="mt-8 pt-4 border-t border-neutral-300 flex flex-wrap justify-between items-center gap-3 text-xs font-mono text-neutral-600">
          <span>APA 7th Standard &bull; Verified via itsLARP</span>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn text-xs py-1 px-3 bg-black text-white hover:bg-neutral-800 flex items-center gap-1.5"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Plaintext</span>
                </>
              )}
            </button>
            <button
              className="btn text-xs py-1 px-3 bg-white border border-neutral-300 text-black hover:border-black flex items-center gap-1.5"
              onClick={handleDownload}
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .txt</span>
            </button>
            <button
              className="btn text-xs py-1 px-3 bg-white border border-neutral-300 text-black hover:border-black flex items-center gap-1.5"
              onClick={handlePrint}
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
