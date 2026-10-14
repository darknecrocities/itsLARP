"use client";
import React, { useEffect, useState } from "react";
import { api, apiGet } from "@/lib/api";
import { useStore } from "@/lib/store";
import { Sparkles, Check, ArrowRight, Zap, RefreshCw } from "lucide-react";

type RecommendationItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: string;
  changes: Record<string, any>;
  applied?: boolean;
};

export function LLMRecommendationsCard() {
  const { profile } = useStore();
  const [recs, setRecs] = useState<RecommendationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<string | null>(null);
  const [applyingAll, setApplyingAll] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    try {
      const data = await api<RecommendationItem[]>("/ai/recommendations", { profile });
      if (Array.isArray(data)) {
        setRecs(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile.name || profile.skills.length > 0) {
      fetchRecs();
    }
  }, [profile.headline, profile.years, profile.skills.length]);

  const handleApply = async (rec: RecommendationItem) => {
    setApplyingId(rec.id);
    try {
      const res = await api<{ ok: boolean; profile: any }>("/ai/recommendations/apply", {
        rec_changes: rec.changes,
        profile,
      });
      if (res.ok) {
        setRecs((prev) =>
          prev.map((r) => (r.id === rec.id ? { ...r, applied: true } : r))
        );
        // Refresh profile state from backend
        const pRes = await apiGet<{ profile: any }>("/profile");
        if (pRes?.profile) {
          useStore.getState().setProfile(pRes.profile);
        }
      }
    } catch (e) {
      console.error("Failed to apply recommendation:", e);
    } finally {
      setApplyingId(null);
    }
  };

  const handleApplyAll = async () => {
    setApplyingAll(true);
    for (const rec of recs.filter((r) => !r.applied)) {
      await handleApply(rec);
    }
    setApplyingAll(false);
  };

  if (!recs.length && !loading) {
    return null;
  }

  const unappliedCount = recs.filter((r) => !r.applied).length;

  return (
    <div className="card p-6 bg-bg border-2 border-black/80 space-y-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-ink" />
          <h2 className="text-base font-semibold text-ink">
            AI Strategy Recommendations
          </h2>
          {unappliedCount > 0 && (
            <span className="text-[10px] font-mono px-2 py-0.5 bg-black text-white rounded font-medium">
              {unappliedCount} Available
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unappliedCount > 1 && (
            <button
              onClick={handleApplyAll}
              disabled={applyingAll}
              className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              {applyingAll ? "Applying All..." : `Auto-Apply All (${unappliedCount})`}
            </button>
          )}
          <button
            onClick={fetchRecs}
            disabled={loading}
            className="btn text-xs py-1 px-2.5 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {recs.map((rec) => (
          <div
            key={rec.id}
            className={`p-4 rounded border transition-all ${
              rec.applied
                ? "bg-bg2/40 border-line text-muted"
                : "bg-bg2/80 border-line hover:border-black"
            }`}
          >
            <div className="flex justify-between items-start gap-2 mb-1">
              <span className="text-xs font-bold text-ink leading-snug">
                {rec.title}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-bg border border-line rounded text-ink shrink-0">
                {rec.impact}
              </span>
            </div>
            <p className="text-xs text-dmuted leading-relaxed mb-3">
              {rec.description}
            </p>

            <div className="flex justify-end">
              {rec.applied ? (
                <span className="text-xs font-mono text-ok font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Applied to Career DNA
                </span>
              ) : (
                <button
                  onClick={() => handleApply(rec)}
                  disabled={applyingId === rec.id}
                  className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5 font-mono"
                >
                  {applyingId === rec.id ? (
                    "Applying..."
                  ) : (
                    <>
                      Auto-Apply <ArrowRight className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
