"use client";
import React, { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/api";
import type { Job } from "@/lib/data";

interface ImportJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
  profile: any;
}

export function ImportJobModal({
  isOpen,
  onClose,
  onImportSuccess,
  profile,
}: ImportJobModalProps) {
  const [importUrl, setImportUrl] = useState("");
  const [importTitle, setImportTitle] = useState("");
  const [importCompany, setImportCompany] = useState("");
  const [importDesc, setImportDesc] = useState("");
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");

  if (!isOpen) return null;

  const handleImportJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setImporting(true);
    setImportError("");
    try {
      await api<Job>("/jobs/import-url", {
        url: importUrl,
        title: importTitle,
        company: importCompany,
        description: importDesc,
        profile,
      });
      setImportUrl("");
      setImportTitle("");
      setImportCompany("");
      setImportDesc("");
      onClose();
      onImportSuccess();
    } catch (err: any) {
      setImportError(err.message || "Failed to import job");
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="card max-w-lg w-full p-6 bg-bg border border-line shadow-2xl rise">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Import Opportunity</h3>
          <button
            type="button"
            className="text-muted hover:text-fg text-sm p-1 rounded"
            onClick={onClose}
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
              onClick={onClose}
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
  );
}
