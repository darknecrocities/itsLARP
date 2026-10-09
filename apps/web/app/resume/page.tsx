"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Badge, Empty, PageHeader, Reveal } from "@/components/ui";

export default function ResumeStudio() {
  const { profile: p, apps } = useStore();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <PageHeader
        title="Resume Studio"
        sub="One Master Resume as the source of truth, yielding immutable, evidence-backed job-specific tailored versions."
        action={
          <div className="flex gap-2">
            <Link href="/profile" className="btn text-xs">
              Edit Career DNA
            </Link>
            <Link href="/jobs" className="btn btn-primary text-xs">
              Tailor for a Job
            </Link>
          </div>
        }
      />

      {!p.skills.length ? (
        <Empty title="No Master Resume" hint="Create your Career DNA first.">
          <Link href="/onboarding" className="btn btn-primary">
            Onboarding
          </Link>
        </Empty>
      ) : (
        <>
          <Reveal>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Master Resume (Source of Truth)</h2>
              <span className="text-xs font-mono text-muted">
                {p.evidence.length} Evidence Records Indexed
              </span>
            </div>

            <div className="card p-6 mb-10 bg-bg2/30">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-display text-2xl font-bold">{p.name || "Candidate Name"}</h3>
                  <div className="text-dmuted font-medium">{p.headline || "Software / AI Engineer"}</div>
                  <div className="text-muted text-xs mt-1">
                    {p.email} · {p.location} {p.years > 0 ? `· ${p.years} years experience` : ""}
                  </div>
                </div>
                <button
                  className="btn text-xs"
                  onClick={() => {
                    const text = `${p.name}\n${p.headline}\n${p.email} · ${p.location}\n\nSKILLS:\n${p.skills.join(", ")}\n\nPROJECTS:\n${p.projects.map((x) => `${x.name}: ${x.text}`).join("\n")}`;
                    copyToClipboard(text, "master");
                  }}
                >
                  {copiedId === "master" ? "Copied!" : "Copy Master Text"}
                </button>
              </div>

              <div className="label-xs mt-5">Verified Technical Skills</div>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {p.skills.map((s) => (
                  <span key={s} className="px-2 py-0.5 bg-line/60 rounded text-xs font-mono">
                    {s}
                  </span>
                ))}
              </div>

              <div className="label-xs mt-5">Featured Evidence Projects</div>
              <div className="grid sm:grid-cols-2 gap-3 mt-2">
                {p.projects.map((x) => (
                  <div key={x.name} className="card p-3 bg-bg">
                    <div className="font-medium text-sm">{x.name}</div>
                    <p className="text-muted text-xs mt-1">{x.text || "Project repository imported from GitHub"}</p>
                    {x.tech && x.tech.length > 0 && (
                      <div className="text-[10px] text-dmuted font-mono mt-2">
                        Stack: {x.tech.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal i={1}>
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">Job-Specific Tailored Versions</h2>
              <span className="text-xs text-muted">Immutable & Evidence-Checked</span>
            </div>

            {apps.length === 0 ? (
              <div className="card p-8 text-center text-muted text-sm">
                No tailored versions generated yet. Select a job in{" "}
                <Link className="underline text-fg font-medium" href="/jobs">
                  Jobs
                </Link>{" "}
                and click "Prepare Application".
              </div>
            ) : (
              <div className="space-y-4">
                {apps.map((a, i) => (
                  <div key={a.id} className="card p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-lg">
                          {a.role} — <span className="text-muted">{a.company}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge tone={a.match >= 80 ? "ok" : "n"}>{a.match}% Compatibility</Badge>
                          <Badge>{a.status}</Badge>
                          {a.verified && <Badge tone="ok">✓ Evidence Verified</Badge>}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn text-xs"
                          onClick={() => copyToClipboard(a.resume || "", a.id)}
                        >
                          {copiedId === a.id ? "Copied!" : "Copy Tailored Resume"}
                        </button>
                        <Link href={`/apply/${a.jobId}`} className="btn text-xs">
                          View in Studio
                        </Link>
                      </div>
                    </div>

                    {a.resume && (
                      <div className="mt-4 p-3 bg-bg2 rounded border border-line">
                        <div className="label-xs mb-1">Tailored Content Diff</div>
                        <pre className="font-mono text-xs whitespace-pre-wrap text-dmuted max-h-48 overflow-y-auto">
                          {a.resume}
                        </pre>
                      </div>
                    )}

                    {a.cover && (
                      <div className="mt-3 text-xs text-muted truncate">
                        Cover Letter: "{a.cover.slice(0, 100)}..."
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Reveal>
        </>
      )}
    </>
  );
}
