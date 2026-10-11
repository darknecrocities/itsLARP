"use client";
import { useEffect, useRef, useState } from "react";

export function PageHeader({
  title,
  sub,
  badge,
  action,
}: {
  title: string;
  sub?: string;
  badge?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6 mb-8 rise">
      <div>
        {badge && (
          <span className="label-xs inline-block mb-1 text-muted">
            {badge}
          </span>
        )}
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-ink">{title}</h1>
        {sub && <p className="text-muted text-sm mt-1.5 max-w-2xl leading-relaxed">{sub}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function Reveal({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <div className={`rise ${className}`} style={{ ["--i" as string]: i }}>
      {children}
    </div>
  );
}

export function Count({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const raf = useRef(0);

  useEffect(() => {
    const s = performance.now();
    const f = (n: number) => {
      const p = Math.min((n - s) / 600, 1);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf.current = requestAnimationFrame(f);
    };
    raf.current = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf.current);
  }, [to]);

  return (
    <>
      {v.toLocaleString()}
      {suffix}
    </>
  );
}

export function Stat({
  label,
  value,
  suffix,
  i = 0,
}: {
  label: string;
  value: number;
  suffix?: string;
  i?: number;
}) {
  return (
    <Reveal i={i} className="card p-4 bg-bg">
      <div className="label-xs">{label}</div>
      <div className="font-display text-2xl md:text-3xl font-bold mt-1 tracking-tight text-ink">
        <Count to={value} suffix={suffix} />
      </div>
    </Reveal>
  );
}

export function Empty({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="card p-12 text-center border-dashed bg-bg2/40">
      <div className="font-semibold text-base text-ink">{title}</div>
      <p className="text-muted text-sm mt-1.5 mb-5 max-w-md mx-auto leading-relaxed">{hint}</p>
      {children}
    </div>
  );
}

export function ErrorBox({ msg, retry }: { msg: string; retry?: () => void }) {
  return (
    <div role="alert" className="border border-black/30 bg-bg2 rounded p-4 text-xs font-mono">
      <div className="font-semibold text-ink mb-0.5">ERROR: {msg}</div>
      <div className="text-muted">Your career data is safe in local storage & database.</div>
      {retry && (
        <button className="btn text-xs mt-3 py-1 px-3 border-black/40" onClick={retry}>
          Retry Operation
        </button>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "n",
}: {
  children: React.ReactNode;
  tone?: "n" | "ok" | "warn" | "err" | "dark";
}) {
  const styles = {
    n: "text-neutral-700 border-neutral-300 bg-neutral-100",
    ok: "text-black border-black/40 bg-neutral-100 font-semibold",
    warn: "text-neutral-800 border-neutral-400 bg-neutral-100 font-semibold",
    err: "text-white border-black bg-black font-semibold",
    dark: "text-white bg-black border-black font-semibold",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1 border rounded px-1.5 py-0.5 text-[11px] font-mono leading-none ${styles}`}
    >
      {children}
    </span>
  );
}
