"use client";
import React, { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

type JobFiltersBarProps = {
  query: string;
  onQueryChange: (q: string) => void;
  onSearchSubmit: (q: string) => void;
  remote: boolean;
  onRemoteChange: (r: boolean) => void;
  employmentType: string;
  onEmploymentTypeChange: (t: string) => void;
  experienceLevel: string;
  onExperienceLevelChange: (lvl: string) => void;
  domain: string;
  onDomainChange: (d: string) => void;
  sort: "match" | "company";
  onSortChange: (s: "match" | "company") => void;
  isLoading: boolean;
};

const STAGES = [
  "Connecting to live job feeds across LinkedIn, Indeed & Glassdoor...",
  "Applying experience years and employment type constraints...",
  "Evaluating semantic fit against verified Career DNA...",
  "Synthesizing authentic job listings with direct platform links...",
];

export function JobFiltersBar({
  query,
  onQueryChange,
  onSearchSubmit,
  remote,
  onRemoteChange,
  employmentType,
  onEmploymentTypeChange,
  experienceLevel,
  onExperienceLevelChange,
  domain,
  onDomainChange,
  sort,
  onSortChange,
  isLoading,
}: JobFiltersBarProps) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setStageIdx(0);
      return;
    }
    const timer = setInterval(() => {
      setStageIdx((prev) => (prev + 1) % STAGES.length);
    }, 700);
    return () => clearInterval(timer);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit(query);
  };

  return (
    <div className="space-y-3 mb-6">
      <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2.5">
        <div className="flex gap-1.5 flex-1 min-w-[260px] max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="job-query"
              className="input pl-8 py-1.5 text-xs w-full"
              placeholder="Search any role (e.g. Project Manager, Flight Attendant, AI Engineer)"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
          <button type="submit" className="btn text-xs py-1.5 px-3 shrink-0" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Search"}
          </button>
        </div>

        {/* Employment Type Selector */}
        <select
          id="emp-type"
          className="input text-xs py-1.5 px-2.5 max-w-[130px] font-mono"
          value={employmentType}
          onChange={(e) => onEmploymentTypeChange(e.target.value)}
          title="Filter by Employment Type"
        >
          <option value="all">All Types</option>
          <option value="Full-time">Full-time</option>
          <option value="Part-time">Part-time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>

        {/* Experience Level Selector */}
        <select
          id="exp-level"
          className="input text-xs py-1.5 px-2.5 max-w-[140px] font-mono"
          value={experienceLevel}
          onChange={(e) => onExperienceLevelChange(e.target.value)}
          title="Filter by Experience Level"
        >
          <option value="all">Any Experience</option>
          <option value="entry">Entry / Intern (0-1 yrs)</option>
          <option value="mid">Mid-Level (2-4 yrs)</option>
          <option value="senior">Senior (5+ yrs)</option>
          <option value="lead">Lead / Exec (8+ yrs)</option>
        </select>

        {/* Domain Selector */}
        <select
          id="domain"
          className="input text-xs py-1.5 px-2.5 max-w-[120px] font-mono"
          value={domain}
          onChange={(e) => onDomainChange(e.target.value)}
          title="Filter by Domain"
        >
          <option value="all">All Domains</option>
          <option value="tech">Tech / Eng</option>
          <option value="ai">AI / ML</option>
          <option value="web">Web</option>
          <option value="data">Data</option>
          <option value="finance">Finance</option>
          <option value="healthcare">Health</option>
          <option value="aviation">Aviation</option>
          <option value="sales">Sales</option>
        </select>

        {/* Sort Selector */}
        <select
          id="sort"
          className="input text-xs py-1.5 px-2.5 max-w-[125px] font-mono"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as "match" | "company")}
          title="Sort Results"
        >
          <option value="match">Best match</option>
          <option value="company">Company</option>
        </select>

        {/* Remote Checkbox */}
        <label className="flex items-center gap-1.5 text-xs text-muted cursor-pointer select-none font-mono ml-1">
          <input
            type="checkbox"
            checked={remote}
            onChange={(e) => onRemoteChange(e.target.checked)}
            className="rounded border-line"
          />
          Remote only
        </label>
      </form>

      {/* Multi-Stage Loading Progress Bar */}
      {isLoading && (
        <div className="card p-3 bg-bg2/60 border border-line animate-in fade-in duration-200">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-ink font-semibold flex items-center gap-1.5">
              <Loader2 className="w-3 h-3 animate-spin" />
              Searching Live Opportunities
            </span>
            <span className="text-muted text-[11px]">
              Step {stageIdx + 1} of {STAGES.length}
            </span>
          </div>
          <div className="w-full bg-bg rounded-full h-1.5 border border-line overflow-hidden mb-1.5">
            <div
              className="bg-black dark:bg-white h-full transition-all duration-300"
              style={{ width: `${((stageIdx + 1) / STAGES.length) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-muted font-mono truncate">
            {STAGES[stageIdx]}
          </p>
        </div>
      )}
    </div>
  );
}
