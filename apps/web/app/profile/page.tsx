"use client";
import Link from "next/link";
import { useState } from "react";
import { useStore, type ExperienceItem, type ProjectItem } from "@/lib/store";
import { PageHeader, Reveal } from "@/components/ui";
import { TargetingPreferences } from "@/components/TargetingPreferences";
import { CareerDnaLlmBuilder } from "@/components/profile/CareerDnaLlmBuilder";
import { ApplicationConfigPanel } from "@/components/apply/ApplicationConfigPanel";
import { ResumeDesignPreview } from "@/components/resume/ResumeDesignPreview";
import { CollapsibleSection } from "@/components/profile/CollapsibleSection";
import {
  User,
  Briefcase,
  Code,
  FolderGit2,
  CheckCircle2,
  Sliders,
  FileText,
  X,
  Trash2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function ProfilePage() {
  const { profile: p, setProfile, addEvidence, clearProfile } = useStore();
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

  // Project form state
  const [showAddProj, setShowAddProj] = useState(false);
  const [projName, setProjName] = useState("");
  const [projTech, setProjTech] = useState("");
  const [projText, setProjText] = useState("");
  const [projUrl, setProjUrl] = useState("");

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
    setProfile({ experience: [item, ...(p.experience || [])] });
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

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projName.trim()) return;
    const techList = projTech
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const item: ProjectItem = {
      name: projName.trim(),
      tech: techList,
      text: projText.trim() || "Verified software engineering project.",
      url: projUrl.trim() || undefined,
    };
    setProfile({ projects: [item, ...(p.projects || [])] });
    addEvidence([
      {
        source: `Project Artifact: ${item.name}`,
        text: `${item.name} [${techList.join(", ")}]: ${item.text}`,
      },
    ]);
    setProjName("");
    setProjTech("");
    setProjText("");
    setProjUrl("");
    setShowAddProj(false);
  };

  const handleRemoveExperience = (idx: number) => {
    setProfile({ experience: (p.experience || []).filter((_, i) => i !== idx) });
  };

  const handleRemoveProject = (idx: number) => {
    setProfile({ projects: (p.projects || []).filter((_, i) => i !== idx) });
  };

  const handleRemoveEvidence = (idx: number) => {
    setProfile({ evidence: p.evidence.filter((_, i) => i !== idx) });
  };

  const filteredEvidence = p.evidence.filter(
    (e) =>
      e.source.toLowerCase().includes(evidenceFilter.toLowerCase()) ||
      e.text.toLowerCase().includes(evidenceFilter.toLowerCase())
  );

  return (
    <>
      <div data-tour="profile-header">
        <PageHeader
          title="Career Profile & Resume Studio"
          sub="The verified source of truth for your background. Import from GitHub, LinkedIn, or personal website, or customize each section below."
          action={
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard" className="btn text-xs inline-flex items-center gap-1.5">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Dashboard</span>
              </Link>
              <button
                type="button"
                data-tour="profile-save-btn"
                className="btn text-xs text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => {
                  if (window.confirm("Reset your career profile? This will clear local entries.")) {
                    clearProfile();
                  }
                }}
              >
                Reset Profile
              </button>
              <Link href="/resume" className="btn text-xs">
                Resume Studio
              </Link>
              <Link href="/onboarding" className="btn text-xs">
                Upload PDF
              </Link>
            </div>
          }
        />
      </div>

      {/* Online Importer */}
      <section data-tour="profile-crawler-section" className="mb-5">
        <CareerDnaLlmBuilder />
      </section>

      {/* Live Resume Design Preview */}
      <CollapsibleSection
        dataTour="profile-resume-preview-section"
        title="Live Resume Preview & Export"
        subtitle="Inspect and download your tailored resume in APA 7th, Compact, or Modern styles"
        icon={<FileText className="w-4 h-4" />}
        defaultOpen={true}
      >
        <ResumeDesignPreview />
      </CollapsibleSection>

      {/* Application Preferences */}
      <CollapsibleSection
        title="Application Preferences & Tailoring Settings"
        subtitle="Configure tailoring thresholds, cover letter style, and layout density"
        icon={<Sliders className="w-4 h-4" />}
        defaultOpen={false}
      >
        <ApplicationConfigPanel compact />
      </CollapsibleSection>

      {/* Job Search Targeting */}
      <CollapsibleSection
        title="Job Search Targeting & Salary Goals"
        subtitle="Desired titles, target locations, work arrangements, and compensation expectations"
        icon={<Sparkles className="w-4 h-4" />}
        defaultOpen={false}
      >
        <TargetingPreferences />
      </CollapsibleSection>

      {/* Personal Info & Executive Summary */}
      <Reveal>
        <CollapsibleSection
          dataTour="profile-personal-info-section"
          title="Personal Information & Executive Summary"
          subtitle="Your contact details, headline, and bio"
          icon={<User className="w-4 h-4" />}
          defaultOpen={true}
        >
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="label-xs" htmlFor="pname">Full Name</label>
              <input
                id="pname"
                data-tour="profile-name-input"
                className="input mt-1"
                value={p.name}
                onChange={(e) => setProfile({ name: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="phline">Professional Headline</label>
              <input
                id="phline"
                data-tour="profile-headline-input"
                className="input mt-1"
                value={p.headline}
                onChange={(e) => setProfile({ headline: e.target.value })}
              />
            </div>
            <div>
              <label className="label-xs" htmlFor="pemail">Email Address</label>
              <input id="pemail" className="input mt-1" value={p.email} onChange={(e) => setProfile({ email: e.target.value })} />
            </div>
            <div>
              <label className="label-xs" htmlFor="pphone">Phone Number</label>
              <input id="pphone" className="input mt-1" placeholder="+1 (555) 000-0000" value={p.phone || ""} onChange={(e) => setProfile({ phone: e.target.value })} />
            </div>
            <div>
              <label className="label-xs" htmlFor="ploc">Location</label>
              <input id="ploc" className="input mt-1" value={p.location} onChange={(e) => setProfile({ location: e.target.value })} />
            </div>
            <div>
              <label className="label-xs" htmlFor="pyears">Years of Experience</label>
              <input id="pyears" type="number" min={0} max={50} className="input mt-1" value={p.years || 0} onChange={(e) => setProfile({ years: Number(e.target.value) || 0 })} />
            </div>
            <div className="md:col-span-3">
              <label className="label-xs" htmlFor="pedu">Education & Academic Background</label>
              <input id="pedu" className="input mt-1" value={p.education} onChange={(e) => setProfile({ education: e.target.value })} />
            </div>
            <div className="md:col-span-3">
              <label className="label-xs" htmlFor="psummary">Executive Summary</label>
              <textarea
                id="psummary"
                rows={3}
                className="input mt-1 text-xs"
                placeholder="Software engineer experienced in building scalable applications..."
                value={p.summary || ""}
                onChange={(e) => setProfile({ summary: e.target.value })}
              />
            </div>
          </div>
        </CollapsibleSection>
      </Reveal>

      {/* Employment History */}
      <Reveal i={1}>
        <CollapsibleSection
          dataTour="profile-experience-section"
          title={`Work Experience (${(p.experience || []).length})`}
          subtitle="Past positions with verified achievements and impact"
          icon={<Briefcase className="w-4 h-4" />}
          defaultOpen={true}
          action={
            <button className="btn text-xs" onClick={() => setShowAddExp(!showAddExp)}>
              + Add Position
            </button>
          }
        >
          {showAddExp && (
            <form onSubmit={handleAddExperience} className="p-4 bg-bg2 rounded border border-line mb-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input text-xs" placeholder="Company Name (e.g. Stripe)" value={expCompany} onChange={(e) => setExpCompany(e.target.value)} />
                <input className="input text-xs" placeholder="Position Title (e.g. Senior Engineer)" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} />
                <input className="input text-xs" placeholder="Start Date (e.g. Jan 2022)" value={expStartDate} onChange={(e) => setExpStartDate(e.target.value)} />
                <input className="input text-xs" placeholder="End Date (e.g. Present)" value={expEndDate} onChange={(e) => setExpEndDate(e.target.value)} />
              </div>
              <textarea rows={2} className="input text-xs" placeholder="Responsibilities & engineering impact..." value={expText} onChange={(e) => setExpText(e.target.value)} />
              <input className="input text-xs font-mono" placeholder="Measurable Metrics (e.g. Reduced p99 latency by 45%)" value={expMetrics} onChange={(e) => setExpMetrics(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn text-xs" onClick={() => setShowAddExp(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-xs">Save Position</button>
              </div>
            </form>
          )}

          {(!p.experience || p.experience.length === 0) ? (
            <p className="text-muted text-sm py-2">No positions added yet. Click "+ Add Position" or import from online links above.</p>
          ) : (
            <div className="space-y-3">
              {p.experience.map((exp, idx) => (
                <div key={idx} className="p-3 bg-bg2 rounded border border-line text-xs">
                  <div className="flex justify-between items-start font-semibold">
                    <span className="text-sm font-bold text-ink">{exp.title || exp.role} — {exp.company}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted font-mono">{exp.start_date || exp.dates || "Recent"}</span>
                      <button type="button" onClick={() => handleRemoveExperience(idx)} className="text-muted hover:text-ink" title="Delete entry">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-dmuted mt-1 leading-relaxed">{exp.text}</p>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </Reveal>

      {/* Technical Skills */}
      <Reveal i={2}>
        <CollapsibleSection
          dataTour="profile-skills-section"
          title={`Technical Skills (${p.skills.length})`}
          subtitle="Verified engineering competencies used for job matching"
          icon={<Code className="w-4 h-4" />}
          defaultOpen={true}
          action={
            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                className="input text-xs py-1 max-w-[180px]"
                placeholder="Add skill (e.g. PyTorch)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <button type="submit" className="btn text-xs py-1">+ Add</button>
            </form>
          }
        >
          <div className="flex flex-wrap gap-2">
            {p.skills.map((s) => (
              <span key={s} className="px-2.5 py-1 bg-bg2 rounded text-xs font-mono border border-line flex items-center gap-1.5">
                {s}
                <button type="button" className="text-muted hover:text-ink text-[11px]" onClick={() => setProfile({ skills: p.skills.filter((x) => x !== s) })}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </CollapsibleSection>
      </Reveal>

      {/* Featured Projects */}
      <Reveal i={3}>
        <CollapsibleSection
          dataTour="profile-projects-section"
          title={`Projects & Portfolios (${(p.projects || []).length})`}
          subtitle="Key engineering repositories and applications"
          icon={<FolderGit2 className="w-4 h-4" />}
          defaultOpen={true}
          action={
            <button className="btn text-xs" onClick={() => setShowAddProj(!showAddProj)}>+ Add Project</button>
          }
        >
          {showAddProj && (
            <form onSubmit={handleAddProject} className="p-4 bg-bg2 rounded border border-line mb-4 space-y-3">
              <div className="grid md:grid-cols-2 gap-3">
                <input className="input text-xs" placeholder="Project Name" value={projName} onChange={(e) => setProjName(e.target.value)} />
                <input className="input text-xs" placeholder="Tech Stack (comma-separated: React, Python, Docker)" value={projTech} onChange={(e) => setProjTech(e.target.value)} />
              </div>
              <textarea rows={2} className="input text-xs" placeholder="Project description and key achievements..." value={projText} onChange={(e) => setProjText(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn text-xs" onClick={() => setShowAddProj(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary text-xs">Save Project</button>
              </div>
            </form>
          )}
          {p.projects.length === 0 ? (
            <p className="text-muted text-sm">Import your GitHub above or click "+ Add Project".</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {p.projects.map((x, idx) => (
                <div key={`${x.name}-${idx}`} className="card p-3.5 bg-bg2/40 flex justify-between items-start gap-2">
                  <div>
                    <div className="font-semibold text-sm">{x.name}</div>
                    <p className="text-muted text-xs mt-1">{x.text}</p>
                    {x.tech && x.tech.length > 0 && (
                      <div className="text-[10px] text-dmuted font-mono mt-2">Stack: {x.tech.join(", ")}</div>
                    )}
                  </div>
                  <button type="button" onClick={() => handleRemoveProject(idx)} className="text-muted hover:text-ink" title="Remove project">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CollapsibleSection>
      </Reveal>

      {/* Verified Evidence Details */}
      <Reveal i={4}>
        <CollapsibleSection
          dataTour="profile-proof-section"
          title={`Verified Career Details & Proof (${p.evidence.length})`}
          subtitle="All claims in your resumes are verified against these recorded evidence items"
          icon={<CheckCircle2 className="w-4 h-4" />}
          defaultOpen={false}
          action={
            <div className="flex gap-2">
              <input
                className="input max-w-xs text-xs py-1"
                placeholder="Search details..."
                value={evidenceFilter}
                onChange={(e) => setEvidenceFilter(e.target.value)}
              />
              <button className="btn btn-primary text-xs" onClick={() => setShowAddEvidence(!showAddEvidence)}>
                + Add Record
              </button>
            </div>
          }
        >
          {showAddEvidence && (
            <div className="card p-5 mb-4 border border-black bg-bg2/50">
              <h3 className="text-sm font-semibold mb-2">Record Verified Career Evidence</h3>
              <form onSubmit={handleAddEvidence} className="space-y-3">
                <div>
                  <label className="label-xs" htmlFor="esrc">Source</label>
                  <input
                    id="esrc"
                    className="input mt-1"
                    placeholder="e.g. AWS Certification, GitHub Repo, Project Docs"
                    value={newEvidenceSource}
                    onChange={(e) => setNewEvidenceSource(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs" htmlFor="etxt">Factual Proof / Details</label>
                  <textarea
                    id="etxt"
                    rows={3}
                    className="input mt-1"
                    placeholder="Details demonstrating verified experience or results..."
                    value={newEvidenceText}
                    onChange={(e) => setNewEvidenceText(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" className="btn text-xs" onClick={() => setShowAddEvidence(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary text-xs">Save Record</button>
                </div>
              </form>
            </div>
          )}

          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-2">
            {filteredEvidence.length === 0 ? (
              <p className="text-muted text-sm py-4 text-center">No matching evidence records.</p>
            ) : (
              filteredEvidence.map((ev, i) => (
                <div key={i} className="p-3 bg-bg2 rounded border border-line text-xs flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-muted mb-1 text-[11px]">
                      <span className="font-semibold text-fg">Source: {ev.source}</span>
                      <span>#{i + 1}</span>
                    </div>
                    <p className="text-dmuted leading-relaxed">{ev.text}</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveEvidence(i)} className="text-muted hover:text-ink text-xs p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </CollapsibleSection>
      </Reveal>
    </>
  );
}
