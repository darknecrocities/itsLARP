"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { apiUpload, api } from "@/lib/api";
import { evidenceFromText, importGithub, parseResume } from "@/lib/profile";
import { ErrorBox } from "@/components/ui";

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, setProfile, addEvidence } = useStore();

  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [liText, setLiText] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const log = (m: string) => setStatus((s) => [...s, m]);

  async function onFile(f?: File) {
    if (!f) return;
    setErr("");
    setBusy(true);

    try {
      const isPdf = /\.pdf$/i.test(f.name);
      if (isPdf) {
        log(`Uploading and extracting text from PDF: ${f.name}...`);
        const formData = new FormData();
        formData.append("file", f);
        const parsed = await apiUpload<any>("/profile/parse-resume", formData);

        setProfile({
          name: parsed.name || profile.name,
          headline: parsed.headline || profile.headline,
          email: parsed.email || profile.email,
          location: parsed.location || profile.location,
          years: parsed.years || profile.years,
          education: parsed.education || profile.education,
          skills: [...new Set([...profile.skills, ...(parsed.skills ?? [])])],
          projects: parsed.projects?.length ? parsed.projects : profile.projects,
          links: { ...profile.links, ...(parsed.links ?? {}) },
        });

        if (parsed.evidence?.length) {
          addEvidence(parsed.evidence);
        }

        log(`PDF processed: ${parsed.skills?.length ?? 0} skills, ${parsed.evidence?.length ?? 0} evidence records indexed`);
      } else {
        const text = await f.text();
        const p = parseResume(text);
        setProfile({
          ...p,
          skills: [...new Set([...profile.skills, ...(p.skills ?? [])])],
          links: { ...profile.links, ...p.links },
        });
        const ev = evidenceFromText("Resume", text);
        addEvidence(ev);
        log(`Resume parsed: ${p.skills?.length ?? 0} skills, ${ev.length} evidence records indexed`);
      }
    } catch (e: any) {
      setErr(e.message || "Failed to process resume file.");
    } finally {
      setBusy(false);
    }
  }

  async function build() {
    setBusy(true);
    setErr("");
    try {
      const links = {
        ...profile.links,
        linkedin: linkedin || profile.links.linkedin,
        portfolio: portfolio || profile.links.portfolio,
      };
      let up: Partial<typeof profile> = { links };

      const gh = github.replace(/^.*github\.com\//, "").replace(/\/.*$/, "").trim();
      if (gh) {
        log(`Importing GitHub profile and repositories for @${gh}...`);
        const g = await importGithub(gh);
        up = {
          ...up,
          skills: [...new Set([...profile.skills, ...g.skills])],
          projects: g.projects,
          links: { ...links, github: `github.com/${gh}` },
        };
        addEvidence(g.evidence);
        log(`GitHub imported: ${g.projects.length} repositories indexed as evidence`);
      }

      if (liText.trim()) {
        const p = parseResume(liText);
        up = {
          ...up,
          skills: [...new Set([...(up.skills ?? profile.skills), ...(p.skills ?? [])])],
        };
        const ev = evidenceFromText("LinkedIn Experience", liText);
        addEvidence(ev);
        log(`LinkedIn text: ${ev.length} evidence records indexed`);
      }

      setProfile(up);

      // Persist to backend database
      await api("/profile/save", { profile: { ...profile, ...up } }).catch(() => {});

      router.push("/profile");
    } catch (e: any) {
      setErr(e.message || "Could not complete onboarding.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-semibold rise">Build your Career DNA</h1>
      <p className="text-muted mt-1 mb-8 rise">
        Upload your career once. Everything you add becomes traceable evidence. AI cannot randomly invent experience.
      </p>

      <div className="space-y-6 rise">
        <div className="card p-5 bg-bg2/40">
          <label htmlFor="resume" className="label-xs block mb-1">
            Upload Master Resume (PDF, .txt, .md)
          </label>
          <input
            id="resume"
            type="file"
            accept=".pdf,.txt,.md"
            className="input mt-1"
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <p className="text-xs text-muted mt-1.5">
            Full PDF extraction runs via backend parser. Skills, projects, and factual claims are extracted and indexed into evidence.
          </p>
        </div>

        <div>
          <label htmlFor="gh" className="label-xs">
            GitHub Username or URL
          </label>
          <input
            id="gh"
            className="input mt-1"
            value={github}
            onChange={(e) => setGithub(e.target.value)}
            placeholder="octocat or github.com/octocat"
          />
        </div>

        <div>
          <label htmlFor="li" className="label-xs">
            LinkedIn Profile URL
          </label>
          <input
            id="li"
            className="input mt-1"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="linkedin.com/in/username"
          />
        </div>

        <div>
          <label htmlFor="lit" className="label-xs">
            LinkedIn Profile Text (About & Experience)
          </label>
          <textarea
            id="lit"
            rows={4}
            className="input mt-1"
            value={liText}
            onChange={(e) => setLiText(e.target.value)}
            placeholder="Paste your LinkedIn About section and job roles here..."
          />
          <p className="text-muted text-xs mt-1">
            Stored as verifiable evidence records to back up claims during resume tailoring.
          </p>
        </div>

        <div>
          <label htmlFor="pf" className="label-xs">
            Portfolio / Personal Website URL
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
          className="btn btn-primary w-full py-2.5 text-center justify-center font-semibold"
          disabled={busy}
          onClick={build}
        >
          {busy ? "Processing & Indexing Evidence..." : "Create Career DNA Profile →"}
        </button>
      </div>
    </div>
  );
}
