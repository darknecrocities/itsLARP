"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type BotTelemetry } from "@/lib/swarm";
import { Badge } from "../ui";

interface BotInspectorModalProps {
  inspectedBot: BotTelemetry | null;
  onClose: () => void;
  verificationCode: string;
  setVerificationCode: (code: string) => void;
  verifying: boolean;
  onVerifySubmit: (e: React.FormEvent) => void;
}

export function BotInspectorModal({
  inspectedBot,
  onClose,
  verificationCode,
  setVerificationCode,
  verifying,
  onVerifySubmit,
}: BotInspectorModalProps) {
  return (
    <AnimatePresence>
      {inspectedBot && (
        <motion.div
          key={inspectedBot.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 p-5 bg-white border-2 border-black rounded shadow-lg font-mono text-xs"
        >
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-300 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-base text-black">[{inspectedBot.id}]</span>
              <span className="px-2 py-0.5 bg-neutral-100 border border-neutral-300 rounded text-neutral-800">
                {inspectedBot.platform}
              </span>
              <Badge tone={inspectedBot.status === "needs_verification" ? "dark" : "ok"}>
                {inspectedBot.status.toUpperCase()}
              </Badge>
            </div>
            <button
              className="text-neutral-500 hover:text-black text-sm font-sans"
              onClick={onClose}
            >
              ✕ Close
            </button>
          </div>

          {(inspectedBot.status === "needs_verification" || inspectedBot.verification_challenge) && (
            <div className="p-4 mb-4 bg-neutral-100 border border-black rounded text-black">
              <div className="flex items-center gap-2 font-bold mb-1">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                Verification Required on {inspectedBot.platform}
              </div>
              <p className="text-neutral-700 text-xs font-sans mb-3">
                {inspectedBot.verification_challenge?.prompt ||
                  `The job platform (${inspectedBot.platform}) has requested a login confirmation or 2FA code. Enter the code below to resume.`}
              </p>
              <form onSubmit={onVerifySubmit} className="flex gap-2 max-w-md">
                <input
                  type="text"
                  className="input text-xs"
                  placeholder="Enter Code (e.g. 123456)"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button type="submit" className="btn btn-primary text-xs" disabled={verifying}>
                  {verifying ? "Checking..." : "Confirm & Resume"}
                </button>
              </form>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="label-xs text-neutral-500">WHAT THIS AGENT IS DOING</div>
              <p className="font-sans text-sm font-medium text-black mt-1">
                {inspectedBot.current_task}
              </p>

              {inspectedBot.target_company && (
                <div className="mt-3 p-2 bg-neutral-50 rounded border border-neutral-200 text-xs font-sans">
                  <span className="label-xs text-neutral-500 block mb-0.5">TARGET OPPORTUNITY</span>
                  <strong>{inspectedBot.target_role}</strong> at{" "}
                  <span className="text-neutral-600">{inspectedBot.target_company}</span>
                </div>
              )}
            </div>

            <div>
              <div className="label-xs text-neutral-500 mb-2">RECENT ACTIONS</div>
              <div className="p-3 bg-neutral-50 rounded border border-neutral-200 space-y-1.5 max-h-40 overflow-y-auto text-[11px]">
                {inspectedBot.logs && inspectedBot.logs.length > 0 ? (
                  inspectedBot.logs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-neutral-500 shrink-0">{l.t}</span>
                      <span className="text-neutral-800">{l.msg}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-neutral-500">Waiting for next action...</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
