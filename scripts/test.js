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

if (fs.existsSync(pytestBin)) {
  executable = pytestBin;
  args = ["tests"];
} else if (isWin) {
  executable = "py";
  args = ["-m", "pytest", "tests"];
} else {
  executable = "pytest";
  args = ["tests"];
}

const result = spawnSync(executable, args, { cwd: API_DIR, stdio: "inherit", shell: isWin });
process.exit(result.status || 0);
