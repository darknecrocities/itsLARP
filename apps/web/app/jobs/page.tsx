"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useJobs } from "@/lib/useJobs";
import { useStore } from "@/lib/store";
import { Badge, Empty, ErrorBox, PageHeader, Reveal } from "@/components/ui";
import { ImportJobModal } from "@/components/jobs/ImportJobModal";
import { JobFiltersBar } from "@/components/jobs/JobFiltersBar";
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
  const [employmentType, setEmploymentType] = useState("all");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [sort, setSort] = useState<"match" | "company">("match");

  const [targetCount, setTargetCount] = useState<number>(1000);
  const [showImport, setShowImport] = useState(false);

  const profile = useStore((s) => s.profile);
  const apps = useStore((s) => s.apps);
  const jobPreferences = useStore((s) => s.jobPreferences);
  const setJobPreferences = useStore((s) => s.setJobPreferences);
  const { data: jobs, isLoading, error, refetch } = useJobs(
    searchParam,
    remote,
    employmentType,
    experienceLevel,
    0,
    jobPreferences.selectedPlatforms
  );

  const handleSearchSubmit = (submittedQuery: string) => {
    setSearchParam(submittedQuery);
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

      {/* Target Jobs Goal Selector */}
      <div className="card p-3.5 mb-6 bg-white dark:bg-neutral-900 border border-line flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider font-mono">
            Target Jobs Goal:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[100, 1000, 5000, 10000, 50000].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTargetCount(t)}
                className={`px-2.5 py-1 text-xs rounded font-mono border transition ${
                  targetCount === t
                    ? "bg-black text-white border-black font-bold"
                    : "bg-bg text-muted border-line hover:text-ink"
                }`}
              >
                {t >= 1000 ? `${t / 1000}k` : t} Jobs
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-mono">
            {rows.length} Opportunities Displayed
          </span>
          <Link
            href={`/agents?target=${targetCount}&q=${encodeURIComponent(searchParam || q || profile.headline || "Engineer")}`}
            className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <span>Apply to {targetCount.toLocaleString()} Target Jobs with Agents</span>
          </Link>
        </div>
      </div>

      {/* Search & Customization Filters with Multi-Stage Progress Bar */}
      <JobFiltersBar
        query={q}
        onQueryChange={setQ}
        onSearchSubmit={handleSearchSubmit}
        remote={remote}
        onRemoteChange={setRemote}
        employmentType={employmentType}
        onEmploymentTypeChange={setEmploymentType}
        experienceLevel={experienceLevel}
        onExperienceLevelChange={setExperienceLevel}
        domain={domainFilter}
        onDomainChange={setDomainFilter}
        sort={sort}
        onSortChange={setSort}
        isLoading={isLoading}
      />

      {/* Import Modal */}
      <ImportJobModal
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        onImportSuccess={() => refetch()}
        profile={profile}
      />

      {error && <ErrorBox msg={(error as Error).message} retry={() => refetch()} />}

      {!profile.skills.length && (
        <div className="card p-3 mb-4 bg-bg2/40 border border-line flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted">
            Tip: Add skills in your Career Profile to calculate personalized compatibility scores. All openings below remain fully browsable.
          </span>
          <Link href="/profile" className="underline font-medium text-ink">
            Add Skills to Career DNA →
          </Link>
        </div>
      )}

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
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          className="underline-offset-2 hover:underline text-fg font-semibold"
                          href={`/apply/${j.id}`}
                        >
                          {j.title}
                        </Link>
                        {j.employment_type && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 bg-bg2 border border-line rounded text-ink">
                            {j.employment_type}
                          </span>
                        )}
                        {j.years !== undefined && j.years > 0 && (
                          <span className="text-[10px] font-mono text-muted">
                            {j.years}+ yrs
                          </span>
                        )}
                      </div>
                      {existing && (
                        <div className="font-mono text-[10px] text-neutral-500 mt-0.5">
                          {isRejected ? "· Previously Rejected (Can Re-Apply)" : `· Ongoing: ${existing.status}`}
                        </div>
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
    </>
  );
}
