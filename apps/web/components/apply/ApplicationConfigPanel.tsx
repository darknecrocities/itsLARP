"use client";
import { useState } from "react";
import { useStore, DEFAULT_APP_CONFIG, ResumeFormatKey } from "../../lib/store";

const FORMAT_OPTIONS: { key: ResumeFormatKey; label: string; desc: string }[] = [
  { key: "apa_7th", label: "APA 7th Edition", desc: "Academic & Research CV with running head and formal software citations" },
  { key: "harvard_executive", label: "Harvard Executive", desc: "Reverse-chronological single-column executive layout" },
  { key: "silicon_valley_modern", label: "Silicon Valley Modern", desc: "Impact-first engineering format highlighting stack and GitHub" },
  { key: "ieee_engineering", label: "IEEE Engineering", desc: "Numbered sections (I-V) for systems & R&D engineering" },
  { key: "ats_strict", label: "ATS Strict Parser-Safe", desc: "Standard ASCII headings optimized for Workday, Greenhouse & Lever" },
];

interface ApplicationConfigPanelProps {
  compact?: boolean;
  onApplyToAgents?: () => void;
}

export function ApplicationConfigPanel({ compact = false, onApplyToAgents }: ApplicationConfigPanelProps) {
  const { appConfig, setAppConfig } = useStore();
  const [tab, setTab] = useState<"resume" | "screening" | "guardrails" | "autonomy">("resume");

  return (
    <div className="border border-neutral-300 bg-white rounded-lg p-5 space-y-4 text-black">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 pb-3">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            20-PARAMETER APPLICATION & BOT TAILORING CONFIGURATION
          </div>
          <h3 className="text-sm font-semibold text-black mt-0.5">
            Resume Design Format, Per-Job Bot Adjustment & Autonomous Apply Guardrails
          </h3>
        </div>
        <button
          type="button"
          onClick={() => setAppConfig(DEFAULT_APP_CONFIG)}
          className="px-2.5 py-1 text-[11px] font-mono border border-neutral-300 bg-white text-black hover:bg-neutral-100 rounded"
        >
          Reset 20 Defaults
        </button>
      </div>

      {/* Category Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded border border-neutral-200">
        {[
          { id: "resume", label: "1-7. Resume & Tailoring" },
          { id: "screening", label: "8-14. Cover & Screening" },
          { id: "guardrails", label: "15-18. Job Guardrails" },
          { id: "autonomy", label: "19-20. Bot Autonomy" },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id as any)}
            className={`px-3 py-1.5 text-xs font-medium rounded transition ${
              tab === t.id ? "bg-black text-white" : "bg-transparent text-neutral-700 hover:bg-neutral-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Features 1-7 (Resume Design & Per-Job Bot Tailoring) */}
      {tab === "resume" && (
        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1.5">
              [01] Resume Format Template (Constructed by Bots per Job)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {FORMAT_OPTIONS.map((f) => {
                const active = appConfig.resumeFormat === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setAppConfig({ resumeFormat: f.key })}
                    className={`text-left p-2.5 rounded border transition ${
                      active
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-neutral-300 hover:border-black"
                    }`}
                  >
                    <div className="text-xs font-semibold">{f.label}</div>
                    {!compact && (
                      <div className={`text-[10px] mt-1 leading-snug ${active ? "text-neutral-300" : "text-neutral-500"}`}>
                        {f.desc}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [02] Bullet Rewrite Aggressiveness
              </label>
              <select
                value={appConfig.bulletRewriteAggressiveness}
                onChange={(e) => setAppConfig({ bulletRewriteAggressiveness: e.target.value as any })}
                className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
              >
                <option value="conservative">Conservative (Minimal edits)</option>
                <option value="balanced">Balanced (Job-aligned phrasing)</option>
                <option value="aggressive">Aggressive (Deep JD alignment)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [03] Skill Grouping Mode
              </label>
              <select
                value={appConfig.skillGroupingMode}
                onChange={(e) => setAppConfig({ skillGroupingMode: e.target.value as any })}
                className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
              >
                <option value="relevance_first">Relevance-First (Matched JD skills first)</option>
                <option value="categorized">Categorized (Languages / AI / Cloud)</option>
                <option value="flat">Flat Comma-Separated</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [04] Project Highlight Count ({appConfig.projectHighlightCount})
              </label>
              <input
                type="range"
                min={1}
                max={6}
                value={appConfig.projectHighlightCount}
                onChange={(e) => setAppConfig({ projectHighlightCount: Number(e.target.value) })}
                className="w-full accent-black mt-1.5"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [05] Quantifiable Metrics Emphasis
              </label>
              <button
                type="button"
                onClick={() => setAppConfig({ quantifiableMetricsEmphasis: !appConfig.quantifiableMetricsEmphasis })}
                className={`w-full px-3 py-2 text-xs font-medium rounded border text-left ${
                  appConfig.quantifiableMetricsEmphasis
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-neutral-300"
                }`}
              >
                {appConfig.quantifiableMetricsEmphasis ? "Enabled: Highlight Verified Metrics" : "Disabled: Standard Descriptions"}
              </button>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [06] Keyword Mirroring Level
              </label>
              <select
                value={appConfig.keywordMirroringLevel}
                onChange={(e) => setAppConfig({ keywordMirroringLevel: e.target.value as any })}
                className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
              >
                <option value="exact">Exact JD Keyword Mirroring</option>
                <option value="semantic">Semantic Equivalence</option>
                <option value="minimal">Minimal Mirroring</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
                [07] Resume Page Density
              </label>
              <select
                value={appConfig.pageDensity}
                onChange={(e) => setAppConfig({ pageDensity: e.target.value as any })}
                className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
              >
                <option value="comfortable">Comfortable (11pt / 1.6 spacing)</option>
                <option value="compact">Compact 1-Page Fit (10pt / 1.4 spacing)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Features 8-14 (Cover Letter & Screening Defaults) */}
      {tab === "screening" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [08] Cover Letter Tone
            </label>
            <select
              value={appConfig.coverLetterTone}
              onChange={(e) => setAppConfig({ coverLetterTone: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="direct_technical">Direct Technical & Engineering</option>
              <option value="formal">Formal Corporate</option>
              <option value="executive">Executive Leadership</option>
              <option value="none">None (Resume Only)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [09] Cover Letter Max Words ({appConfig.coverLetterMaxWords}w)
            </label>
            <input
              type="range"
              min={100}
              max={400}
              step={25}
              value={appConfig.coverLetterMaxWords}
              onChange={(e) => setAppConfig({ coverLetterMaxWords: Number(e.target.value) })}
              className="w-full accent-black mt-1.5"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [10] Compensation Strategy
            </label>
            <select
              value={appConfig.compensationStrategy}
              onChange={(e) => setAppConfig({ compensationStrategy: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="market_aligned">Market-Aligned Competitive</option>
              <option value="explicit_floor">Explicit Base Salary Floor</option>
              <option value="negotiable">Open / Negotiable Total Comp</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [11] Minimum Base Salary (USD)
            </label>
            <input
              type="number"
              step={5000}
              value={appConfig.minimumBaseSalary}
              onChange={(e) => setAppConfig({ minimumBaseSalary: Number(e.target.value) || 0 })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [12] Work Authorization Status
            </label>
            <select
              value={appConfig.workAuthorization}
              onChange={(e) => setAppConfig({ workAuthorization: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="authorized_no_sponsor">Authorized (No Sponsorship Needed)</option>
              <option value="citizen_permanent">Citizen / Permanent Resident</option>
              <option value="global_contractor">Global B2B / EOR Contractor</option>
              <option value="requires_sponsorship">Requires Visa Sponsorship</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [13] Notice Period / Availability
            </label>
            <select
              value={appConfig.noticePeriod}
              onChange={(e) => setAppConfig({ noticePeriod: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="immediate">Immediate Start</option>
              <option value="2_weeks">2 Weeks Standard Notice</option>
              <option value="30_days">30 Days Notice</option>
              <option value="flexible">Flexible / Negotiable</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [14] Relocation Willingness
            </label>
            <select
              value={appConfig.relocationWillingness}
              onChange={(e) => setAppConfig({ relocationWillingness: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="no_remote_only">Remote Only (No Relocation)</option>
              <option value="open_with_assistance">Open with Relocation Package</option>
              <option value="open_self_funded">Open to Relocation</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 3: Features 15-18 (Job Filtering & Guardrails) */}
      {tab === "guardrails" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [15] Minimum Match Score Threshold ({appConfig.minMatchThreshold}%)
            </label>
            <input
              type="range"
              min={40}
              max={95}
              step={5}
              value={appConfig.minMatchThreshold}
              onChange={(e) => setAppConfig({ minMatchThreshold: Number(e.target.value) })}
              className="w-full accent-black mt-1.5"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [16] Remote / Workplace Preference
            </label>
            <select
              value={appConfig.remoteWorkplacePreference}
              onChange={(e) => setAppConfig({ remoteWorkplacePreference: e.target.value as any })}
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            >
              <option value="remote_only">Strict Remote Only</option>
              <option value="remote_preferred">Remote Preferred (Hybrid OK)</option>
              <option value="hybrid_ok">Hybrid / Flexible</option>
              <option value="onsite_ok">All Workplaces (Onsite + Remote)</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [17] Company Exclusion Blacklist (Comma-Separated)
            </label>
            <input
              value={appConfig.companyBlacklist}
              onChange={(e) => setAppConfig({ companyBlacklist: e.target.value })}
              placeholder="e.g. Stealth Corp, LegacyAgency"
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [18] Maximum Daily Applications Cap (1 - 50,000)
            </label>
            <input
              type="number"
              min={1}
              max={50000}
              value={appConfig.maxDailyApplications}
              onChange={(e) =>
                setAppConfig({ maxDailyApplications: Math.max(1, Math.min(50000, Number(e.target.value) || 50)) })
              }
              className="w-full px-2.5 py-2 text-xs border border-neutral-300 rounded bg-white text-black"
            />
          </div>
        </div>
      )}

      {/* TAB 4: Features 19-20 (Autonomous Agent Behavior) */}
      {tab === "autonomy" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [19] Auto-Approve Match Threshold ({appConfig.autoApproveThreshold}%)
            </label>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={appConfig.autoApproveThreshold}
              onChange={(e) => setAppConfig({ autoApproveThreshold: Number(e.target.value) })}
              className="w-full accent-black mt-1.5"
            />
            <p className="text-[11px] text-neutral-500 mt-1">
              Jobs scoring at or above {appConfig.autoApproveThreshold}% with 0 unverified claims are marked APPLIED automatically by parallel bots.
            </p>
          </div>

          <div>
            <label className="text-[11px] font-mono uppercase text-neutral-700 block mb-1">
              [20] Human-in-the-Loop Execution Gate
            </label>
            <button
              type="button"
              onClick={() => setAppConfig({ humanInTheLoopPause: !appConfig.humanInTheLoopPause })}
              className={`w-full px-3 py-2.5 text-xs font-semibold rounded border text-left transition ${
                appConfig.humanInTheLoopPause
                  ? "bg-white text-black border-black"
                  : "bg-black text-white border-black"
              }`}
            >
              {appConfig.humanInTheLoopPause
                ? "Manual Gate Active: Stage all tailored resumes as READY_FOR_REVIEW"
                : "Autonomous Parallel Apply: Auto-submit verified packages above threshold"}
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="pt-3 border-t border-neutral-200 flex flex-wrap items-center justify-between gap-3">
        <div className="text-[11px] text-neutral-500 font-mono">
          All 20 parameters are injected into discovery, tailoring, and application bots.
        </div>
        {onApplyToAgents && (
          <button
            type="button"
            onClick={onApplyToAgents}
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded transition"
          >
            Apply to Auto-Apply Agents
          </button>
        )}
      </div>
    </div>
  );
}
