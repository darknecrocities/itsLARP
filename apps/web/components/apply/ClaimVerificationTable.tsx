"use client";
import React from "react";
import { Badge } from "@/components/ui";

export interface ClaimItem {
  claim: string;
  source: string | null;
  confidence: number;
  status: string;
}

export interface ClaimVerificationTableProps {
  passed: boolean;
  blocked: number;
  claims: ClaimItem[];
}

export function ClaimVerificationTable({ passed, blocked, claims }: ClaimVerificationTableProps) {
  return (
    <section aria-label="Verification" className="mb-10 card p-5 bg-white text-black border border-neutral-300 font-sans">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold">Evidence Claim Verification</h2>
        {passed ? (
          <Badge tone="ok">PASS · No Hallucinated Claims</Badge>
        ) : (
          <Badge tone="err">{blocked} CLAIMS BLOCKED</Badge>
        )}
      </div>
      <p className="text-xs text-neutral-600 mb-4 font-sans">
        Zero-hallucination verification gate: Every single sentence in your tailored resume and cover letter is verified against your Career DNA evidence before you submit.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead className="label-xs border-b border-neutral-300 bg-neutral-50">
            <tr>
              <th scope="col" className="py-2 px-3">Claim in Application</th>
              <th scope="col" className="px-3">Evidence Source</th>
              <th scope="col" className="px-3">Match Conf.</th>
              <th scope="col" className="px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {claims.slice(0, 10).map((c, i) => (
              <tr key={i} className="hover:bg-neutral-50 transition-colors">
                <td className="py-2.5 px-3 font-mono text-[11px] max-w-sm break-words">{c.claim}</td>
                <td className="px-3 text-neutral-600 text-[11px]">{c.source ?? "No evidence found"}</td>
                <td className="px-3 font-semibold">{Math.round(c.confidence * 100)}%</td>
                <td className="px-3">
                  <Badge tone={c.status === "VERIFIED" ? "ok" : "err"}>
                    {c.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!passed && (
        <p className="text-xs text-warn mt-3 font-sans">
          Blocked claims have insufficient supporting evidence. Please add evidence to your Career DNA or edit the proposal.
        </p>
      )}
    </section>
  );
}
