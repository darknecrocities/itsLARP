"use client";
import React, { useState } from "react";
import { useStore, type AgentQuestion } from "@/lib/store";
import { HelpCircle, Send, Check, X, Bell } from "lucide-react";

export function AgentQuestionsDrawer() {
  const { questions, answerQuestion, dismissQuestion } = useStore();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  if (!questions || questions.length === 0) {
    return null;
  }

  const handleSubmit = async (q: AgentQuestion) => {
    const text = (answers[q.id] || "").trim();
    if (!text) return;
    setBusyId(q.id);
    try {
      await answerQuestion(q.id, text);
      setAnswers((prev) => {
        const next = { ...prev };
        delete next[q.id];
        return next;
      });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="card p-5 bg-bg2/80 border-2 border-black space-y-4 rise">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-ink" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-black animate-pulse" />
          </div>
          <h2 className="text-sm font-bold text-ink">
            Active Agent Inquiries ({questions.length})
          </h2>
        </div>
        <span className="text-[11px] font-mono text-muted">
          Your accurate answer will be automatically saved to your Career DNA evidence corpus.
        </span>
      </div>

      <div className="space-y-3">
        {questions.map((q) => (
          <div
            key={q.id}
            className="p-4 bg-bg rounded border border-line space-y-2.5 shadow-xs"
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-xs font-semibold text-ink">
                  {q.role} at {q.company}
                </span>
                <p className="text-xs text-dmuted mt-0.5 leading-relaxed">
                  {q.question}
                </p>
              </div>
              <button
                type="button"
                onClick={() => dismissQuestion(q.id)}
                className="text-muted hover:text-ink text-xs p-1"
                title="Dismiss question"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                className="input text-xs py-1.5 flex-1"
                placeholder="Type your exact factual experience or preference..."
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubmit(q);
                  }
                }}
              />
              <button
                onClick={() => handleSubmit(q)}
                disabled={busyId === q.id || !(answers[q.id] || "").trim()}
                className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3 h-3" />
                {busyId === q.id ? "Saving..." : "Submit & Save to DNA"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
