const { spawn, execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const http = require("http");

const ROOT_DIR = path.resolve(__dirname, "..");
const API_DIR = path.join(ROOT_DIR, "apps", "api");
const WEB_DIR = path.join(ROOT_DIR, "apps", "web");

console.log("\x1b[1m\x1b[32m%s\x1b[0m", "▲ HowToLarped — Starting Unified Development Environment...");
console.log("  Root: " + ROOT_DIR);

// Colors for log prefixes
const C_RESET = "\x1b[0m";
const C_API = "\x1b[36m[api]\x1b[0m ";
const C_WEB = "\x1b[35m[web]\x1b[0m ";
const C_AI = "\x1b[33m[ai]\x1b[0m  ";
const C_SYS = "\x1b[32m[sys]\x1b[0m ";

// 1. Check Python Venv in apps/api
const venvPython = process.platform === "win32"
  ? path.join(API_DIR, ".venv", "Scripts", "python.exe")
  : path.join(API_DIR, ".venv", "bin", "python3");

const venvUvicorn = process.platform === "win32"
  ? path.join(API_DIR, ".venv", "Scripts", "uvicorn.exe")
  : path.join(API_DIR, ".venv", "bin", "uvicorn");

if (!fs.existsSync(venvUvicorn)) {
  console.log(C_SYS + "Virtualenv not found or missing uvicorn. Initializing apps/api/.venv...");
  try {
    execSync("python3 -m venv .venv", { cwd: API_DIR, stdio: "inherit" });
    const pip = process.platform === "win32" ? path.join(API_DIR, ".venv", "Scripts", "pip.exe") : path.join(API_DIR, ".venv", "bin", "pip");
    execSync(`"${pip}" install -r requirements.txt`, { cwd: API_DIR, stdio: "inherit" });
    console.log(C_SYS + "✓ Python dependencies installed.");
  } catch (err) {
    console.error(C_SYS + "Failed to setup python venv automatically. Make sure python3 is installed.");
  }
}

// 2. Quick check on Ollama
function checkOllama() {
  const req = http.get("http://localhost:11434/api/tags", (res) => {
    if (res.statusCode === 200) {
      console.log(C_AI + "✓ Local Ollama detected online on port 11434 (Local AI Ready).");
    } else {
      console.log(C_AI + "ℹ Ollama responded with status " + res.statusCode + ". Fallback engine active.");
    }
  });
  req.on("error", () => {
    console.log(C_AI + "ℹ Ollama not detected on localhost:11434. The app will use the deterministic verification engine. (Run 'ollama serve' anytime for local models)");
  });
  req.setTimeout(1500, () => req.destroy());
}
checkOllama();

// Processes tracker
const children = [];

function pipeLogs(stream, prefix) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split("\n");
    buffer = lines.pop(); // keep last incomplete line
    for (const line of lines) {
      if (line.trim()) {
        console.log(prefix + line);
      }
    }
  });
}

// 3. Spawn FastAPI Backend (port 8000)
const uvicornExec = fs.existsSync(venvUvicorn) ? venvUvicorn : "uvicorn";
const apiProcess = spawn(
  uvicornExec,
  ["main:app", "--host", "127.0.0.1", "--port", "8000", "--reload"],
  {
    cwd: API_DIR,
    env: { ...process.env, PYTHONUNBUFFERED: "1" },
    shell: true,
  }
);
children.push(apiProcess);
pipeLogs(apiProcess.stdout, C_API);
pipeLogs(apiProcess.stderr, C_API);

apiProcess.on("error", (err) => {
  console.error(C_API + "Error spawning API process: " + err.message);
});

apiProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.log(C_API + `Exited with code ${code}`);
  }
});

// 4. Spawn Next.js Frontend (port 3000)
const nextCmd = process.platform === "win32" ? "npx.cmd" : "npx";
const webProcess = spawn(nextCmd, ["next", "dev", "-p", "3000"], {
  cwd: WEB_DIR,
  env: { ...process.env, NEXT_PUBLIC_API_URL: "http://localhost:8000" },
  shell: true,
});
children.push(webProcess);
pipeLogs(webProcess.stdout, C_WEB);
pipeLogs(webProcess.stderr, C_WEB);

webProcess.on("error", (err) => {
  console.error(C_WEB + "Error spawning Web process: " + err.message);
});

webProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.log(C_WEB + `Exited with code ${code}`);
  }
});

console.log(C_SYS + "✓ API server starting on http://localhost:8000");
console.log(C_SYS + "✓ Web application starting on http://localhost:3000");
console.log(C_SYS + "Press Ctrl+C to terminate both servers cleanly.\n");

// Clean shutdown on Ctrl+C / kill signals
function shutdown() {
  console.log("\n" + C_SYS + "Shutting down servers...");
  for (const child of children) {
    try {
      if (child && !child.killed) {
        if (process.platform === "win32") {
          spawn("taskkill", ["/pid", child.pid, "/f", "/t"]);
        } else {
          process.kill(-child.pid, "SIGTERM");
        }
      }
    } catch (e) {
      try {
        child.kill("SIGTERM");
      } catch {}
    }
  }
  setTimeout(() => process.exit(0), 500);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
process.on("exit", shutdown);
