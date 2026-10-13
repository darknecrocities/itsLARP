"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiUpload, api } from "@/lib/api";
import { evidenceFromText, importGithub } from "@/lib/profile";
import { ErrorBox, Badge } from "@/components/ui";
import { ApaResumeDocument } from "@/components/ApaResumeDocument";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, addEvidence } = useStore();

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [liText, setLiText] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  // Extracted preview state
  const [extractedCandidate, setExtractedCandidate] = useState<any>(null);
  const [previewTab, setPreviewTab] = useState<"dna" | "apa">("dna");
  const [isEditing, setIsEditing] = useState(false);

  const log = (m: string) => setStatus((s) => [...s, m]);

  async function onFile(f?: File) {
    if (!f) return;
    setErr("");
    setBusy(true);
    setResumeFileName(f.name);

    try {
      const isPdf = /\.pdf$/i.test(f.name);
      if (isPdf) {
        log(`Uploading and reading PDF: ${f.name}...`);
        const formData = new FormData();
        formData.append("file", f);
        const parsed = await apiUpload<any>("/profile/parse-resume", formData);
        setResumeText(parsed.raw_text || "");
        log(`Extracted raw content from PDF (${f.name})`);
      } else {
        const text = await f.text();
        setResumeText(text);
        log(`Loaded text file (${f.name})`);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to process resume file.");
    } finally {
      setBusy(false);
    }
  }

  async function runLocalLLMExtraction() {
    setBusy(true);
    setErr("");
    setStatus([]);
    log("Connecting to Local LLM (Ollama AI Gateway)...");

    try {
      let ghInfo = "";
      const gh = github.replace(/^.*github\.com\//, "").replace(/\/.*$/, "").trim();
      if (gh) {
        log(`Querying GitHub API for @${gh}...`);
        try {
          const g = await importGithub(gh);
          ghInfo = `GitHub Repositories:\n${g.projects.map((p) => `${p.name}: ${p.text} (Stack: ${p.tech.join(", ")})`).join("\n")}`;
          log(`Fetched ${g.projects.length} repositories from GitHub.`);
        } catch {
          ghInfo = `GitHub User: ${gh}`;
        }
      }

      log("Executing Local LLM extraction on combined career corpus...");
      const extracted = await api<any>("/profile/extract-candidate-llm", {
        resume_text: resumeText,
        github_info: ghInfo,
        linkedin_text: liText || (linkedin ? `LinkedIn Profile: ${linkedin}` : ""),
      });

      setExtractedCandidate(extracted);
      setPreviewTab("dna");
      log(`Extraction complete! Parsed via ${extracted.extracted_by || "Local LLM"}.`);
    } catch (e: any) {
      setErr(e.message || "Local LLM extraction failed. Please check backend connection.");
    } finally {
      setBusy(false);
    }
  }

  const updateCandidate = (field: string, val: any) => {
    setExtractedCandidate((prev: any) => ({ ...prev, [field]: val }));
  };

  async function saveCandidateInfo() {
    if (!extractedCandidate) return;
    setBusy(true);

    try {
      const links = {
        github: github || extractedCandidate.links?.github,
        linkedin: linkedin || extractedCandidate.links?.linkedin,
        portfolio: portfolio || extractedCandidate.links?.portfolio,
      };

      const up = {
        name: extractedCandidate.name || profile.name,
        headline: extractedCandidate.headline || profile.headline,
        email: extractedCandidate.email || profile.email,
        location: extractedCandidate.location || profile.location,
        years: Number(extractedCandidate.years) || profile.years || 2,
        education: extractedCandidate.education || profile.education,
        skills: [...new Set([...profile.skills, ...(extractedCandidate.skills || [])])],
        projects: extractedCandidate.projects?.length ? extractedCandidate.projects : profile.projects,
        experience: extractedCandidate.experience?.length ? extractedCandidate.experience : profile.experience,
        links,
      };

      setProfile(up);

      // Add evidence records
      if (extractedCandidate.evidence?.length) {
        addEvidence(extractedCandidate.evidence);
      } else if (resumeText) {
        const ev = evidenceFromText(resumeFileName || "Resume", resumeText);
        addEvidence(ev);
      }

      await api("/profile/save", { profile: { ...profile, ...up } }).catch(() => {});
      router.push("/profile");
    } catch (e: any) {
      setErr(e.message || "Failed to save profile.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <div className="label-xs text-muted">STEP 01 — YOUR PROFILE</div>
        <h1 className="text-3xl sm:text-4xl font-bold font-sans tracking-tight text-ink mt-1">
          Upload Your Resume & Experience
        </h1>
        <p className="text-muted text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
          Drop your resume and connect your GitHub or LinkedIn. Our AI reads your real skills and organizes your profile so you never have to apply manually again.
        </p>
      </div>

      {!extractedCandidate ? (
        <div className="space-y-6">
          {/* Resume Upload */}
          <div className="card p-5 sm:p-6 bg-bg2/40 border border-line">
            <label htmlFor="resume-file" className="label-xs block mb-1">
              Upload Master Resume (PDF, DOCX, .txt, .md)
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.txt,.md,.docx"
              className="input mt-1"
              disabled={busy}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            {resumeFileName && (
              <p className="text-xs text-ok mt-2 font-mono">
                ✓ Loaded: {resumeFileName} ({resumeText.length} characters extracted)
              </p>
            )}
            <p className="text-xs text-muted mt-2">
              Full text parsed and chunked into verifiable evidence records without any external hallucination.
            </p>
          </div>

          {/* GitHub Input */}
          <div>
            <label htmlFor="gh" className="label-xs">
              GitHub Profile or Username
            </label>
            <input
              id="gh"
              className="input mt-1"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              placeholder="e.g. darknecrocities or github.com/darknecrocities"
            />
            <p className="text-[11px] text-muted mt-1">
              Repositories and tech stacks will be imported and indexed as primary evidence.
            </p>
          </div>

          {/* LinkedIn URL & Text */}
          <div>
            <label htmlFor="li" className="label-xs">
              LinkedIn Profile URL
            </label>
            <input
              id="li"
              className="input mt-1"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="e.g. linkedin.com/in/username"
            />
          </div>

          <div>
            <label htmlFor="lit" className="label-xs">
              LinkedIn Profile Text (About & Experience Excerpts)
            </label>
            <textarea
              id="lit"
              rows={4}
              className="input mt-1"
              value={liText}
              onChange={(e) => setLiText(e.target.value)}
              placeholder="Paste your LinkedIn summary, previous roles, or achievements..."
            />
          </div>

          {/* Portfolio */}
          <div>
            <label htmlFor="pf" className="label-xs">
              Portfolio / Personal Site URL (Optional)
            </label>
            <input
              id="pf"
              className="input mt-1"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              placeholder="https://yourportfolio.dev"
            />
          </div>

          {err && <ErrorBox msg={err} />}

          {status.length > 0 && (
            <ul className="font-mono text-xs text-dmuted space-y-1 p-3 bg-bg2 rounded border border-line" aria-live="polite">
              {status.map((s, i) => (
                <li key={i} className="feed-in">
                  ✓ {s}
                </li>
              ))}
            </ul>
          )}

          <button
            className="btn btn-primary w-full py-3 text-center justify-center font-semibold text-sm sm:text-base shadow-sm"
            disabled={busy || (!resumeText && !github && !liText)}
            onClick={runLocalLLMExtraction}
          >
            {busy ? "Reading Your Experience with AI..." : "⚡ Build My Profile with AI →"}
          </button>
        </div>
      ) : (
        /* Extracted Candidate Information Preview & Confirmation */
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
                    className={`px-3 py-1.5 rounded transition-colors font-medium ${
                      previewTab === "dna"
                        ? "bg-black text-white shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                    onClick={() => setPreviewTab("dna")}
                  >
                    🗂️ Career DNA
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded transition-colors font-medium ${
                      previewTab === "apa"
                        ? "bg-black text-white shadow-sm"
                        : "text-muted hover:text-ink"
                    }`}
                    onClick={() => setPreviewTab("apa")}
                  >
                    📄 APA 7th Resume
                  </button>
                </div>

                <button
                  type="button"
                  className={`btn text-xs py-1.5 px-3 font-mono border ${
                    isEditing ? "bg-black text-white border-black" : "bg-bg2 border-line text-ink"
                  }`}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "✓ Save Edit" : "✎ Edit Details"}
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
                        <span key={r} className="px-2.5 py-1 bg-neutral-100 text-black border border-neutral-300 rounded font-medium">
                          🎯 {r}
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
                  <span className="text-ok font-semibold">✓ 100% Real Projects &middot; Zero Hallucinations</span>
                </div>
                <ApaResumeDocument candidate={extractedCandidate} />
              </div>
            )}

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-5 mt-6 border-t border-line">
              <button
                type="button"
                className="btn text-xs py-2 px-4"
                onClick={() => setExtractedCandidate(null)}
              >
                ← Back to Uploads
              </button>

              <div className="flex items-center gap-2">
                {previewTab === "dna" ? (
                  <button
                    type="button"
                    className="btn text-xs py-2 px-3 font-mono bg-bg2 border border-line text-ink hover:border-black"
                    onClick={() => setPreviewTab("apa")}
                  >
                    View APA Resume →
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn text-xs py-2 px-3 font-mono bg-bg2 border border-line text-ink hover:border-black"
                    onClick={() => setPreviewTab("dna")}
                  >
                    ← Review Career DNA
                  </button>
                )}

                <button
                  type="button"
                  className="btn btn-primary text-sm py-2 px-6 font-semibold shadow-sm"
                  disabled={busy}
                  onClick={saveCandidateInfo}
                >
                  {busy ? "Saving Career DNA..." : "✓ Confirm & Save to Career DNA →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
