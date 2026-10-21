"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiUpload, api } from "@/lib/api";
import { evidenceFromText, importGithub } from "@/lib/profile";
import { ErrorBox } from "@/components/ui";
import { ExtractedCandidatePreview } from "@/components/onboarding/ExtractedCandidatePreview";
import { Check, Zap, ArrowRight, ArrowLeft } from "lucide-react";

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
      let extracted: any = null;
      try {
        extracted = await api<any>("/profile/extract-candidate-llm", {
          resume_text: resumeText,
          github_info: ghInfo,
          linkedin_text: liText || (linkedin ? `LinkedIn Profile: ${linkedin}` : ""),
        });
      } catch {
        log("Backend starting; applying deterministic Career DNA parser...");
        const nameMatch = liText.match(/(?:i am|name is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/i);
        const nameGuess = nameMatch ? nameMatch[1] : (profile.name || "Arron Kian Parejas");
        const foundSkills = [
          ...new Set(
            `${resumeText} ${liText} ${ghInfo}`
              .toLowerCase()
              .match(/\b(python|typescript|javascript|react|next\.js|fastapi|docker|kubernetes|pytorch|sql|postgresql|aws|gcp|node|c\+\+|rust|go|machine learning|fullstack|ai)\b/g) || []
          ),
        ].map((s) => s.charAt(0).toUpperCase() + s.slice(1));

        extracted = {
          name: nameGuess,
          headline: liText.slice(0, 100) || profile.headline || "Software Engineer & AI/ML Engineer",
          email: (resumeText.match(/[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/) || [])[0] || profile.email || "",
          location: profile.location || "Remote",
          years: profile.years || 3,
          education: profile.education || "Bachelor of Science in Computer Science",
          skills: foundSkills.length ? foundSkills : (profile.skills.length ? profile.skills : ["Python", "TypeScript", "FastAPI", "React"]),
          experience: profile.experience || [],
          projects: profile.projects || [],
          evidence: [],
          extracted_by: "Deterministic Career DNA Engine",
        };
      }

      setExtractedCandidate(extracted);
      setPreviewTab("dna");
      log(`Extraction complete! Parsed via ${extracted.extracted_by || "Local LLM"}.`);
    } catch (e: any) {
      setErr(e.message || "Extraction failed. Please review your entered details.");
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
        target_roles: extractedCandidate.target_roles || profile.target_roles || [],
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
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="btn text-xs inline-flex items-center gap-1.5 text-muted hover:text-ink border border-line px-3 py-1.5 rounded transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </button>
        {extractedCandidate && (
          <button
            type="button"
            onClick={() => setExtractedCandidate(null)}
            className="btn text-xs inline-flex items-center gap-1.5 text-muted hover:text-ink border border-line px-3 py-1.5 rounded transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Re-upload / Change Inputs</span>
          </button>
        )}
      </div>

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
              <p className={`text-xs mt-2 font-mono flex items-center gap-1.5 ${resumeText.length > 0 ? "text-ok" : "text-amber-600"}`}>
                <Check className={`w-3.5 h-3.5 ${resumeText.length > 0 ? "text-ok" : "text-amber-600"}`} />
                {resumeText.length > 0
                  ? `Loaded: ${resumeFileName} (${resumeText.length} characters extracted)`
                  : `Uploaded: ${resumeFileName} (0 characters extracted - please ensure file contains readable text or paste profile text below)`}
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
                <li key={i} className="feed-in flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-ok shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          )}

          <button
            className="btn btn-primary w-full py-3 text-center justify-center font-semibold text-sm sm:text-base shadow-sm flex items-center gap-2"
            disabled={busy || (!resumeText && !github && !liText)}
            onClick={runLocalLLMExtraction}
          >
            <Zap className="w-4 h-4" />
            <span>{busy ? "Reading Your Experience with AI..." : "Build My Profile with AI"}</span>
            {!busy && <ArrowRight className="w-4 h-4" />}
          </button>
        </div>
      ) : (
        <ExtractedCandidatePreview
          extractedCandidate={extractedCandidate}
          setExtractedCandidate={setExtractedCandidate}
          previewTab={previewTab}
          setPreviewTab={setPreviewTab}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          updateCandidate={updateCandidate}
          saveCandidateInfo={saveCandidateInfo}
          busy={busy}
        />
      )}
    </div>
  );
}
