"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { X, Plus, Target, Briefcase, Calendar, Globe } from "lucide-react";

const WORK_TYPES = [
  { id: "fulltime", label: "Full-Time" },
  { id: "internship", label: "Internship" },
  { id: "parttime", label: "Part-Time" },
  { id: "contract", label: "Contract" },
  { id: "remote", label: "Remote Only" },
];

export function TargetingPreferences() {
  const { profile, setProfile } = useStore();
  const [newRole, setNewRole] = useState("");
  const [newCompany, setNewCompany] = useState("");

  const targetRoles = profile.target_roles || ["all"];
  const targetCompanies = profile.target_companies || ["all"];
  const workTypes = profile.work_types || ["fulltime", "remote"];

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    const r = newRole.trim();
    const current = targetRoles.filter((x) => x.toLowerCase() !== "all");
    if (!current.includes(r)) {
      setProfile({ target_roles: [...current, r] });
    }
    setNewRole("");
  };

  const handleRemoveRole = (role: string) => {
    const updated = targetRoles.filter((r) => r !== role);
    setProfile({ target_roles: updated.length ? updated : ["all"] });
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim()) return;
    const c = newCompany.trim();
    const current = targetCompanies.filter((x) => x.toLowerCase() !== "all");
    if (!current.includes(c)) {
      setProfile({ target_companies: [...current, c] });
    }
    setNewCompany("");
  };

  const handleRemoveCompany = (company: string) => {
    const updated = targetCompanies.filter((c) => c !== company);
    setProfile({ target_companies: updated.length ? updated : ["all"] });
  };

  const toggleWorkType = (id: string) => {
    const exists = workTypes.includes(id);
    const updated = exists ? workTypes.filter((w) => w !== id) : [...workTypes, id];
    setProfile({ work_types: updated.length ? updated : ["fulltime"] });
  };

  return (
    <div className="card p-6 bg-bg border border-line space-y-6">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-ink" />
          <h2 className="text-base font-semibold text-ink">Targeting & Application Scope</h2>
        </div>
        <span className="text-xs font-mono text-muted">
          Active Preferences · Autopilot Guided
        </span>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Target Job Roles */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label-xs flex items-center gap-1.5">
              <Briefcase className="w-3 h-3 text-muted" /> Target Roles
            </label>
            <span className="text-[11px] font-mono text-muted">Default: All Roles</span>
          </div>
          <form onSubmit={handleAddRole} className="flex gap-2 mb-2.5">
            <input
              className="input text-xs py-1"
              placeholder="Add role (e.g. AI Systems Engineer)"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <button type="submit" className="btn text-xs py-1 px-2.5 flex items-center gap-1 shrink-0">
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {targetRoles.map((r) => (
              <span
                key={r}
                className="px-2.5 py-1 bg-bg2 rounded text-xs font-mono border border-line flex items-center gap-1.5"
              >
                {r === "all" ? "All Roles (Global Scope)" : r}
                {r !== "all" && (
                  <button
                    type="button"
                    className="text-muted hover:text-ink text-[11px]"
                    onClick={() => handleRemoveRole(r)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>

        {/* Target Companies */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="label-xs flex items-center gap-1.5">
              <Globe className="w-3 h-3 text-muted" /> Target Companies
            </label>
            <span className="text-[11px] font-mono text-muted">Default: All Companies</span>
          </div>
          <form onSubmit={handleAddCompany} className="flex gap-2 mb-2.5">
            <input
              className="input text-xs py-1"
              placeholder="Add company (e.g. Anthropic, Stripe)"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
            <button type="submit" className="btn text-xs py-1 px-2.5 flex items-center gap-1 shrink-0">
              <Plus className="w-3 h-3" /> Add
            </button>
          </form>
          <div className="flex flex-wrap gap-1.5">
            {targetCompanies.map((c) => (
              <span
                key={c}
                className="px-2.5 py-1 bg-bg2 rounded text-xs font-mono border border-line flex items-center gap-1.5"
              >
                {c === "all" ? "All Companies (Open Whitelist)" : c}
                {c !== "all" && (
                  <button
                    type="button"
                    className="text-muted hover:text-ink text-[11px]"
                    onClick={() => handleRemoveCompany(c)}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-line">
        {/* Years of Experience */}
        <div>
          <label className="label-xs flex items-center gap-1.5 mb-1.5">
            <Calendar className="w-3 h-3 text-muted" /> Verified Professional Experience (Years)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={30}
              className="input text-xs py-1.5 max-w-[120px] font-mono"
              value={profile.years}
              onChange={(e) => setProfile({ years: Math.max(0, +e.target.value) })}
            />
            <span className="text-xs text-muted">
              Matching algorithms use {profile.years} years for minimum required experience scoring.
            </span>
          </div>
        </div>

        {/* Work Types */}
        <div>
          <label className="label-xs block mb-1.5">Employment Type & Work Model</label>
          <div className="flex flex-wrap gap-2">
            {WORK_TYPES.map((wt) => {
              const active = workTypes.includes(wt.id);
              return (
                <button
                  key={wt.id}
                  type="button"
                  onClick={() => toggleWorkType(wt.id)}
                  className={`text-xs px-2.5 py-1 rounded font-mono border transition-all ${
                    active
                      ? "bg-black text-white border-black font-semibold"
                      : "bg-bg2 text-muted border-line hover:border-black"
                  }`}
                >
                  {wt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
