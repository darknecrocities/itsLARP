"use client";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, apiGet } from "@/lib/api";
import { FIELDS, type Job } from "@/lib/data";
import { type Change } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Badge, Empty, ErrorBox, PageHeader } from "@/components/ui";
import { Check, X, ExternalLink } from "lucide-react";

type VerificationResult = {
  passed: boolean;
  blocked: number;
  claims: {
    claim: string;
    source: string | null;
    confidence: number;
    status: string;
  }[];
};

type PrepareResponse = {
  job_id: string;
  match: {
    score: number;
    label: string;
    breakdown: Record<string, number>;
    strong: string[];
    missing: string[];
  };
  changes: Change[];
  cover: string;
  answers: Record<string, string>;
  verification: VerificationResult;
};

type Phase = "idle" | "running" | "verifying" | "done" | "failed";

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, upsertApp, notion } = useStore();

  // Dynamically fetch the real job from backend API
  const {
    data: job,
    isLoading: jobLoading,
    error: jobError,
  } = useQuery({
    queryKey: ["job", id],
    queryFn: () => apiGet<Job>(`/jobs/${id}`),
    retry: 1,
  });

  const [changes, setChanges] = useState<Change[]>([]);
  const [cover, setCover] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ver, setVer] = useState<VerificationResult | null>(null);
  const [matchData, setMatchData] = useState<PrepareResponse["match"] | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState("");
  const [approved, setApproved] = useState(false);

  // Initialize match if already present on job
  useEffect(() => {
    if (job?.match) {
      setMatchData(job.match);
    }
  }, [job]);

  const accepted = useMemo(() => changes.filter((c) => c.status === "accepted"), [changes]);

  async function prepare() {
    if (!job) return;
    setErr("");
    setPhase("running");
    setApproved(false);
    try {
      setPhase("verifying");
      const res = await api<PrepareResponse>("/applications/prepare", {
        profile,
        job_id: job.id,
      });

      setChanges(res.changes);
      setCover(res.cover);
      setAnswers(res.answers);
      setVer(res.verification);
      setMatchData(res.match);
      setPhase("done");
    } catch (e: any) {
      setErr(e.message || "Failed to prepare application");
      setPhase("failed");
    }
  }

  const setStatus = (i: number, status: Change["status"]) =>
    setChanges((cs) => cs.map((c, k) => (k === i ? { ...c, status } : c)));

  const acceptAll = () => {
    setChanges((cs) => cs.map((c) => ({ ...c, status: "accepted" })));
  };

  const ready = phase === "done" && ver?.passed && changes.some((c) => c.status === "accepted");

  async function approve() {
    if (!job) return;
    setApproved(true);
    const tailoredResume = accepted.map((c) => `${c.section}:\n${c.proposed}`).join("\n\n");

    try {
      await api("/applications/approve", {
        job_id: job.id,
        company: job.company,
        role: job.title,
        match: matchData?.score ?? 0,
        resume: tailoredResume,
        cover,
        answers,
        verified: ver?.passed ?? true,
      });
    } catch (e) {
      console.warn("Approve API notice:", e);
    }

    upsertApp({
      id: `a-${job.id}`,
      jobId: job.id,
      company: job.company,
      role: job.title,
      match: matchData?.score ?? 0,
      status: "APPLIED",
      verified: true,
      resume: tailoredResume,
      cover,
      answers,
      events: [{ at: new Date().toISOString(), text: "Approved by candidate and recorded in tracker" }],
    });

    if (notion.connected && notion.databaseId && notion.token) {
      try {
        await api("/integrations/notion/sync", {
          token: notion.token,
          database_id: notion.databaseId,
          application: {
            company: job.company,
            role: job.title,
            match: matchData?.score,
            status: "APPLIED",
            location: job.location,
            salary: job.salary,
            url: job.url,
          },
        });
      } catch {
        /* Notion mirror is optional */
      }
    }
  }

  if (jobLoading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-muted">
        Loading job intelligence...
      </div>
    );
  }

  if (jobError || !job) {
    return (
      <Empty title="Job not found" hint="This job listing may have been moved or updated.">
        <Link href="/jobs" className="btn">
          Back to jobs
        </Link>
      </Empty>
    );
  }

  if (!profile.skills.length) {
    return (
      <Empty title="Career DNA required" hint="Upload your resume or connect GitHub first to unlock tailoring.">
        <Link href="/onboarding" className="btn btn-primary">
          Build Career DNA
        </Link>
      </Empty>
    );
  }

  return (
    <>
      <PageHeader
        title={`${job.title} — ${job.company}`}
        sub={`${job.location} · ${job.salary || "Salary not listed"} · Source: ${job.source}`}
        action={
          <div className="flex gap-2">
            {job.url && (
              <a
                href={job.url}
                target="_blank"
                rel="noreferrer"
                className="btn text-xs inline-flex items-center gap-1.5"
              >
                <span>View Employer Post</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              className="btn btn-primary"
              disabled={phase === "running" || phase === "verifying"}
              onClick={prepare}
            >
              {phase === "idle" ? "Tailor Resume & Prepare Application" : "Regenerate Application"}
            </button>
          </div>
        }
      />

      {/* Match breakdown metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="card p-4">
          <div className="label-xs">Compatibility Score</div>
          <div className="font-display text-2xl mt-1">
            {matchData ? (
              <Badge tone={matchData.score >= 80 ? "ok" : matchData.score >= 60 ? "n" : "warn"}>
                {matchData.score}% · {matchData.label}
              </Badge>
            ) : (
              "—"
            )}
          </div>
        </div>

        <div className="card p-4">
          <div className="label-xs">Matching Skills</div>
          <p className="mt-1 text-sm font-medium text-ok truncate">
            {matchData?.strong?.length ? matchData.strong.join(", ") : "Analyzing..."}
          </p>
        </div>

        <div className="card p-4">
          <div className="label-xs">Missing Skills</div>
          <p className="mt-1 text-sm font-medium text-warn truncate">
            {matchData?.missing?.length ? matchData.missing.join(", ") : "None detected"}
          </p>
        </div>

        <div className="card p-4">
          <div className="label-xs">Candidate Evidence</div>
          <p className="mt-1 text-sm font-medium text-dmuted">
            {profile.evidence.length} verified records
          </p>
        </div>
      </section>

      {/* Match Breakdown weights */}
      {matchData?.breakdown && (
        <div className="card p-4 mb-6 bg-bg2/40">
          <div className="label-xs mb-2">Deterministic Scoring Formula</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
            <div>Technical Skills (35%): <span className="font-mono font-medium">{matchData.breakdown.skills}%</span></div>
            <div>Experience (25%): <span className="font-mono font-medium">{matchData.breakdown.experience}%</span></div>
            <div>Projects (15%): <span className="font-mono font-medium">{matchData.breakdown.projects}%</span></div>
            <div>Education (10%): <span className="font-mono font-medium">{matchData.breakdown.education}%</span></div>
            <div>Domain (10%): <span className="font-mono font-medium">{matchData.breakdown.domain}%</span></div>
            <div>Location (5%): <span className="font-mono font-medium">{matchData.breakdown.location}%</span></div>
          </div>
        </div>
      )}

      {/* Job Description */}
      <div className="card p-4 mb-8">
        <h3 className="label-xs mb-2">Job Description</h3>
        <p className="text-dmuted text-sm whitespace-pre-line max-h-60 overflow-y-auto font-sans leading-relaxed">
          {job.description}
        </p>
      </div>

      {phase !== "idle" && (
        <div role="status" className="font-mono text-xs mb-6 p-2 bg-bg2 border border-line rounded">
          {
            {
              running: "RUNNING · Extracting requirements & tailoring from Career DNA evidence",
              verifying: "VERIFYING · Running claim verification across candidate evidence corpus",
              done: "APPLICATION READY FOR HUMAN REVIEW",
              failed: "FAILED · Could not complete preparation",
              idle: "",
            }[phase]
          }
        </div>
      )}

      {err && <ErrorBox msg={err} retry={prepare} />}

      {/* Tailored Resume Changes */}
      {changes.length > 0 && (
        <>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Tailored Resume Changes</h2>
            <button className="btn text-xs py-1" onClick={acceptAll}>
              Accept All Changes
            </button>
          </div>

          <div className="space-y-3 mb-10">
            {changes.map((c, i) => (
              <div key={i} className="card p-4">
                <div className="flex justify-between items-center">
                  <span className="label-xs">{c.section}</span>
                  <Badge tone={c.status === "accepted" ? "ok" : c.status === "rejected" ? "err" : "warn"}>
                    {c.status}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <div className="label-xs text-muted">Original</div>
                    <p className="text-dmuted text-sm">{c.original || "—"}</p>
                  </div>
                  <div>
                    <div className="label-xs text-ok">Proposed (Tailored)</div>
                    <p className="text-sm font-medium">{c.proposed}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted mt-3 pt-2 border-t border-line">
                  <span>Rationale: {c.why} · <strong className="text-fg">Evidence:</strong> {c.evidence}</span>
                  <div className="flex gap-2">
                    <button
                      className={`btn text-xs py-0.5 px-2 ${c.status === "accepted" ? "bg-black text-white" : ""}`}
                      onClick={() => setStatus(i, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className={`btn text-xs py-0.5 px-2 ${c.status === "rejected" ? "bg-line" : ""}`}
                      onClick={() => setStatus(i, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cover Letter */}
          <h2 className="text-xl font-semibold mb-3">Tailored Cover Letter</h2>
          <label htmlFor="cl" className="sr-only">
            Cover letter
          </label>
          <textarea
            id="cl"
            rows={8}
            className="input mb-10 font-sans text-sm leading-relaxed"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
          />

          {/* Auto-filled Application Questions */}
          <h2 className="text-xl font-semibold mb-3">Application Questions (Auto-filled)</h2>
          <div className="grid md:grid-cols-2 gap-4 mb-10">
            {FIELDS.map((f) => (
              <div key={f}>
                <label htmlFor={f} className="label-xs block mb-1">
                  {f}
                </label>
                {f.startsWith("Why") ? (
                  <textarea
                    id={f}
                    rows={3}
                    className="input"
                    value={answers[f] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f]: e.target.value })}
                  />
                ) : (
                  <input
                    id={f}
                    className="input"
                    value={answers[f] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f]: e.target.value })}
                  />
                )}
                {!answers[f] && <span className="text-xs text-warn">Missing in Career DNA</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Claim Verification Gate */}
      {ver && (
        <section aria-label="Verification" className="mb-10 card p-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold">Evidence Claim Verification</h2>
            {ver.passed ? (
              <Badge tone="ok">PASS · No Hallucinated Claims</Badge>
            ) : (
              <Badge tone="err">{ver.blocked} CLAIMS BLOCKED</Badge>
            )}
          </div>
          <p className="text-xs text-muted mb-4">
            Principle 03: Evidence before generation. Every statement in the generated application must map back to candidate evidence or be blocked.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="label-xs border-b border-line">
                <tr>
                  <th scope="col" className="py-2">Claim in Application</th>
                  <th scope="col">Evidence Source</th>
                  <th scope="col">Match Conf.</th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {ver.claims.slice(0, 10).map((c, i) => (
                  <tr key={i} className="border-b border-line text-xs">
                    <td className="py-2.5 pr-3 font-mono">{c.claim}</td>
                    <td className="text-muted">{c.source ?? "No evidence found"}</td>
                    <td>{Math.round(c.confidence * 100)}%</td>
                    <td>
                      <Badge tone={c.status === "VERIFIED" ? "ok" : "err"}>
                        {c.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!ver.passed && (
            <p className="text-xs text-warn mt-3">
              Blocked claims have insufficient supporting evidence. Please add evidence to your Career DNA or edit the proposal.
            </p>
          )}
        </section>
      )}

      {/* Human Approval Gate */}
      {phase === "done" && (
        <section className="card p-6 border-2 border-black/80">
          <div className="flex justify-between items-center">
            <div>
              <div className="label-xs">SAFETY BOUNDARY · HUMAN APPROVAL</div>
              <div className="font-display text-2xl mt-1">
                {job.title} at {job.company}
              </div>
            </div>
            {approved ? (
              <Badge tone="ok">APPROVED & TRACKED</Badge>
            ) : (
              <Badge tone={ready ? "ok" : "warn"}>
                {ready ? "Ready for Submission Approval" : "Review Required"}
              </Badge>
            )}
          </div>

          <div className="grid sm:grid-cols-4 gap-3 my-4 py-3 border-y border-line text-xs">
            <div className="flex items-center gap-1.5">
              <span>Resume:</span>
              {accepted.length ? (
                <span className="text-ok font-medium inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-ok" />
                  {accepted.length} accepted
                </span>
              ) : (
                <span className="text-muted">— accept at least 1 change</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span>Cover letter:</span>
              {cover ? (
                <span className="text-ok font-medium inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-ok" />
                  Completed
                </span>
              ) : (
                <span className="text-muted">— Missing</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span>Form answers:</span>
              {FIELDS.every((f) => answers[f]) ? (
                <span className="text-ok font-medium inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-ok" />
                  Completed
                </span>
              ) : (
                <span className="text-muted">— Incomplete</span>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span>Verification:</span>
              {ver?.passed ? (
                <span className="text-ok font-medium inline-flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 text-ok" />
                  All claims verified
                </span>
              ) : (
                <span className="text-critical font-medium inline-flex items-center gap-1">
                  <X className="w-3.5 h-3.5 text-critical" />
                  Blocked claims
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            {approved ? (
              <div className="flex items-center gap-3">
                <span className="text-ok text-sm font-medium inline-flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-ok" />
                  Application recorded and tracked.
                </span>
                <Link href="/applications" className="btn btn-primary">
                  View Tracker
                </Link>
              </div>
            ) : (
              <button
                className="btn btn-primary text-base py-2 px-6"
                disabled={!ready}
                onClick={approve}
              >
                [ APPROVE & SUBMIT APPLICATION ]
              </button>
            )}
          </div>

          <p className="text-xs text-muted mt-3">
            In compliance with Principle 05: The AI workforce prepares the application, but you remain the human decision maker.
          </p>
        </section>
      )}
    </>
  );
}
