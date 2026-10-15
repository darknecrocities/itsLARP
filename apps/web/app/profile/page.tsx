"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore, type ExperienceItem } from "@/lib/store";
import { Empty, PageHeader, Reveal, Badge } from "@/components/ui";
import { TargetingPreferences } from "@/components/TargetingPreferences";
import { Plus, X, Trash2, Briefcase, FileText, Shield, ExternalLink } from "lucide-react";

export default function ProfilePage() {
  const { profile: p, setProfile, addEvidence, loadDummyProfile } = useStore();
  const [newSkill, setNewSkill] = useState("");
  const [newEvidenceSource, setNewEvidenceSource] = useState("");
  const [newEvidenceText, setNewEvidenceText] = useState("");
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [evidenceFilter, setEvidenceFilter] = useState("");

  // Experience form state
  const [showAddExp, setShowAddExp] = useState(false);
  const [expCompany, setExpCompany] = useState("");
  const [expTitle, setExpTitle] = useState("");
  const [expStartDate, setExpStartDate] = useState("");
  const [expEndDate, setExpEndDate] = useState("");
  const [expText, setExpText] = useState("");
  const [expMetrics, setExpMetrics] = useState("");

  if (!p.skills.length && !p.name) {
    return (
      <>
        <PageHeader title="Career DNA" sub="Structured single source of truth for your entire career." />
        <Empty title="No Career DNA Created" hint="Upload your resume or connect GitHub to build your verified profile, or test immediately with demo data.">
          <div className="flex gap-2 justify-center">
            <Link href="/onboarding" className="btn btn-primary">
              Start Onboarding
            </Link>
            <button type="button" onClick={() => loadDummyProfile()} className="btn">
              Load Demo Career DNA
            </button>
          </div>
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

  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expTitle.trim()) return;
    const item: ExperienceItem = {
      company: expCompany.trim(),
      title: expTitle.trim(),
      start_date: expStartDate.trim() || undefined,
      end_date: expEndDate.trim() || undefined,
      text: expText.trim(),
      metrics: expMetrics.trim() || undefined,
    };
    const updated = [item, ...(p.experience || [])];
    setProfile({ experience: updated });
    addEvidence([
      {
        source: `Employment Record: ${item.company}`,
        text: `${item.title} at ${item.company} (${item.start_date || ""} - ${item.end_date || "Present"}): ${item.text} ${item.metrics ? `Metrics: ${item.metrics}` : ""}`,
      },
    ]);
    setExpCompany("");
    setExpTitle("");
    setExpStartDate("");
    setExpEndDate("");
    setExpText("");
    setExpMetrics("");
    setShowAddExp(false);
  };

  const handleRemoveExperience = (idx: number) => {
    const updated = (p.experience || []).filter((_, i) => i !== idx);
    setProfile({ experience: updated });
  };

  const handleRemoveEvidence = (idx: number) => {
    const updated = p.evidence.filter((_, i) => i !== idx);
    setProfile({ evidence: updated });
  };

  const filteredEvidence = p.evidence.filter(
    (e) =>
      e.source.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      e.text.toLowerCase().includes(evidenceFilter.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Career DNA Studio"
        sub="The verified single source of truth for your entire professional background. All autonomous agents ground their applications in this evidence."
        action={
          <div className="flex gap-2">
            <button
              type="button"
              className="btn text-xs"
              onClick={() => loadDummyProfile()}
              title="Reset or load verified demo Career DNA profile"
            >
              Load Demo Profile
            </button>
            <Link href="/resume" className="btn text-xs">
              View Complete Resume
            </Link>
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
              <label className="label-xs" htmlFor="esrc">Evidence Source</label>
              <input
                id="esrc"
                className="input mt-1"
                placeholder="AWS Certified Solutions Architect, GitHub Repo, Project Docs"
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
                placeholder="Passed certification demonstrating distributed system architecture, VPC, and S3..."
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

      {/* Targeting & Preferences Component */}
      <section className="mb-8">
        <TargetingPreferences />
      </section>

      {/* Identity & Core DNA */}
      <Reveal>
        <section className="card p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Candidate Identity & Summary</h2>
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
              <label className="label-xs" htmlFor="pphone">Phone Number</label>
              <input
                id="pphone"
                className="input mt-1"
                placeholder="+1 (555) 000-0000"
                value={p.phone || ""}
                onChange={(e) => setProfile({ phone: e.target.value })}
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
              <label className="label-xs" htmlFor="pedu">Education & Credentials</label>
              <input
                id="pedu"
                className="input mt-1"
                value={p.education}
                onChange={(e) => setProfile({ education: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-xs" htmlFor="psummary">Professional Abstract / Summary Statement</label>
              <textarea
                id="psummary"
                rows={3}
                className="input mt-1 text-xs"
                placeholder="Empirical technical practitioner with experience building scalable software..."
                value={p.summary || ""}
                onChange={(e) => setProfile({ summary: e.target.value })}
              />
            </div>
          </div>
        </section>
      </Reveal>

      {/* Employment History */}
      <Reveal i={1}>
        <section className="card p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-semibold">Employment History & Roles</h2>
              <p className="text-xs text-muted">Past positions with verified achievements and impact metrics.</p>
            </div>
            <button className="btn text-xs" onClick={() => setShowAddExp(!showAddExp)}>
              + Add Position
            </button>
          </div>

          {showAddExp && (
            <form onSubmit={handleAddExperience} className="p-4 bg-bg2 rounded border border-line mb-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="label-xs">Company Name</label>
                  <input
                    className="input text-xs mt-1"
                    placeholder="e.g. Stripe, Anthropic"
                    value={expCompany}
                    onChange={(e) => setExpCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs">Position Title</label>
                  <input
                    className="input text-xs mt-1"
                    placeholder="e.g. Senior Software Engineer"
                    value={expTitle}
                    onChange={(e) => setExpTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs">Start Date</label>
                  <input
                    className="input text-xs mt-1"
                    placeholder="e.g. Jan 2022"
                    value={expStartDate}
                    onChange={(e) => setExpStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs">End Date</label>
                  <input
                    className="input text-xs mt-1"
                    placeholder="e.g. Present"
                    value={expEndDate}
                    onChange={(e) => setExpEndDate(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label-xs">Responsibilities & Achievements</label>
                <textarea
                  rows={2}
                  className="input text-xs mt-1"
                  placeholder="Architected distributed event streaming platform serving 2M users..."
                  value={expText}
                  onChange={(e) => setExpText(e.target.value)}
                />
              </div>
              <div>
                <label className="label-xs">Measurable Metrics / Impact</label>
                <input
                  className="input text-xs mt-1 font-mono"
                  placeholder="e.g. Reduced p99 latency by 45%, $1.2M annual cloud savings"
                  value={expMetrics}
                  onChange={(e) => setExpMetrics(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn text-xs" onClick={() => setShowAddExp(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary text-xs">
                  Save Position
                </button>
              </div>
            </form>
          )}

          {(!p.experience || p.experience.length === 0) ? (
            <p className="text-muted text-sm py-2">No positions added yet. Click "+ Add Position" to record your history.</p>
          ) : (
            <div className="space-y-3">
              {p.experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-bg2 rounded border border-line text-xs">
                  <div className="flex justify-between items-start font-semibold">
                    <span className="text-sm font-bold text-ink">{exp.title} — {exp.company}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted font-mono">{exp.start_date || ""} – {exp.end_date || "Present"}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(idx)}
                        className="text-muted hover:text-ink"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-dmuted mt-1 leading-relaxed">{exp.text}</p>
                  {exp.metrics && (
                    <div className="text-[11px] font-mono text-ink font-medium mt-1">
                      Metrics: {exp.metrics}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </Reveal>

      {/* Verified Skills */}
      <Reveal i={2}>
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
                  className="text-muted hover:text-ink text-[11px]"
                  onClick={() => setProfile({ skills: p.skills.filter((x) => x !== s) })}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Projects */}
      <Reveal i={3}>
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
      <Reveal i={4}>
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
                <div key={i} className="p-3 bg-bg2 rounded border border-line text-xs font-mono flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-muted mb-1 text-[11px]">
                      <span className="font-semibold text-fg">Source: {ev.source}</span>
                      <span>#{i + 1}</span>
                    </div>
                    <p className="text-dmuted font-sans leading-relaxed">{ev.text}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEvidence(i)}
                    className="text-muted hover:text-ink text-xs p-1"
                    title="Remove evidence record"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </Reveal>
    </>
  );
}
