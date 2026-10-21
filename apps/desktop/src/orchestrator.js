const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");
const os = require("os");

let spawnedProcesses = [];

function checkPortOpen(port, timeoutMs = 600) {
  return new Promise((resolve) => {
    const req = http.request(
      { hostname: "127.0.0.1", port, path: "/", method: "HEAD", timeout: timeoutMs },
      (res) => resolve(res.statusCode >= 200 && res.statusCode < 500)
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

function findRepoRoot() {
  const home = os.homedir();
  try {
    const cfg = path.join(home, ".itslarp", "workspace_path");
    if (fs.existsSync(cfg)) {
      const p = fs.readFileSync(cfg, "utf-8").trim();
      if (p && fs.existsSync(path.join(p, "apps", "api"))) return p;
    }
  } catch {}

  const candidates = [
    process.env.ITSLARP_REPO_ROOT,
    path.resolve(__dirname, "..", ".."),
    path.resolve(process.cwd()),
    path.join(home, ".gemini", "antigravity", "worktrees", "itsLarper", "preview_resume_career_profile"),
    path.join(home, "Documents", "itslarp"),
    path.join(home, "Projects", "itslarp"),
    path.join(home, "Developer", "itslarp"),
  ];
  for (const c of candidates) {
    if (c && fs.existsSync(path.join(c, "apps", "api")) && fs.existsSync(path.join(c, "apps", "web"))) {
      return c;
    }
  }
  return null;
}

function resolvePythonBinary(repoRoot) {
  const isWin = process.platform === "win32";
  if (repoRoot) {
    const venvPython = isWin
      ? path.join(repoRoot, "apps", "api", ".venv", "Scripts", "python.exe")
      : path.join(repoRoot, "apps", "api", ".venv", "bin", "python");
    if (fs.existsSync(venvPython)) return venvPython;
  }
  if (isWin) {
    for (const cmd of ["py -3", "py", "python", "python3"]) {
      try {
        execSync(`${cmd} --version`, { stdio: "ignore" });
        return cmd;
      } catch {}
    }
    return "py";
  }
  return "python3";
}

async function getServicesStatus() {
  const [web, api, ollama] = await Promise.all([
    checkPortOpen(3000),
    checkPortOpen(8000),
    checkPortOpen(11434),
  ]);
  return { web, api, ollama };
}

async function startApiServer() {
  const isRunning = await checkPortOpen(8000);
  if (isRunning) return { ok: true, alreadyRunning: true };

  const repoRoot = findRepoRoot();
  if (!repoRoot) return { ok: false, error: "Repository workspace not found on device" };

  const apiDir = path.join(repoRoot, "apps", "api");
  const py = resolvePythonBinary(repoRoot);
  const isWin = process.platform === "win32";

  try {
    const args = py.includes("python") || py.includes(".venv")
      ? ["-m", "uvicorn", "main:app", "--port", "8000", "--host", "127.0.0.1"]
      : ["-m", "uvicorn", "main:app", "--port", "8000", "--host", "127.0.0.1"];

    const proc = spawn(py, args, {
      cwd: apiDir,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
      shell: isWin && !py.endsWith(".exe"),
    });
    spawnedProcesses.push(proc);
    proc.unref();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function startWebServer() {
  const isRunning = await checkPortOpen(3000);
  if (isRunning) return { ok: true, alreadyRunning: true };

  const repoRoot = findRepoRoot();
  if (!repoRoot) return { ok: false, error: "Repository workspace not found on device" };

  const webDir = path.join(repoRoot, "apps", "web");
  const isWin = process.platform === "win32";
  const npmCmd = isWin ? "npm.cmd" : "npm";

  try {
    const proc = spawn(npmCmd, ["run", "dev"], {
      cwd: webDir,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    spawnedProcesses.push(proc);
    proc.unref();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function startLocalStack() {
  await Promise.all([startApiServer(), startWebServer()]);
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 600));
    const status = await getServicesStatus();
    if (status.web && status.api) {
      return { ok: true, ready: true, status };
    }
  }
  const finalStatus = await getServicesStatus();
  return { ok: finalStatus.web || finalStatus.api, ready: finalStatus.web, status: finalStatus };
}

function stopLocalServices() {
  for (const proc of spawnedProcesses) {
    try {
      if (process.platform === "win32" && proc.pid) {
        execSync(`taskkill /PID ${proc.pid} /T /F`, { stdio: "ignore" });
      } else if (proc.pid) {
        process.kill(-proc.pid);
      }
    } catch {}
  }
  spawnedProcesses = [];
}

module.exports = {
  checkPortOpen,
  getServicesStatus,
  startApiServer,
  startWebServer,
  startLocalStack,
  stopLocalServices,
  findRepoRoot,
};
