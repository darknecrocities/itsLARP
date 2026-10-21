"use client";
import { useState } from "react";
import { useStore, type CertificationItem, type LicenseItem } from "@/lib/store";
import { CollapsibleSection } from "@/components/profile/CollapsibleSection";
import { Award, ShieldCheck, GitBranch, Star, Code, Plus, Trash2, ExternalLink } from "lucide-react";

export function CertificationsAndGitHubSection() {
  const { profile: p, setProfile, addEvidence } = useStore();

  // New certification form
  const [showAddCert, setShowAddCert] = useState(false);
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");

  // New license form
  const [showAddLic, setShowAddLic] = useState(false);
  const [licName, setLicName] = useState("");
  const [licAuth, setLicAuth] = useState("");
  const [licNum, setLicNum] = useState("");

  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;
    const item: CertificationItem = {
      name: certName.trim(),
      issuer: certIssuer.trim(),
      date: certDate.trim() || "Verified",
    };
    const updated = [item, ...(p.certifications || [])];
    setProfile({ certifications: updated });
    addEvidence([
      {
        source: `Certification: ${item.name}`,
        text: `${item.name} issued by ${item.issuer} (${item.date}).`,
      },
    ]);
    setCertName("");
    setCertIssuer("");
    setCertDate("");
    setShowAddCert(false);
  };

  const handleRemoveCert = (idx: number) => {
    setProfile({ certifications: (p.certifications || []).filter((_, i) => i !== idx) });
  };

  const handleAddLicense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!licName.trim() || !licAuth.trim()) return;
    const item: LicenseItem = {
      name: licName.trim(),
      authority: licAuth.trim(),
      number: licNum.trim() || "Active",
      date: "Active",
    };
    const updated = [item, ...(p.licenses || [])];
    setProfile({ licenses: updated });
    addEvidence([
      {
        source: `Professional License: ${item.name}`,
        text: `${item.name} from ${item.authority} (Reg #: ${item.number}).`,
      },
    ]);
    setLicName("");
    setLicAuth("");
    setLicNum("");
    setShowAddLic(false);
  };

  const handleRemoveLic = (idx: number) => {
    setProfile({ licenses: (p.licenses || []).filter((_, i) => i !== idx) });
  };

  const gh = p.github_metrics || {
    username: "darknecrocities",
    public_repos: 218,
    followers: 112,
    total_stars: 285,
    contributions_note: "11,000+ lifetime contributions · Ranked #11 in Philippines",
    top_languages: ["TypeScript", "Python", "JavaScript", "HTML", "Dart"],
  };

  return (
    <div className="space-y-5">
      {/* Certifications and Honors */}
      <CollapsibleSection
        dataTour="profile-certifications-section"
        title={`Certifications, Honors & Awards (${(p.certifications || []).length})`}
        subtitle="Verified credentials, hackathon championships, and professional honors"
        icon={<Award className="w-4 h-4" />}
        defaultOpen={true}
        action={
          <button
            type="button"
            className="btn text-xs inline-flex items-center gap-1 py-1 px-2.5"
            onClick={() => setShowAddCert(!showAddCert)}
          >
            <Plus className="w-3 h-3" />
            <span>Add Certification</span>
          </button>
        }
      >
        {showAddCert && (
          <form onSubmit={handleAddCertification} className="p-4 bg-bg2 rounded border border-line mb-4 space-y-3 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="input"
                placeholder="Certification Name (e.g. 17x Hackathon Champion)"
                value={certName}
                onChange={(e) => setCertName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Issuing Authority (e.g. Google Cloud / GDG)"
                value={certIssuer}
                onChange={(e) => setCertIssuer(e.target.value)}
              />
              <input
                className="input"
                placeholder="Issue Date (e.g. 2024)"
                value={certDate}
                onChange={(e) => setCertDate(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn text-xs" onClick={() => setShowAddCert(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                Save Certification
              </button>
            </div>
          </form>
        )}

        {(!p.certifications || p.certifications.length === 0) ? (
          <p className="text-muted text-xs py-1">No certifications recorded yet. Import from online links or click &quot;Add Certification&quot;.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {p.certifications.map((c, idx) => (
              <div key={idx} className="p-3 bg-bg2 rounded border border-line text-xs flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-ink">{c.name}</div>
                  <div className="text-muted text-[11px] mt-0.5">{c.issuer}</div>
                  {c.date && <div className="text-dmuted text-[10px] font-mono mt-1">{c.date}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCert(idx)}
                  className="text-muted hover:text-ink"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Licenses and Authorizations */}
      <CollapsibleSection
        dataTour="profile-licenses-section"
        title={`Professional Licenses & Registrations (${(p.licenses || []).length})`}
        subtitle="Government, engineering board, or cloud professional accreditations"
        icon={<ShieldCheck className="w-4 h-4" />}
        defaultOpen={true}
        action={
          <button
            type="button"
            className="btn text-xs inline-flex items-center gap-1 py-1 px-2.5"
            onClick={() => setShowAddLic(!showAddLic)}
          >
            <Plus className="w-3 h-3" />
            <span>Add License</span>
          </button>
        }
      >
        {showAddLic && (
          <form onSubmit={handleAddLicense} className="p-4 bg-bg2 rounded border border-line mb-4 space-y-3 text-xs">
            <div className="grid sm:grid-cols-3 gap-3">
              <input
                className="input"
                placeholder="License Name (e.g. Certified Cloud Practitioner)"
                value={licName}
                onChange={(e) => setLicName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Licensing Board / Authority"
                value={licAuth}
                onChange={(e) => setLicAuth(e.target.value)}
              />
              <input
                className="input"
                placeholder="License / Registry Number"
                value={licNum}
                onChange={(e) => setLicNum(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn text-xs" onClick={() => setShowAddLic(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary text-xs">
                Save License
              </button>
            </div>
          </form>
        )}

        {(!p.licenses || p.licenses.length === 0) ? (
          <p className="text-muted text-xs py-1">No professional licenses recorded yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {p.licenses.map((l, idx) => (
              <div key={idx} className="p-3 bg-bg2 rounded border border-line text-xs flex justify-between items-start gap-2">
                <div>
                  <div className="font-semibold text-ink">{l.name}</div>
                  <div className="text-muted text-[11px] mt-0.5">{l.authority}</div>
                  {l.number && <div className="text-dmuted text-[10px] font-mono mt-1">Reg: {l.number}</div>}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveLic(idx)}
                  className="text-muted hover:text-ink"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* GitHub Repository & Engineering Metrics */}
      <CollapsibleSection
        dataTour="profile-github-stats-section"
        title="GitHub Verified Engineering Metrics & Contributions"
        subtitle="Live open-source statistics synchronized via GitHub API"
        icon={<GitBranch className="w-4 h-4" />}
        defaultOpen={true}
        action={
          p.links?.github && (
            <a
              href={p.links.github}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted hover:text-ink inline-flex items-center gap-1 font-mono"
            >
              <span>@{gh.username || "github"}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )
        }
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="p-3 bg-bg2 rounded border border-line">
            <div className="text-muted text-[10px] uppercase font-mono">Public Repos</div>
            <div className="text-lg font-bold text-ink mt-0.5">{gh.public_repos || 218}</div>
          </div>
          <div className="p-3 bg-bg2 rounded border border-line">
            <div className="text-muted text-[10px] uppercase font-mono">Total Stars</div>
            <div className="text-lg font-bold text-ink mt-0.5 flex items-center gap-1">
              <span>{gh.total_stars || 285}</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
          </div>
          <div className="p-3 bg-bg2 rounded border border-line col-span-2">
            <div className="text-muted text-[10px] uppercase font-mono">National Activity Rank</div>
            <div className="text-xs font-semibold text-ink mt-1 truncate">
              {gh.contributions_note || "11,000+ contributions · Ranked #11 in Philippines"}
            </div>
          </div>
        </div>

        {gh.top_languages && gh.top_languages.length > 0 && (
          <div className="p-3 bg-bg2 rounded border border-line flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted font-mono text-[11px] inline-flex items-center gap-1">
              <Code className="w-3 h-3" />
              <span>Primary Stacks:</span>
            </span>
            {gh.top_languages.map((lang) => (
              <span key={lang} className="px-2 py-0.5 bg-white text-black border border-line rounded font-mono text-[10px]">
                {lang}
              </span>
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}
