"use client";
import React, { useState } from "react";
import { X, Zap, Database, RefreshCw, CheckCircle, ExternalLink } from "lucide-react";
import { api } from "@/lib/api";
import { ErrorBox } from "./ui";

interface NotionDatabaseItem {
  id: string;
  title: string;
  url: string;
  last_edited_time?: string;
}

interface NotionSyncModalProps {
  show: boolean;
  onClose: () => void;
  onSuccess: (data: { database_id: string; database_name: string; database_url: string }) => void;
}

export function NotionSyncModal({ show, onClose, onSuccess }: NotionSyncModalProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [databases, setDatabases] = useState<NotionDatabaseItem[]>([]);
  const [selectedDbId, setSelectedDbId] = useState<string>("");
  const [workspace, setWorkspace] = useState("");
  const [step, setStep] = useState<"token" | "choose">("token");

  if (!show) return null;

  const handleScanWorkspace = async () => {
    if (!token.trim()) {
      setError("Please enter your Notion Integration Token.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // 1. Test token
      const testRes = await api<{ connected: boolean; workspace?: string; error?: string }>(
        "/integrations/notion/test",
        { token: token.trim() }
      );
      if (!testRes.connected) {
        throw new Error(testRes.error || "Notion rejected this token. Check integration permissions.");
      }
      setWorkspace(testRes.workspace || "Notion Workspace");

      // 2. Scan existing databases
      const dbRes = await api<{ ok: boolean; databases: NotionDatabaseItem[] }>(
        "/integrations/notion/databases",
        { token: token.trim() }
      );
      setDatabases(dbRes.databases || []);
      if (dbRes.databases?.length > 0) {
        setSelectedDbId(dbRes.databases[0].id);
      }
      setStep("choose");
    } catch (e: any) {
      setError(e.message || "Failed to connect to Notion.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnectSelected = async () => {
    if (!selectedDbId) {
      setError("Please select a Notion database.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        ok: boolean;
        database_id: string;
        database_name: string;
        database_url: string;
      }>("/integrations/notion/connect", {
        token: token.trim(),
        database_id: selectedDbId,
        create_new: false,
      });
      if (res.ok) {
        onSuccess(res);
        onClose();
      }
    } catch (e: any) {
      setError(e.message || "Failed to link selected Notion database.");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCreate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{
        ok: boolean;
        database_id: string;
        database_name: string;
        database_url: string;
      }>("/integrations/notion/connect", {
        token: token.trim(),
        create_new: true,
      });
      if (res.ok) {
        onSuccess(res);
        onClose();
      }
    } catch (e: any) {
      setError(e.message || "Failed to auto-create Notion database. Ensure at least one page is shared with the bot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="card max-w-lg w-full p-6 bg-white text-black border border-neutral-300 shadow-2xl rise font-sans">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-black" />
            <h3 className="text-lg font-bold">Link Real Notion Database</h3>
          </div>
          <button className="text-neutral-500 hover:text-black p-1" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-neutral-600 mb-4 leading-relaxed">
          Connect your Notion workspace for live two-way synchronization. Applications, company names, match scores, and interview statuses stay synchronized with zero manual copying.
        </p>

        {step === "token" ? (
          <div className="space-y-4 font-mono text-xs">
            <div>
              <label htmlFor="n-token" className="label-xs block mb-1 text-black font-semibold">
                Notion Integration Token
              </label>
              <input
                id="n-token"
                type="password"
                className="input text-xs w-full font-mono bg-neutral-50 border-neutral-300"
                placeholder="secret_... or ntn_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <span className="text-[11px] text-neutral-500 font-sans mt-1 block">
                Create an internal integration in Notion at <span className="font-mono">notion.so/profile/integrations</span> and share your workspace page with it.
              </span>
            </div>

            {error && <ErrorBox msg={error} />}

            <div className="flex justify-end gap-2 pt-2">
              <button className="btn text-xs" onClick={onClose}>
                Cancel
              </button>
              <button
                className="btn btn-primary text-xs flex items-center gap-1.5"
                disabled={loading || !token.trim()}
                onClick={handleScanWorkspace}
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                <span>{loading ? "Scanning Workspace..." : "Connect & Scan Databases"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 font-mono text-xs">
            <div className="p-3 bg-neutral-100 rounded border border-neutral-300 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">Connected Workspace</div>
                <div className="font-bold text-sm text-black">{workspace}</div>
              </div>
              <button
                className="text-[11px] text-neutral-600 underline font-sans hover:text-black"
                onClick={() => setStep("token")}
              >
                Change Token
              </button>
            </div>

            {databases.length > 0 ? (
              <div>
                <label className="label-xs block mb-1 text-black font-semibold font-sans">
                  Choose an Existing Database ({databases.length} Found)
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {databases.map((db) => (
                    <label
                      key={db.id}
                      className={`flex items-start justify-between p-3 rounded border cursor-pointer transition-all ${
                        selectedDbId === db.id
                          ? "border-black bg-neutral-100 font-bold"
                          : "border-neutral-200 hover:border-neutral-400 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="notion_db"
                          value={db.id}
                          checked={selectedDbId === db.id}
                          onChange={() => setSelectedDbId(db.id)}
                          className="mt-0.5"
                        />
                        <div>
                          <div className="text-black text-xs font-semibold">{db.title}</div>
                          <div className="text-[10px] text-neutral-500">{db.id}</div>
                        </div>
                      </div>
                      {db.url && (
                        <a
                          href={db.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-400 hover:text-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 text-neutral-600 text-xs font-sans">
                No existing databases were found in your workspace that are shared with this token. You can auto-create a dedicated tracker database below!
              </div>
            )}

            {error && <ErrorBox msg={error} />}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-neutral-200">
              <button
                className="btn text-xs bg-neutral-100 border-neutral-300 hover:border-black"
                disabled={loading}
                onClick={handleAutoCreate}
              >
                {loading ? "Creating..." : "+ Auto-Create Dedicated Database"}
              </button>
              <div className="flex gap-2">
                <button className="btn text-xs" onClick={onClose}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary text-xs flex items-center gap-1.5"
                  disabled={loading || !selectedDbId}
                  onClick={handleConnectSelected}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{loading ? "Connecting..." : "Use Selected Database"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
