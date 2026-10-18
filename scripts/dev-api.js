const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const API_DIR = path.resolve(__dirname, "..", "apps", "api");
const isWin = process.platform === "win32";
const uvicornBin = isWin
  ? path.join(API_DIR, ".venv", "Scripts", "uvicorn.exe")
  : path.join(API_DIR, ".venv", "bin", "uvicorn");

const hasVenv = fs.existsSync(uvicornBin);
const executable = hasVenv ? uvicornBin : "uvicorn";
const proc = spawn(executable, ["main:app", "--port", "8000", "--reload"], {
  cwd: API_DIR,
  stdio: "inherit",
  shell: !hasVenv && isWin,
});

proc.on("exit", (code) => process.exit(code || 0));
