"use client";
import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui";
import { type App } from "@/lib/store";
import { ExternalLink, RotateCcw } from "lucide-react";

interface ApplicationsTableProps {
  rows: App[];
  statuses: string[];
  onStatusChange: (app: App, newStatus: string) => void;
  onReapply: (app: App) => void;
}

export function ApplicationsTable({
  rows,
  statuses,
  onStatusChange,
  onReapply,
}: ApplicationsTableProps) {
  return (
    <div className="overflow-x-auto border border-line rounded" data-tour="apps-table">
      <table className="w-full text-left font-sans text-xs">
        <thead className="label-xs border-b border-line bg-neutral-100 font-mono">
          <tr>
            <th scope="col" className="py-2.5 px-3">Role</th>
            <th scope="col" className="px-3">Company</th>
            <th scope="col" className="px-3">Platform</th>
            <th scope="col" className="px-3">Match</th>
            <th scope="col" className="px-3">Application Status</th>
            <th scope="col" className="px-3">Last Activity</th>
            <th scope="col" className="px-3">Notion</th>
            <th scope="col" className="text-right px-3">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((a, index) => {
            const isFirst = index === 0;
            const isRejected = a.status === "REJECTED" || a.status === "WITHDRAWN";

            return (
              <tr
                key={a.id}
                className={`hover:bg-neutral-50 transition-colors ${
                  isRejected ? "bg-neutral-50/50" : ""
                }`}
              >
                <td className="py-3 px-3 font-semibold">
                  <Link href={`/apply/${a.jobId}`} className="hover:underline">
                    {a.role}
                  </Link>
                  {isRejected && (
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Previous attempt ended ({a.status})
                    </div>
                  )}
                </td>
                <td
                  className="px-3 text-neutral-700 font-medium"
                  {...(isFirst ? { "data-tour": "apps-row-company" } : {})}
                >
                  {a.company}
                </td>
                <td className="px-3 font-mono text-[11px] text-neutral-500">
                  {a.platform || "Direct"}
                </td>
                <td className="px-3">
                  <Badge tone={a.match >= 80 ? "ok" : a.match >= 60 ? "n" : "warn"}>
                    {a.match}%
                  </Badge>
                </td>
                <td
                  className="px-3"
                  {...(isFirst ? { "data-tour": "apps-status-badge" } : {})}
                >
                  <select
                    className="input !w-auto text-xs py-1 font-mono"
                    value={a.status}
                    onChange={(e) => onStatusChange(a, e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 text-neutral-500 text-[11px] max-w-xs">
                  <div className="truncate">{a.events?.[0]?.text || "Recorded"}</div>
                  {a.events?.[0]?.at && (
                    <div className="text-[10px] text-neutral-400 font-mono">
                      {new Date(a.events[0].at).toLocaleDateString()}
                    </div>
                  )}
                </td>
                <td className="px-3">
                  {a.notionPageId ? (
                    <a
                      href={`https://notion.so/${a.notionPageId.replace(/-/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-600 hover:text-black underline"
                    >
                      <span>Synced</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ) : (
                    <span className="text-neutral-400 font-mono text-[11px]">—</span>
                  )}
                </td>
                <td className="text-right px-3 py-3">
                  <div className="inline-flex items-center gap-1.5">
                    {isRejected && (
                      <button
                        className="btn text-xs py-1 px-2.5 bg-black text-white hover:bg-neutral-800 flex items-center gap-1 font-mono"
                        onClick={() => onReapply(a)}
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Re-Apply</span>
                      </button>
                    )}
                    <a
                      {...(isFirst ? { "data-tour": "apps-proof-link" } : {})}
                      href={a.screenshotUrl || `http://localhost:8000/applications/${a.id}/screenshot`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn text-xs py-1 px-2 border border-neutral-300 hover:border-black font-mono text-neutral-600 hover:text-black"
                      title="View Pre-Submission Filled Form Proof"
                    >
                      Proof
                    </a>
                    <Link
                      {...(isFirst ? { "data-tour": "apps-studio-link" } : {})}
                      href={`/apply/${a.jobId}`}
                      className="btn text-xs py-1 px-2.5 border border-neutral-300 hover:border-black font-mono"
                    >
                      Studio
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
