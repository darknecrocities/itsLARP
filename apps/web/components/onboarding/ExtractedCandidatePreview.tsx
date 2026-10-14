"use client";
import React from "react";
import { Badge } from "@/components/ui";
import { ApaResumeDocument } from "@/components/ApaResumeDocument";
import { Check, Layers, FileText, Edit3, Target, ArrowRight, ArrowLeft } from "lucide-react";

interface ExtractedCandidatePreviewProps {
  extractedCandidate: any;
  setExtractedCandidate: (c: any) => void;
  previewTab: "dna" | "apa";
  setPreviewTab: (tab: "dna" | "apa") => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  updateCandidate: (field: string, val: any) => void;
  saveCandidateInfo: () => Promise<void>;
  busy: boolean;
}

export function ExtractedCandidatePreview({
  extractedCandidate,
  setExtractedCandidate,
  previewTab,
  setPreviewTab,
  isEditing,
  setIsEditing,
  updateCandidate,
  saveCandidateInfo,
  busy,
}: ExtractedCandidatePreviewProps) {
  return (
    <div className="space-y-6 rise">
      {/* Main Container Card */}
      <div className="card p-5 sm:p-7 border-2 border-black bg-bg shadow-sm">
        {/* Header with Title and Mode Switcher */}
        <div className="flex flex-wrap justify-between items-start gap-4 border-b border-line pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                AI PROFILE READY
              </span>
              <Badge tone="ok">{extractedCandidate.extracted_by || "Local LLM"}</Badge>
            </div>
            {!isEditing ? (
              <>
                <h2 className="text-2xl sm:text-3xl font-bold font-sans tracking-tight text-ink">
                  {extractedCandidate.name || "Candidate Name"}
                </h2>
                <div className="text-dmuted text-sm font-medium mt-0.5">
                  {extractedCandidate.headline || "Software Engineer"}
                </div>
              </>
            ) : (
              <div className="space-y-2 mt-2">
                <div>
                  <span className="label-xs text-muted block mb-0.5">FULL NAME</span>
                  <input
                    type="text"
                    className="input text-sm font-bold"
                    value={extractedCandidate.name || ""}
                    onChange={(e) => updateCandidate("name", e.target.value)}
                    placeholder="e.g. Arron Kian Parejas"
                  />
                </div>
                <div>
                  <span className="label-xs text-muted block mb-0.5">HEADLINE</span>
                  <input
                    type="text"
                    className="input text-xs"
                    value={extractedCandidate.headline || ""}
                    onChange={(e) => updateCandidate("headline", e.target.value)}
                    placeholder="e.g. Software / AI Systems Engineer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* View Selector Tabs & Edit Button */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-bg2 p-1 rounded border border-line flex items-center gap-1 text-xs font-mono">
              <button
                type="button"
                className={`px-3 py-1.5 rounded transition-colors font-medium flex items-center gap-1.5 ${
                  previewTab === "dna"
                    ? "bg-black text-white shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => setPreviewTab("dna")}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Career DNA</span>
              </button>
              <button
                type="button"
                className={`px-3 py-1.5 rounded transition-colors font-medium flex items-center gap-1.5 ${
                  previewTab === "apa"
                    ? "bg-black text-white shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
                onClick={() => setPreviewTab("apa")}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>APA 7th Resume</span>
              </button>
            </div>

            <button
              type="button"
              className={`btn text-xs py-1.5 px-3 font-mono border flex items-center gap-1.5 ${
                isEditing ? "bg-black text-white border-black" : "bg-bg2 border-line text-ink"
              }`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Edit</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* TAB 1: Career DNA Details View */}
        {previewTab === "dna" ? (
          <div className="space-y-6">
            {/* 4 Cleanly Aligned & Responsive Metadata Cards */}
            {isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-bg2/50 rounded border border-line text-xs font-mono mb-6">
                <div>
                  <label className="label-xs block mb-1">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    className="input text-xs"
                    value={extractedCandidate.email || ""}
                    onChange={(e) => updateCandidate("email", e.target.value)}
                    placeholder="yourname@gmail.com"
                  />
                </div>
                <div>
                  <label className="label-xs block mb-1">LOCATION</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={extractedCandidate.location || ""}
                    onChange={(e) => updateCandidate("location", e.target.value)}
                    placeholder="e.g. Manila, Philippines or Remote"
                  />
                </div>
                <div>
                  <label className="label-xs block mb-1">EXPERIENCE (YEARS)</label>
                  <input
                    type="number"
                    className="input text-xs"
                    value={extractedCandidate.years || 2}
                    onChange={(e) => updateCandidate("years", e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs block mb-1">EDUCATION / DEGREE</label>
                  <input
                    type="text"
                    className="input text-xs"
                    value={extractedCandidate.education || ""}
                    onChange={(e) => updateCandidate("education", e.target.value)}
                    placeholder="e.g. Bachelor of Science in Computer Science"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono mb-6">
                {/* EMAIL CARD */}
                <div className="p-3 bg-bg2 rounded border border-line flex flex-col justify-between min-w-0">
                  <span className="text-muted text-[10px] font-bold block mb-1.5 uppercase">EMAIL</span>
                  <strong className="text-ink break-all text-xs leading-snug" title={extractedCandidate.email}>
                    {extractedCandidate.email || "Not specified"}
                  </strong>
                </div>

                {/* LOCATION CARD */}
                <div className="p-3 bg-bg2 rounded border border-line flex flex-col justify-between min-w-0">
                  <span className="text-muted text-[10px] font-bold block mb-1.5 uppercase">LOCATION</span>
                  <strong className="text-ink break-words text-xs leading-snug">
                    {extractedCandidate.location || "Remote"}
                  </strong>
                </div>

                {/* EXPERIENCE CARD */}
                <div className="p-3 bg-bg2 rounded border border-line flex flex-col justify-between min-w-0">
                  <span className="text-muted text-[10px] font-bold block mb-1.5 uppercase">EXPERIENCE</span>
                  <strong className="text-ink text-xs leading-snug">
                    {extractedCandidate.years || 2} Years
                  </strong>
                </div>

                {/* EDUCATION CARD */}
                <div className="p-3 bg-bg2 rounded border border-line flex flex-col justify-between min-w-0">
                  <span className="text-muted text-[10px] font-bold block mb-1.5 uppercase">EDUCATION</span>
                  <strong className="text-ink break-words text-xs leading-snug" title={extractedCandidate.education}>
                    {extractedCandidate.education || "Technical Degree"}
                  </strong>
                </div>
              </div>
            )}

            {/* Technical Skills */}
            <div className="mb-6">
              <div className="label-xs mb-2">EXTRACTED TECHNICAL SKILLS ({extractedCandidate.skills?.length || 0})</div>
              <div className="flex flex-wrap gap-1.5">
                {extractedCandidate.skills?.map((s: string) => (
                  <span key={s} className="px-2.5 py-1 bg-bg2 border border-line rounded text-xs font-mono text-ink">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Roles */}
            {extractedCandidate.target_roles && extractedCandidate.target_roles.length > 0 && (
              <div className="mb-6">
                <div className="label-xs mb-1.5">SUGGESTED TARGET ROLES</div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {extractedCandidate.target_roles.map((r: string) => (
                    <span key={r} className="px-2.5 py-1 bg-neutral-100 text-black border border-neutral-300 rounded font-medium flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-neutral-600" />
                      <span>{r}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {extractedCandidate.projects && extractedCandidate.projects.length > 0 && (
              <div className="mb-6">
                <div className="label-xs mb-2">VERIFIED PROJECTS ({extractedCandidate.projects.length})</div>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {extractedCandidate.projects.map((p: any) => (
                    <div key={p.name} className="p-3.5 bg-bg2 rounded border border-line text-xs flex flex-col justify-between">
                      <div>
                        <strong className="text-sm font-sans block text-ink">{p.name}</strong>
                        <p className="text-muted mt-1 leading-relaxed">{p.text}</p>
                      </div>
                      {p.tech && p.tech.length > 0 && (
                        <div className="text-[10px] font-mono text-dmuted mt-3 pt-2 border-t border-line/60">
                          Stack: {p.tech.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* TAB 2: APA 7th Edition Resume Document View */
          <div className="mb-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted">
              <span>Standard APA 7th Edition Paper Output Generated Live From Your Uploaded Data</span>
              <span className="text-ok font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-ok" />
                <span>100% Real Projects &middot; Zero Hallucinations</span>
              </span>
            </div>
            <ApaResumeDocument candidate={extractedCandidate} />
          </div>
        )}

        {/* Bottom Actions Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 pt-5 mt-6 border-t border-line">
          <button
            type="button"
            className="btn text-xs py-2 px-4 flex items-center gap-1.5"
            onClick={() => setExtractedCandidate(null)}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Uploads</span>
          </button>

          <div className="flex items-center gap-2">
            {previewTab === "dna" ? (
              <button
                type="button"
                className="btn text-xs py-2 px-3 font-mono bg-bg2 border border-line text-ink hover:border-black flex items-center gap-1.5"
                onClick={() => setPreviewTab("apa")}
              >
                <span>View APA Resume</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                className="btn text-xs py-2 px-3 font-mono bg-bg2 border border-line text-ink hover:border-black flex items-center gap-1.5"
                onClick={() => setPreviewTab("dna")}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Review Career DNA</span>
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary text-sm py-2 px-6 font-semibold shadow-sm flex items-center gap-2"
              disabled={busy}
              onClick={saveCandidateInfo}
            >
              <Check className="w-4 h-4" />
              <span>{busy ? "Saving Career DNA..." : "Confirm & Save to Career DNA"}</span>
              {!busy && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
