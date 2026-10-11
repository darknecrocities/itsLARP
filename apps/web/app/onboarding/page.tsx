"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiUpload, api } from "@/lib/api";
import { evidenceFromText, importGithub } from "@/lib/profile";
import { ErrorBox, Badge } from "@/components/ui";

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
      log(`Extraction complete! Parsed via ${extracted.extracted_by || "Local LLM"}.`);
    } catch (e: any) {
      setErr(e.message || "Local LLM extraction failed. Please check backend connection.");
    } finally {
      setBusy(false);
    }
  }

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
        years: extractedCandidate.years || profile.years,
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
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <div className="label-xs text-muted">STEP 01 — CAREER DNA INGESTION</div>
        <h1 className="text-3xl font-bold font-sans tracking-tight text-ink mt-1">
          Upload Your Career & Synthesize Candidate Info
        </h1>
        <p className="text-muted text-sm mt-1">
          Upload your resume, connect GitHub, and provide LinkedIn. The Local LLM extracts and lists down candidate attributes with strict anti-hallucination verification.
        </p>
      </div>

      {!extractedCandidate ? (
        <div className="space-y-6">
          {/* Resume Upload */}
          <div className="card p-5 bg-bg2/40 border border-line">
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
              <p className="text-xs text-ok mt-1 font-mono">
                ✓ Loaded: {resumeFileName} ({resumeText.length} characters extracted)
              </p>
            )}
            <p className="text-xs text-muted mt-1.5">
              Full text parsed and chunked into verifiable evidence records.
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
            className="btn btn-primary w-full py-3 text-center justify-center font-semibold"
            disabled={busy || (!resumeText && !github && !liText)}
            onClick={runLocalLLMExtraction}
          >
            {busy ? "Running Local LLM Extraction..." : "⚡ Synthesize Candidate Info via Local LLM →"}
          </button>
        </div>
      ) : (
        /* Extracted Candidate Information Preview & Confirmation */
        <div className="space-y-6 rise">
          <div className="card p-6 border-2 border-black bg-bg shadow-sm">
            <div className="flex justify-between items-center border-b border-line pb-3 mb-4">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-black text-white rounded">
                  LOCAL LLM EXTRACTION COMPLETE
                </span>
                <h2 className="text-2xl font-bold font-sans mt-1">{extractedCandidate.name || "Candidate Name"}</h2>
                <div className="text-dmuted text-sm font-medium">{extractedCandidate.headline || "Software Engineer"}</div>
              </div>
              <Badge tone="ok">{extractedCandidate.extracted_by || "Local LLM"}</Badge>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono mb-6">
              <div className="p-2 bg-bg2 rounded border border-line">
                <span className="text-muted text-[10px] block">EMAIL</span>
                <strong>{extractedCandidate.email || "Not specified"}</strong>
              </div>
              <div className="p-2 bg-bg2 rounded border border-line">
                <span className="text-muted text-[10px] block">LOCATION</span>
                <strong>{extractedCandidate.location || "Remote"}</strong>
              </div>
              <div className="p-2 bg-bg2 rounded border border-line">
                <span className="text-muted text-[10px] block">EXPERIENCE</span>
                <strong>{extractedCandidate.years || 2} Years</strong>
              </div>
              <div className="p-2 bg-bg2 rounded border border-line">
                <span className="text-muted text-[10px] block">EDUCATION</span>
                <strong className="truncate block">{extractedCandidate.education || "Technical Degree"}</strong>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mb-6">
              <div className="label-xs mb-2">EXTRACTED TECHNICAL SKILLS ({extractedCandidate.skills?.length || 0})</div>
              <div className="flex flex-wrap gap-1.5">
                {extractedCandidate.skills?.map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-bg2 border border-line rounded text-xs font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Target Roles */}
            {extractedCandidate.target_roles && (
              <div className="mb-6">
                <div className="label-xs mb-1.5">SUGGESTED TARGET ROLES</div>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {extractedCandidate.target_roles.map((r: string) => (
                    <span key={r} className="px-2 py-0.5 bg-neutral-100 text-black border border-neutral-300 rounded font-medium">
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
                <div className="grid sm:grid-cols-2 gap-3">
                  {extractedCandidate.projects.map((p: any) => (
                    <div key={p.name} className="p-3 bg-bg2 rounded border border-line text-xs">
                      <strong className="text-sm block">{p.name}</strong>
                      <p className="text-muted mt-1">{p.text}</p>
                      {p.tech && (
                        <div className="text-[10px] font-mono text-dmuted mt-2">
                          Stack: {p.tech.join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-line">
              <button
                className="btn text-xs"
                onClick={() => setExtractedCandidate(null)}
              >
                ← Back to Uploads
              </button>
              <button
                className="btn btn-primary text-sm py-2 px-6 font-semibold"
                disabled={busy}
                onClick={saveCandidateInfo}
              >
                {busy ? "Saving Career DNA..." : "✓ Confirm & Save to Career DNA →"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
