"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useStore } from "@/lib/store";
import { api } from "@/lib/api";
import type { Job } from "@/lib/data";
import { Badge, Empty, ErrorBox, PageHeader, Reveal } from "@/components/ui";
import { X, Globe } from "lucide-react";
import {
  LinkedInIcon,
  IndeedIcon,
  GlassdoorIcon,
  ZipRecruiterIcon,
  WellfoundIcon,
} from "@/components/BrandIcons";

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", Icon: LinkedInIcon },
  { id: "indeed", name: "Indeed", Icon: IndeedIcon },
  { id: "glassdoor", name: "Glassdoor", Icon: GlassdoorIcon },
  { id: "ziprecruiter", name: "ZipRecruiter", Icon: ZipRecruiterIcon },
  { id: "wellfound", name: "Wellfound", Icon: WellfoundIcon },
];

function renderPlatformSource(source: string) {
  const s = (source || "").toLowerCase();
  if (s.includes("linkedin")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg font-medium">
        <LinkedInIcon size={14} /> LinkedIn
      </span>
    );
  }
  if (s.includes("indeed")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg font-medium">
        <IndeedIcon size={14} /> Indeed
      </span>
    );
  }
  if (s.includes("glassdoor")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg font-medium">
        <GlassdoorIcon size={14} /> Glassdoor
      </span>
    );
  }
  if (s.includes("ziprecruiter")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg font-medium">
        <ZipRecruiterIcon size={14} /> ZipRecruiter
      </span>
    );
  }
  if (s.includes("wellfound") || s.includes("angel")) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-fg font-medium">
        <WellfoundIcon size={14} /> Wellfound
      </span>
    );
  }
  return <span className="text-muted text-xs">{source}</span>;
}

export default function JobsPage() {
  const [q, setQ] = useState("");
  const [searchParam, setSearchParam] = useState("");
  const [remote, setRemote] = useState(false);
  const [domainFilter, setDomainFilter] = useState("all");
  const [sort, setSort] = useState<"match" | "company">("match");

  // Custom Job Import Modal state
  const [showImport, setShowImport] = useState(false);
  const [importUrl, setImportUrl] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [importCompany, setImportCompany] = useState("");
  const [importDesc, setImportDesc] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  const profile = useStore((s) => s.profile);
  const apps = useStore((s) => s.apps);
  const jobPreferences = useStore((s) => s.jobPreferences);
  const setJobPreferences = useStore((s) => s.setJobPreferences);
  const { data: jobs, isLoading, error, refetch } = useJobs(searchParam, remote);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParam(q);
  };

  const handleImportJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportError("");
    try {
      const newJob = await api<Job>("/jobs/import-url", {
        url: importUrl,
        title: importTitle,
        company: importCompany,
        description: importDesc,
        profile,
      });
      setShowImport(false);
      setImportUrl("");
      setImportTitle("");
      setImportCompany("");
      setImportDesc("");
      refetch();
    } catch (err: any) {
      setImportError(err.message || "Failed to import job");
    } finally {
      setImporting(false);
    }
  };

  const rows = useMemo(() => {
    if (!jobs) return [];
    return jobs
      .filter((j) => {
        if (domainFilter !== "all" && j.domain !== domainFilter) return false;
        const src = (j.source || "").toLowerCase();
        const matchesPlatform = PLATFORMS.some((p) => src.includes(p.id));
        if (matchesPlatform) {
          const isSelected = jobPreferences.selectedPlatforms.some((p) => src.includes(p));
          if (!isSelected) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "match") {
          return (b.match?.score ?? 0) - (a.match?.score ?? 0);
        }
        return a.company.localeCompare(b.company);
      });
  }, [jobs, domainFilter, sort, jobPreferences.selectedPlatforms]);

  return (
    <>
      <PageHeader
        title="Jobs"
        sub="Browse openings found for you across top job boards, scored by how well they match your profile."
        action={
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => setShowImport(true)}>
              + Add Job / URL
            </button>
            <Link href="/agents" className="btn">
              Launch Agents
            </Link>
          </div>
        }
      />

      {/* Target Platforms Bar */}
      <div className="card p-3 mb-6 bg-bg2/40 border border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Target Platforms:</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {PLATFORMS.map(({ id, name, Icon }) => {
              const active = jobPreferences.selectedPlatforms.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    const next = active
                      ? jobPreferences.selectedPlatforms.filter((p) => p !== id)
                      : [...jobPreferences.selectedPlatforms, id];
                    setJobPreferences({ selectedPlatforms: next.length > 0 ? next : [id] });
                  }}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition-colors border ${
                    active
                      ? "bg-bg text-fg border-black shadow-xs font-medium"
                      : "bg-transparent text-muted border-line/60 opacity-60 hover:opacity-100"
                  }`}
                  title={`${active ? "Active" : "Disabled"} for application swarm`}
                >
                  <Icon size={14} />
                  <span>{name}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>Pace: <strong className="text-fg">{jobPreferences.dailyPace || 25}/day</strong></span>
          <span>Auto-Match: <strong className="text-fg">{jobPreferences.matchThreshold || 75}%</strong></span>
          <Link href="/integrations" className="text-fg underline hover:no-underline font-medium">
            Configure Integrations
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <form onSubmit={handleSearchSubmit} className="flex flex-wrap items-center gap-3 mb-6">
        <label className="sr-only" htmlFor="q">Search</label>
        <div className="flex gap-2 max-w-sm flex-1">
          <input
            id="q"
            className="input"
            placeholder="Search role, skills, company (e.g. AI Engineer)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button type="submit" className="btn">Search</button>
        </div>

        <label className="flex items-center gap-2 text-sm text-dmuted cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => {
              setRemote(e.target.checked);
            }}
          />
          Remote only
        </label>

        <label className="sr-only" htmlFor="domain">Domain</label>
        <select
          id="domain"
          className="input max-w-[130px]"
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
        >
          <option value="all">All Domains</option>
          <option value="ai">AI / ML</option>
          <option value="web">Web / Fullstack</option>
          <option value="data">Data / MLOps</option>
        </select>

        <label className="sr-only" htmlFor="sort">Sort</label>
        <select
          id="sort"
          className="input max-w-[140px]"
          value={sort}
          onChange={(e) => setSort(e.target.value as "match")}
        >
          <option value="match">Best match</option>
          <option value="company">Company</option>
        </select>
      </form>

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="card max-w-lg w-full p-6 bg-bg border border-line shadow-2xl rise">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Import Opportunity</h3>
              <button
                type="button"
                className="text-muted hover:text-fg text-sm p-1 rounded"
                onClick={() => setShowImport(false)}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-muted mb-4">
              Paste a URL from any careers page (Greenhouse, Lever, LinkedIn, company site) or enter details directly.
            </p>
            <form onSubmit={handleImportJob} className="space-y-3">
              <div>
                <label className="label-xs" htmlFor="iurl">Job URL</label>
                <input
                  id="iurl"
                  className="input mt-1"
                  placeholder="https://company.com/jobs/ai-lead"
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs" htmlFor="ititle">Job Title</label>
                  <input
                    id="ititle"
                    className="input mt-1"
                    placeholder="AI Engineer"
                    value={importTitle}
                    onChange={(e) => setImportTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-xs" htmlFor="icompany">Company</label>
                  <input
                    id="icompany"
                    className="input mt-1"
                    placeholder="Acme Corp"
                    value={importCompany}
                    onChange={(e) => setImportCompany(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="label-xs" htmlFor="idesc">Job Description / Requirements</label>
                <textarea
                  id="idesc"
                  rows={4}
                  className="input mt-1"
                  placeholder="Paste description or requirements here..."
                  value={importDesc}
                  onChange={(e) => setImportDesc(e.target.value)}
                />
              </div>

              {importError && <p className="text-xs text-err">{importError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowImport(false)}
                  disabled={importing}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={importing}>
                  {importing ? "Analyzing & Adding..." : "Import & Score Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && <ErrorBox msg={(error as Error).message} retry={() => refetch()} />}

      {!profile.skills.length ? (
        <Empty title="Scores need your Career DNA" hint="Upload your resume or connect GitHub to score opportunities.">
          <Link href="/onboarding" className="btn btn-primary">
            Build Career DNA
          </Link>
        </Empty>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="label-xs border-b border-line">
              <tr>
                <th scope="col" className="py-2.5">Role</th>
                <th scope="col">Company</th>
                <th scope="col">Location</th>
                <th scope="col">Salary</th>
                <th scope="col">Source</th>
                <th scope="col">Match</th>
                <th scope="col" className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((j) => {
                const m = j.match;
                const score = m?.score ?? 0;
                const existing = apps.find(
                  (a) =>
                    a.jobId === j.id ||
                    (a.company.toLowerCase() === j.company.toLowerCase() &&
                      a.role.toLowerCase() === j.title.toLowerCase())
                );
                const isRejected = existing && (existing.status === "REJECTED" || existing.status === "WITHDRAWN");
                const isOngoing = existing && !isRejected;

                return (
                  <tr key={j.id} className="border-b border-line hover:bg-bg2 transition-colors">
                    <td className="py-3 font-medium">
                      <Link
                        className="underline-offset-2 hover:underline text-fg font-semibold"
                        href={`/apply/${j.id}`}
                      >
                        {j.title}
                      </Link>
                      {existing && (
                        <span className="ml-2 font-mono text-[10px] text-neutral-500">
                          {isRejected ? "· Previously Rejected (Can Re-Apply)" : `· Ongoing: ${existing.status}`}
                        </span>
                      )}
                      {j.skills && j.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {j.skills.slice(0, 4).map((s) => (
                            <span
                              key={s}
                              className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                                profile.skills.some((ps) => ps.toLowerCase() === s.toLowerCase())
                                  ? "bg-black text-white"
                                  : "bg-line/40 text-muted"
                              }`}
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="text-dmuted">{j.company}</td>
                    <td className="text-xs text-muted">
                      {j.location} {j.remote && "· Remote"}
                    </td>
                    <td className="text-xs">{j.salary || "Not listed"}</td>
                    <td className="text-muted text-xs">{renderPlatformSource(j.source)}</td>
                    <td>
                      {isLoading ? (
                        <span className="text-muted">…</span>
                      ) : existing ? (
                        <Badge tone={isRejected ? "warn" : "ok"}>
                          {existing.status}
                        </Badge>
                      ) : m ? (
                        <Badge tone={score >= 80 ? "ok" : score >= 60 ? "n" : "warn"}>
                          {score}% · {m.label}
                        </Badge>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="text-right">
                      <Link
                        href={`/apply/${j.id}`}
                        className={`btn text-xs py-1 px-2.5 ${
                          isRejected
                            ? "bg-black text-white hover:bg-neutral-800"
                            : isOngoing
                            ? "bg-neutral-100 border-neutral-300"
                            : ""
                        }`}
                      >
                        {isRejected ? "Re-Apply" : isOngoing ? "View Status" : "Prepare App"}
                      </Link>
                    </td>
                  </tr>
                );
              })}

            </tbody>
          </table>

          {isLoading && (
            <div className="py-12 text-center text-muted font-mono text-xs">
              Discovering and scoring opportunities across sources...
            </div>
          )}

          {!isLoading && rows.length === 0 && (
            <p className="text-muted py-8 text-center text-sm">
              No jobs found matching your criteria. Try adjusting filters or click "+ Add Job / URL".
            </p>
          )}
        </div>
      )}
    </>
  );
}
