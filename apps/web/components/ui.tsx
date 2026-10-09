"use client";
import { useEffect, useRef, useState } from "react";

export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-5 mb-8 rise">
      <div><h1 className="text-3xl font-semibold">{title}</h1>{sub && <p className="text-muted mt-1">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Reveal({ children, i = 0, className = "" }: { children: React.ReactNode; i?: number; className?: string }) {
  return <div className={`rise ${className}`} style={{ ["--i" as string]: i }}>{children}</div>;
}

export function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0); const raf = useRef(0);
  useEffect(() => {
    const s = performance.now();
    const f = (n: number) => { const p = Math.min((n - s) / 700, 1); setV(Math.round(to * (1 - Math.pow(1 - p, 3)))); if (p < 1) raf.current = requestAnimationFrame(f); };
    raf.current = requestAnimationFrame(f); return () => cancelAnimationFrame(raf.current);
  }, [to]);
  return <>{v.toLocaleString()}{suffix}</>;
}

export function Stat({ label, value, suffix, i = 0 }: { label: string; value: number; suffix?: string; i?: number }) {
  return <Reveal i={i} className="card p-4"><div className="label-xs">{label}</div><div className="font-display text-2xl mt-1"><Count to={value} suffix={suffix} /></div></Reveal>;
}

export function Empty({ title, hint, children }: { title: string; hint: string; children?: React.ReactNode }) {
  return <div className="card p-10 text-center"><div className="font-medium">{title}</div><p className="text-muted mt-1 mb-4">{hint}</p>{children}</div>;
}

export function ErrorBox({ msg, retry }: { msg: string; retry?: () => void }) {
  return (
    <div role="alert" className="border border-err/40 rounded p-3 text-sm">
      <div className="font-medium text-err">{msg}</div>
      <div className="text-muted">Your career data is safe.</div>
      {retry && <button className="btn mt-2" onClick={retry}>Retry</button>}
    </div>
  );
}

export function Badge({ children, tone = "n" }: { children: React.ReactNode; tone?: "n" | "ok" | "warn" | "err" }) {
  const c = { n: "text-dmuted border-line", ok: "text-ok border-ok/40", warn: "text-warn border-warn/40", err: "text-err border-err/40" }[tone];
  return <span className={`inline-block border rounded px-1.5 py-0.5 text-[11px] font-medium ${c}`}>{children}</span>;
}
