"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { importGithub } from "@/lib/profile";

export default function LoginPage() {
  const router = useRouter();
  const { setProfile, addEvidence } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [githubUser, setGithubUser] = useState("");
  const [showGithub, setShowGithub] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({ email });
    router.push("/onboarding");
  };

  const handleGithubConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUser.trim()) return;
    setLoading(true);
    setError("");
    try {
      const g = await importGithub(githubUser.trim());
      setProfile({
        name: githubUser.trim(),
        skills: g.skills,
        projects: g.projects,
        links: { github: `github.com/${githubUser.trim()}` },
      });
      addEvidence(g.evidence);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to import GitHub data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card p-8 w-full max-w-md rise shadow-xl border border-line">
        <h1 className="text-2xl font-semibold">Sign in to HowToLarped</h1>
        <p className="text-muted text-sm mt-1 mb-6">
          Your AI Job-Hunting Workforce & Career Operating System.
        </p>

        {/* Quick OAuth / GitHub option */}
        <div className="space-y-3 mb-6">
          <button
            type="button"
            className="btn w-full justify-center flex items-center gap-2 py-2.5 font-medium"
            onClick={() => setShowGithub(!showGithub)}
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub (Auto-import Repos)
          </button>

          <button
            type="button"
            className="btn w-full justify-center flex items-center gap-2 py-2.5 font-medium"
            onClick={() => {
              setProfile({ email: "demo@google.com", name: "Candidate" });
              router.push("/dashboard");
            }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        {showGithub && (
          <form onSubmit={handleGithubConnect} className="p-4 bg-bg2 rounded border border-line mb-6 space-y-3">
            <label className="label-xs" htmlFor="ghu">Enter GitHub Username</label>
            <input
              id="ghu"
              className="input text-xs"
              placeholder="e.g. torvalds or your-handle"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
            />
            {error && <p className="text-xs text-err">{error}</p>}
            <button type="submit" className="btn btn-primary text-xs w-full" disabled={loading}>
              {loading ? "Importing Repositories..." : "Import Repos & Go to Dashboard"}
            </button>
          </form>
        )}

        <div className="flex items-center gap-3 my-6 text-muted text-xs">
          <div className="flex-1 h-px bg-line" />
          <span>or sign in with email</span>
          <div className="flex-1 h-px bg-line" />
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label htmlFor="email" className="label-xs">Email</label>
            <input
              id="email"
              type="email"
              required
              className="input mt-1"
              placeholder="arron@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pass" className="label-xs">Password</label>
            <input
              id="pass"
              type="password"
              className="input mt-1"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full justify-center py-2.5 font-medium mt-2">
            Continue →
          </button>
        </form>
      </div>
    </div>
  );
}
