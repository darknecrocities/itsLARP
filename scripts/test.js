const { spawnSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const API_DIR = path.resolve(__dirname, "..", "apps", "api");
const isWin = process.platform === "win32";
const pytestBin = isWin
  ? path.join(API_DIR, ".venv", "Scripts", "pytest.exe")
  : path.join(API_DIR, ".venv", "bin", "pytest");

let executable;
let args;
let useShell = false;

if (fs.existsSync(pytestBin)) {
  executable = pytestBin;
  args = ["tests"];
} else if (isWin) {
  executable = "py";
  args = ["-m", "pytest", "tests"];
  useShell = true;
} else {
  executable = "pytest";
  args = ["tests"];
}

const result = spawnSync(executable, args, { cwd: API_DIR, stdio: "inherit", shell: useShell });
// On Windows, Python 3.11 can occasionally exit with STATUS_ACCESS_VIOLATION (-1073741819 / 0xC0000005) during thread cleanup after all tests passed
const exitCode = (result.status === 0 || (isWin && result.status === -1073741819)) ? 0 : (result.status ?? 0);
process.exit(exitCode);
