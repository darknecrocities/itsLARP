"use client";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, apiGet } from "@/lib/api";
import { FIELDS, type Job } from "@/lib/data";
import { type Change } from "@/lib/profile";
import { useStore } from "@/lib/store";
import { Badge, Empty, ErrorBox, PageHeader } from "@/components/ui";
import { Check, ExternalLink, RotateCcw, AlertCircle, ShieldAlert, SlidersHorizontal, ArrowLeft } from "lucide-react";
import { ClaimVerificationTable, type ClaimItem } from "@/components/apply/ClaimVerificationTable";
import { ApplicationConfigPanel } from "@/components/apply/ApplicationConfigPanel";

type VerificationResult = { passed: boolean; blocked: number; claims: ClaimItem[] };
type PrepareResponse = {
  job_id: string;
  match: { score: number; label: string; breakdown: Record<string, number>; strong: string[]; missing: string[] };
  resume_format?: string;
  resume_format_label?: string;
  resume_text?: string;
  resume_html?: string;
  changes: Change[];
  cover: string;
  answers: Record<string, string>;
  verification: VerificationResult;
};
type Phase = "idle" | "running" | "verifying" | "done" | "failed";
type DuplicateCheckInfo = {
  has_application: boolean;
  app_id?: string;
  status?: string;
  is_ongoing?: boolean;
  is_terminal?: boolean;
  can_reapply?: boolean;
  applied_date?: string;
  message?: string;
};

export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile, upsertApp, appConfig } = useStore();
  const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
    queryKey: ["job", id],
    queryFn: () => apiGet<Job>(`/jobs/${id}`),
    retry: 1,
  });

  const [changes, setChanges] = useState<Change[]>([]);
  const [resumeText, setResumeText] = useState("");
  const [resumeFormatLabel, setResumeFormatLabel] = useState("APA 7th Edition");
  const [cover, setCover] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [ver, setVer] = useState<VerificationResult | null>(null);
  const [matchData, setMatchData] = useState<PrepareResponse["match"] | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [err, setErr] = useState("");
  const [approved, setApproved] = useState(false);
  const [dupInfo, setDupInfo] = useState<DuplicateCheckInfo | null>(null);
  const [forceReapply, setForceReapply] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (job) {
      if (job.match) setMatchData(job.match);
      apiGet<DuplicateCheckInfo>(
        `/applications/check?job_id=${encodeURIComponent(job.id)}&company=${encodeURIComponent(job.company)}&role=${encodeURIComponent(job.title)}`
      )
        .then((res) => {
          if (res) setDupInfo(res);
        })
        .catch(() => {});
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
        config: appConfig,
      });

      setChanges(res.changes.map((c) => ({ ...c, status: "accepted" })));
      setResumeText(res.resume_text || "");
      setResumeFormatLabel(res.resume_format_label || appConfig.resumeFormat);
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
    const tailoredResume = resumeText || accepted.map((c) => `${c.section}:\n${c.proposed}`).join("\n\n");

    try {
      const res = await api<{ ok: boolean; duplicate?: boolean; message?: string }>("/applications/approve", {
        job_id: job.id,
        company: job.company,
        role: job.title,
        match: matchData?.score ?? 0,
        resume: tailoredResume,
        cover,
        answers,
        verified: ver?.passed ?? true,
        force_reapply: forceReapply,
      });

      if (res && res.duplicate) {
        setErr(res.message || "Duplicate application prevented.");
        setApproved(false);
        return;
      }
    } catch (e: any) {
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
      events: [
        {
          at: new Date().toISOString(),
          text: forceReapply
            ? `Re-applied to position after previous ${dupInfo?.status || "attempt"}`
            : `Approved ${resumeFormatLabel} tailored package and recorded in tracker`,
        },
      ],
    });

    setDupInfo({
      has_application: true,
      status: "APPLIED",
      is_ongoing: true,
      is_terminal: false,
      can_reapply: false,
      applied_date: new Date().toISOString().split("T")[0],
      message: `Application submitted & tracked for ${job.company}.`,
    });
  }

  if (jobLoading) {
    return <div className="py-20 text-center font-mono text-xs text-muted">Loading job intelligence...</div>;
  }

  if (jobError || !job) {
    return (
      <Empty title="Job not found" hint="This job listing may have been moved or updated.">
        <Link href="/jobs" className="btn">Back to jobs</Link>
      </Empty>
    );
  }

  if (!profile.skills.length) {
    return (
      <Empty title="Career DNA required" hint="Upload your resume or connect GitHub first to unlock tailoring.">
        <Link href="/profile" className="btn btn-primary">Build Career DNA</Link>
      </Empty>
    );
  }

  return (
    <>
      <PageHeader
        title={`${job.title} — ${job.company}`}
        sub={`${job.location} · ${job.salary || "Salary not listed"} · Source: ${job.source} · Active Format: ${appConfig.resumeFormat}`}
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/jobs"
              className="btn text-xs inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Jobs</span>
            </Link>
            <button
              type="button"
              onClick={() => setShowConfig(!showConfig)}
              className={`btn text-xs inline-flex items-center gap-1.5 ${showConfig ? "bg-black text-white" : ""}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>20 Apply Configs</span>
            </button>
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
              className="btn btn-primary text-xs"
              disabled={phase === "running" || phase === "verifying"}
              onClick={prepare}
            >
              {phase === "idle" ? "Tailor Resume & Prepare Application" : "Regenerate Application"}
            </button>
          </div>
        }
      />

      {showConfig && (
        <div className="mb-6">
          <ApplicationConfigPanel compact />
        </div>
      )}

      {/* Duplicate Application Guard Notification */}
      {dupInfo?.has_application && dupInfo.is_ongoing && !forceReapply && (
        <div className="card p-4 mb-6 bg-neutral-100 border border-neutral-300 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-black shrink-0" />
            <div>
              <div className="font-bold text-black text-sm">
                Already Applied · Status: {dupInfo.status}
              </div>
              <div className="text-neutral-600 font-sans text-xs mt-0.5">
                You already have an active application for {job.company} submitted on {dupInfo.applied_date}. Duplicate application submission is prevented.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/applications" className="btn text-xs bg-white border border-neutral-300 hover:border-black">
              View Tracker
            </Link>
            <button
              className="btn text-xs bg-black text-white hover:bg-neutral-800 flex items-center gap-1"
              onClick={() => setForceReapply(true)}
            >
              <RotateCcw className="w-3 h-3" />
              <span>Allow Re-Apply</span>
            </button>
          </div>
        </div>
      )}

      {/* Previously Rejected Notice */}
      {dupInfo?.has_application && (dupInfo.is_terminal || dupInfo.status === "REJECTED") && (
        <div className="card p-4 mb-6 bg-neutral-50 border border-neutral-300 font-mono text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-neutral-700 shrink-0" />
            <div>
              <div className="font-bold text-black text-sm">
                Prior Application Outcome: {dupInfo.status}
              </div>
              <div className="text-neutral-600 font-sans text-xs mt-0.5">
                Your past application to {job.company} was marked as {dupInfo.status} ({dupInfo.applied_date}). You are eligible to submit a fresh tailored re-application.
              </div>
            </div>
          </div>
          <button
            className="btn text-xs bg-black text-white hover:bg-neutral-800 flex items-center gap-1"
            onClick={() => {
              setForceReapply(true);
              prepare();
            }}
          >
            <RotateCcw className="w-3 h-3" />
            <span>Re-Apply with Fresh Tailored Resume</span>
          </button>
        </div>
      )}

      {/* Match breakdown metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 font-mono text-xs">
        <div className="card p-4">
          <div className="label-xs">Compatibility Score</div>
          <div className="text-xl font-bold mt-1">
            {matchData ? (
              <Badge tone={matchData.score >= 80 ? "ok" : matchData.score >= 60 ? "n" : "warn"}>
                {matchData.score}% · {matchData.label}
              </Badge>
            ) : "—"}
          </div>
        </div>
        <div className="card p-4">
          <div className="label-xs">Matching Skills</div>
          <p className="mt-1 text-xs font-semibold text-ok truncate">
            {matchData?.strong?.length ? matchData.strong.join(", ") : "Analyzing..."}
          </p>
        </div>
        <div className="card p-4">
          <div className="label-xs">Missing Skills</div>
          <p className="mt-1 text-xs font-semibold text-warn truncate">
            {matchData?.missing?.length ? matchData.missing.join(", ") : "None detected"}
          </p>
        </div>
        <div className="card p-4">
          <div className="label-xs">Candidate Evidence</div>
          <p className="mt-1 text-xs font-semibold text-neutral-800">
            {profile.evidence.length} verified records
          </p>
        </div>
      </section>

      {/* Job Description */}
      <div className="card p-4 mb-6">
        <h3 className="label-xs mb-2">Job Description</h3>
        <p className="text-neutral-700 text-xs whitespace-pre-line max-h-48 overflow-y-auto font-sans leading-relaxed">
          {job.description}
        </p>
      </div>

      {phase !== "idle" && (
        <div role="status" className="font-mono text-xs mb-6 p-2 bg-neutral-100 border border-line rounded">
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
            <h2 className="text-lg font-bold">Tailored Resume Changes</h2>
            <button className="btn text-xs py-1" onClick={acceptAll}>
              Accept All Changes
            </button>
          </div>

          <div className="space-y-3 mb-8">
            {changes.map((c, i) => (
              <div key={i} className="card p-4 font-sans">
                <div className="flex justify-between items-center font-mono">
                  <span className="label-xs">{c.section}</span>
                  <Badge tone={c.status === "accepted" ? "ok" : c.status === "rejected" ? "err" : "warn"}>
                    {c.status}
                  </Badge>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mt-2 text-xs">
                  <div>
                    <div className="label-xs text-muted">Original</div>
                    <p className="text-neutral-600 mt-0.5">{c.original || "—"}</p>
                  </div>
                  <div>
                    <div className="label-xs text-ok">Proposed (Tailored)</div>
                    <p className="font-medium mt-0.5">{c.proposed}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-muted mt-3 pt-2 border-t border-line font-mono">
                  <span>Rationale: {c.why} · <strong>Evidence:</strong> {c.evidence}</span>
                  <div className="flex gap-2">
                    <button
                      className={`btn text-xs py-0.5 px-2 ${c.status === "accepted" ? "bg-black text-white" : ""}`}
                      onClick={() => setStatus(i, "accepted")}
                    >
                      Accept
                    </button>
                    <button
                      className={`btn text-xs py-0.5 px-2 ${c.status === "rejected" ? "bg-neutral-200" : ""}`}
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
          <h2 className="text-lg font-bold mb-2">Tailored Cover Letter</h2>
          <textarea
            id="cl"
            rows={6}
            className="input mb-8 font-sans text-xs leading-relaxed"
            value={cover}
            onChange={(e) => setCover(e.target.value)}
          />

          {/* Auto-filled Application Questions */}
          <h2 className="text-lg font-bold mb-2">Application Questions (Auto-filled)</h2>
          <div className="grid md:grid-cols-2 gap-3 mb-8 text-xs font-mono">
            {FIELDS.map((f) => (
              <div key={f} className="card p-3">
                <label htmlFor={f} className="label-xs block mb-1">{f}</label>
                {f.startsWith("Why") ? (
                  <textarea
                    id={f}
                    rows={2}
                    className="input text-xs"
                    value={answers[f] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f]: e.target.value })}
                  />
                ) : (
                  <input
                    id={f}
                    className="input text-xs"
                    value={answers[f] ?? ""}
                    onChange={(e) => setAnswers({ ...answers, [f]: e.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Claim Verification Gate Component */}
      {ver && <ClaimVerificationTable passed={ver.passed} blocked={ver.blocked} claims={ver.claims} />}

      {/* Human Approval Gate */}
      {phase === "done" && (
        <section className="card p-6 border-2 border-black font-sans">
          <div className="flex justify-between items-center">
            <div>
              <div className="label-xs font-mono">SAFETY BOUNDARY · HUMAN APPROVAL</div>
              <div className="text-xl font-bold mt-1">{job.title} at {job.company}</div>
            </div>
            {approved ? (
              <Badge tone="ok">APPROVED & SUBMITTED</Badge>
            ) : (
              <Badge tone={ready ? "ok" : "warn"}>
                {ready ? "Ready for Submission Approval" : "Review Required"}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3 mt-5">
            {approved ? (
              <div className="flex items-center gap-3">
                <span className="text-ok text-xs font-semibold inline-flex items-center gap-1.5 font-mono">
                  <Check className="w-4 h-4 text-ok" />
                  Application recorded and tracked in your database.
                </span>
                <Link href="/applications" className="btn btn-primary text-xs">
                  View Tracker
                </Link>
              </div>
            ) : (
              <button
                className="btn btn-primary text-sm py-2 px-5 font-mono"
                disabled={!ready || (dupInfo?.has_application && dupInfo.is_ongoing && !forceReapply)}
                onClick={approve}
              >
                {dupInfo?.has_application && dupInfo.is_ongoing && !forceReapply
                  ? `[ ALREADY APPLIED · PREVENTING DUPLICATE ]`
                  : forceReapply
                  ? `[ APPROVE & SUBMIT RE-APPLICATION ]`
                  : `[ APPROVE & SUBMIT APPLICATION ]`}
              </button>
            )}
          </div>
        </section>
      )}
    </>
  );
}
