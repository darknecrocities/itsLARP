"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { Empty, PageHeader, Reveal, Badge } from "@/components/ui";

export default function ProfilePage() {
  const { profile: p, setProfile, addEvidence } = useStore();
  const [newSkill, setNewSkill] = useState("");
  const [newEvidenceSource, setNewEvidenceSource] = useState("");
  const [newEvidenceText, setNewEvidenceText] = useState("");
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState("");

  if (!p.skills.length && !p.name) {
    return (
      <>
        <PageHeader title="Career DNA" sub="Structured single source of truth for your entire career." />
        <Empty title="No Career DNA Created" hint="Upload your resume or connect GitHub to build your verified profile.">
          <Link href="/onboarding" className="btn btn-primary">
            Start Onboarding
          </Link>
        </Empty>
      </>
    );
  }

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const s = newSkill.trim();
    if (!p.skills.includes(s)) {
      setProfile({ skills: [...p.skills, s] });
      addEvidence([{ source: "Manual Verification", text: `Candidate verified proficiency in ${s}.` }]);
    }
    setNewSkill("");
  };

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvidenceSource.trim() || !newEvidenceText.trim()) return;
    addEvidence([{ source: newEvidenceSource.trim(), text: newEvidenceText.trim() }]);
    setNewEvidenceSource("");
    setNewEvidenceText("");
    setShowAddEvidence(false);
  };

  const filteredEvidence = p.evidence.filter(
    (e) =>
      e.source.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      e.text.toLowerCase().includes(evidenceFilter.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Career DNA & Evidence Repository"
        sub="The single source of truth. Structured career data backed by traceable evidence. AI is strictly constrained to this repository."
        action={
          <div className="flex gap-2">
            <Link href="/onboarding" className="btn text-xs">
              Upload Sources
            </Link>
            <button className="btn btn-primary text-xs" onClick={() => setShowAddEvidence(!showAddEvidence)}>
              + Add Evidence
            </button>
          </div>
        }
      />

      {/* Manual Evidence Modal */}
      {showAddEvidence && (
        <div className="card p-5 mb-8 border-2 border-black bg-bg2/50 rise">
          <h3 className="text-base font-semibold mb-2">Record Verified Career Evidence</h3>
          <p className="text-xs text-muted mb-3">
            Add a project doc, certification, or reference excerpt. This prevents AI hallucination during resume tailoring.
          </p>
          <form onSubmit={handleAddEvidence} className="space-y-3">
            <div>
              <label className="label-xs" htmlFor="esrc">Evidence Source (e.g. AWS Certificate, GitHub Repo, Project Docs)</label>
              <input
                id="esrc"
                className="input mt-1"
                placeholder="AWS Certified Solutions Architect"
                value={newEvidenceSource}
                onChange={(e) => setNewEvidenceSource(e.target.value)}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="etxt">Factual Details / Text</label>
              <textarea
                id="etxt"
                rows={3}
                className="input mt-1"
                placeholder="Passed certification in 2024 demonstrating distributed system architecture, VPC, and S3..."
                value={newEvidenceText}
                onChange={(e) => setNewEvidenceText(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn text-xs" onClick={() => setShowAddEvidence(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                Save Evidence Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Identity Fields */}
      <Reveal>
        <section className="card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Candidate Identity</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="label-xs" htmlFor="pname">Full Name</label>
              <input
                id="pname"
                className="input mt-1"
                value={p.name}
                onChange={(e) => setProfile({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="phline">Professional Headline</label>
              <input
                id="phline"
                className="input mt-1"
                value={p.headline}
                onChange={(e) => setProfile({ headline: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="pemail">Email Address</label>
              <input
                id="pemail"
                className="input mt-1"
                value={p.email}
                onChange={(e) => setProfile({ email: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="ploc">Location</label>
              <input
                id="ploc"
                className="input mt-1"
                value={p.location}
                onChange={(e) => setProfile({ location: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="pyears">Years of Professional Experience</label>
              <input
                id="pyears"
                type="number"
                min={0}
                className="input mt-1"
                value={p.years}
                onChange={(e) => setProfile({ years: +e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="pedu">Education</label>
              <input
                id="pedu"
                className="input mt-1"
                value={p.education}
                onChange={(e) => setProfile({ education: e.target.value })}
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Skills */}
      <Reveal i={1}>
        <section className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Technical Skills ({p.skills.length})</h2>
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                className="input text-xs py-1 max-w-[180px]"
                placeholder="Add skill (e.g. PyTorch)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="submit" className="btn text-xs py-1">
                + Add
              </button>
            </form>
          </div>
          <div className="flex flex-wrap gap-2">
            {p.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 bg-bg2 rounded text-xs font-mono border border-line flex items-center gap-1.5">
                {s}
                <button
                  type="button"
                  className="text-muted hover:text-err text-[11px]"
                  onClick={() => setProfile({ skills: p.skills.filter((x) => x !== s) })}
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Projects */}
      <Reveal i={2}>
        <section className="card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-3">Featured Projects & Repositories</h2>
          {p.projects.length === 0 ? (
            <p className="text-muted text-sm">Connect GitHub in onboarding to auto-import repositories.</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {p.projects.map((x) => (
                <div key={x.name} className="card p-3.5 bg-bg2/40">
                  <div className="font-semibold text-sm">{x.name}</div>
                  <p className="text-muted text-xs mt-1">{x.text || "Imported repository"}</p>
                  {x.tech && x.tech.length > 0 && (
                    <div className="text-[10px] text-dmuted font-mono mt-2">
                      Stack: {x.tech.join(", ")}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Verifiable Evidence Corpus */}
      <Reveal i={3}>
        <section className="card p-6">
          <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">Evidence Corpus ({p.evidence.length} Records)</h2>
              <p className="text-xs text-muted">
                Every claim proposed by the AI workforce is validated against this evidence list.
              </p>
            </div>
            <input
              className="input max-w-xs text-xs py-1"
              placeholder="Search evidence..."
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
            />
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2.5 pr-2">
            {filteredEvidence.length === 0 ? (
              <p className="text-muted text-sm py-4 text-center">No evidence matching search.</p>
            ) : (
              filteredEvidence.map((ev, i) => (
                <div key={i} className="p-3 bg-bg2 rounded border border-line text-xs font-mono">
                  <div className="flex justify-between items-center text-muted mb-1 text-[11px]">
                    <span className="font-semibold text-fg">Source: {ev.source}</span>
                    <span>#{i + 1}</span>
                  </div>
                  <p className="text-dmuted font-sans leading-relaxed">{ev.text}</p>
                </div>
              ))
            )}
          </div>
        </section>
      </Reveal>
    </>
  );
}
