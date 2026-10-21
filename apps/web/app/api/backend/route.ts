import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import http from "http";

function checkPortOpen(port: number, timeoutMs = 600): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path: "/docs", method: "HEAD", timeout: timeoutMs },
      (res) => resolve(Boolean(res.statusCode && res.statusCode >= 200 && res.statusCode < 500))
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function findRepoRoot(): string {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, "apps", "api"))) return cwd;
  const parent = path.resolve(/*turbopackIgnore: true*/ cwd, "..");
  if (fs.existsSync(path.join(parent, "apps", "api"))) return parent;
  try {
    const homedir = process.env.HOME || process.env.USERPROFILE || "";
    const configPath = path.join(homedir, ".itslarp", "workspace_path");
    if (fs.existsSync(configPath)) {
      const saved = fs.readFileSync(configPath, "utf-8").trim();
      if (saved && fs.existsSync(path.join(saved, "apps", "api"))) return saved;
    }
  } catch {}
  return cwd;
}

async function triggerBackendStart(): Promise<{ ok: boolean; message: string; auto_started: boolean }> {
  const isOpen = await checkPortOpen(8000, 500);
  if (isOpen) {
    return { ok: true, message: "Backend already listening on port 8000", auto_started: false };
  }

  const root = findRepoRoot();
  const apiDir = path.join(root, "apps", "api");
  const isWin = process.platform === "win32";

  // Prepend venv path dynamically to avoid Turbopack static asset analysis
  const venvDirName = [".", "v", "e", "n", "v"].join("");
  const venvBin = path.join(apiDir, venvDirName, isWin ? "Scripts" : "bin");
  const venvPython = path.join(venvBin, isWin ? "python.exe" : "python");
  const envPath = fs.existsSync(venvBin)
    ? `${venvBin}${path.delimiter}${process.env.PATH || ""}`
    : process.env.PATH;

  try {
    const cmd = fs.existsSync(venvPython) ? venvPython : (isWin ? "python" : "python3");
    const proc = spawn(cmd, ["-m", "uvicorn", "main:app", "--port", "8000", "--host", "127.0.0.1"], {
      cwd: apiDir,
      detached: true,
      stdio: "ignore",
      env: { ...process.env, PATH: envPath },
      shell: isWin,
    });
    proc.unref();

    // Await port availability up to 3 seconds
    const startTime = Date.now();
    while (Date.now() - startTime < 3000) {
      await new Promise((r) => setTimeout(r, 250));
      const healthy = await checkPortOpen(8000, 300);
      if (healthy) {
        return { ok: true, message: "Backend automatically booted on port 8000", auto_started: true };
      }
    }

    return { ok: true, message: "Backend spawn initiated on port 8000", auto_started: true };
  } catch (err: any) {
    return { ok: false, message: err.message || "Failed to auto-spawn backend process", auto_started: false };
  }
}

export async function GET() {
  const isOpen = await checkPortOpen(8000);
  if (!isOpen) {
    const startResult = await triggerBackendStart();
    return NextResponse.json({
      status: startResult.ok ? "starting" : "offline",
      port: 8000,
      auto_started: startResult.auto_started,
      message: startResult.message,
    });
  }
  return NextResponse.json({ status: "online", port: 8000, auto_started: false });
}

export async function POST() {
  const res = await triggerBackendStart();
  return NextResponse.json(res);
}
