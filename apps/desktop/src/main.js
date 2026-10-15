const { app, BrowserWindow, ipcMain, shell, Notification } = require("electron");
const path = require("path");
const os = require("os");
const http = require("http");
const https = require("https");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { checkForUpdates, downloadLatestRelease, initAutoUpdater } = require("./updater");

let mainWindow = null;

const CLOUD_URL = "https://getitslarp.vercel.app/dashboard";
const LOCAL_URL = "http://localhost:3000/dashboard";

/**
 * Checks if a given HTTP or HTTPS URL responds within timeout.
 */
function checkUrlReachable(targetUrl, timeoutMs = 800) {
  return new Promise((resolve) => {
    try {
      const parsed = new URL(targetUrl);
      const transport = parsed.protocol === "https:" ? https : http;
      const req = transport.request(
        {
          hostname: parsed.hostname,
          port: parsed.port || (parsed.protocol === "https:" ? 443 : 80),
          path: parsed.pathname,
          method: "HEAD",
          timeout: timeoutMs,
        },
        (res) => {
          resolve(res.statusCode >= 200 && res.statusCode < 500);
        }
      );
      req.on("error", () => resolve(false));
      req.on("timeout", () => {
        req.destroy();
        resolve(false);
      });
      req.end();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Dynamically resolves the best starting workspace:
 * 1. Explicit DESKTOP_START_URL env var if provided.
 * 2. Local dev/standalone server if running on port 3000.
 * 3. Live production cloud workspace.
 * 4. Fallback to index.html (offline control center).
 */
async function resolveStartUrl() {
  if (process.env.DESKTOP_START_URL) {
    return process.env.DESKTOP_START_URL;
  }

  // 1. Check local server
  const localUp = await checkUrlReachable(LOCAL_URL, 500);
  if (localUp) {
    return LOCAL_URL;
  }

  // 2. Check cloud server
  const cloudUp = await checkUrlReachable(CLOUD_URL, 1500);
  if (cloudUp) {
    return CLOUD_URL;
  }

  // 3. Fallback to offline launchpad
  return null;
}

/**
 * Searches for the Ollama binary or application depending on OS.
 */
function findOllamaBinary() {
  const isWin = process.platform === "win32";
  const isMac = process.platform === "darwin";

  const candidates = isWin
    ? [
        path.join(process.env.LOCALAPPDATA || "", "Programs", "Ollama", "ollama.exe"),
        "C:\\Program Files\\Ollama\\ollama.exe",
      ]
    : isMac
    ? [
        "/Applications/Ollama.app/Contents/Resources/ollama",
        "/opt/homebrew/bin/ollama",
        "/usr/local/bin/ollama",
        path.join(os.homedir(), ".local", "bin", "ollama"),
      ]
    : [
        "/usr/local/bin/ollama",
        "/usr/bin/ollama",
        path.join(os.homedir(), ".local", "bin", "ollama"),
      ];

  for (const c of candidates) {
    if (c && fs.existsSync(c)) {
      return c;
    }
  }
  return null;
}

/**
 * Automatically launches the background Ollama daemon if installed.
 */
function autoStartOllamaIfAvailable() {
  const isMac = process.platform === "darwin";
  const isWin = process.platform === "win32";

  // Check if already running first
  const req = http.get("http://127.0.0.1:11434/api/tags", (res) => {
    if (res.statusCode === 200) {
      console.log("[itsLARP Desktop] Ollama daemon is already running.");
    }
  });

  req.on("error", () => {
    // Daemon is not running, attempt to start it
    if (isMac && fs.existsSync("/Applications/Ollama.app")) {
      console.log("[itsLARP Desktop] Starting macOS Ollama.app...");
      exec("open -a Ollama", () => {});
      return;
    }

    const bin = findOllamaBinary();
    if (bin) {
      console.log(`[itsLARP Desktop] Spawning Ollama daemon from ${bin}...`);
      try {
        const proc = spawn(bin, ["serve"], {
          detached: true,
          stdio: "ignore",
          windowsHide: true,
        });
        proc.unref();
      } catch (err) {
        console.error("[itsLARP Desktop] Failed to auto-spawn Ollama daemon:", err);
      }
    }
  });

  req.setTimeout(1000, () => req.destroy());
}

/**
 * Resolves the application icon for BrowserWindow and macOS dock.
 */
function getAppIconPath() {
  const srcIcon = path.join(__dirname, "icon.png");
  if (fs.existsSync(srcIcon)) return srcIcon;
  const buildIcon = path.join(__dirname, "..", "build", "icon.png");
  if (fs.existsSync(buildIcon)) return buildIcon;
  return null;
}

function createWindow() {
  const iconPath = getAppIconPath();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: "itsLARP - AI Job-Hunting Workforce",
    backgroundColor: "#ffffff",
    icon: iconPath || undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Attempt dynamic workspace resolution
  resolveStartUrl().then((targetUrl) => {
    if (targetUrl) {
      console.log(`[itsLARP Desktop] Launching into workspace: ${targetUrl}`);
      mainWindow.loadURL(targetUrl).catch(() => {
        mainWindow.loadFile(path.join(__dirname, "index.html"));
      });
    } else {
      console.log("[itsLARP Desktop] Workspace offline, loading local launchpad...");
      mainWindow.loadFile(path.join(__dirname, "index.html"));
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  const iconPath = getAppIconPath();
  if (process.platform === "darwin" && app.dock && iconPath) {
    try {
      app.dock.setIcon(iconPath);
    } catch {}
  }
  setupIpcHandlers();
  autoStartOllamaIfAvailable();
  createWindow();
  initAutoUpdater(mainWindow);

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function setupIpcHandlers() {
  // 1. Hardware Specs Inspection
  ipcMain.handle("system:getHardwareSpecs", async () => {
    const cpus = os.cpus();
    const model = cpus[0]?.model || "Unknown CPU";
    const arch = process.arch;
    const isAppleSilicon = process.platform === "darwin" && (arch === "arm64" || model.includes("Apple"));
    const isAmd = model.toLowerCase().includes("amd") || model.toLowerCase().includes("ryzen");
    const isIntel = model.toLowerCase().includes("intel");

    return {
      platform: process.platform,
      arch: arch,
      cpuModel: model,
      cores: cpus.length,
      totalRamGb: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
      freeRamGb: Math.round(os.freemem() / (1024 * 1024 * 1024)),
      isAppleSilicon,
      isAmd,
      isIntel,
      tier: isAppleSilicon
        ? "Apple Silicon (Metal GPU Unified Memory)"
        : isAmd
        ? "AMD Ryzen / Radeon"
        : "Intel Core / Ultra",
      recommendedModel: isAppleSilicon ? "qwen2.5-coder:7b" : "qwen2.5:1.5b",
    };
  });

  // 2. Check Ollama Status
  ipcMain.handle("ollama:checkStatus", async () => {
    return new Promise((resolve) => {
      const binaryPath = findOllamaBinary();
      const installed = Boolean(binaryPath || (process.platform === "darwin" && fs.existsSync("/Applications/Ollama.app")));

      const req = http.get("http://127.0.0.1:11434/api/tags", (res) => {
        if (res.statusCode === 200) {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              resolve({
                installed: true,
                running: true,
                port: 11434,
                models: (parsed.models || []).map((m) => m.name),
                binaryPath,
              });
            } catch {
              resolve({ installed: true, running: true, port: 11434, models: [], binaryPath });
            }
          });
        } else {
          resolve({ installed, running: false, port: 11434, models: [], binaryPath });
        }
      });

      req.on("error", () => {
        resolve({ installed, running: false, port: 11434, models: [], binaryPath });
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ installed, running: false, port: 11434, models: [], binaryPath });
      });
    });
  });

  // 3. Start Ollama Daemon
  ipcMain.handle("ollama:startDaemon", async () => {
    const isMac = process.platform === "darwin";
    if (isMac && fs.existsSync("/Applications/Ollama.app")) {
      exec("open -a Ollama", () => {});
      return { ok: true, message: "Ollama.app launched" };
    }

    const bin = findOllamaBinary() || "ollama";
    try {
      const proc = spawn(bin, ["serve"], {
        detached: true,
        stdio: "ignore",
        windowsHide: true,
      });
      proc.unref();
      return { ok: true, message: "Ollama daemon started in background" };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });

  // 4. Automated OS-Aware Ollama Install Trigger
  ipcMain.handle("ollama:autoInstall", async () => {
    const isMac = process.platform === "darwin";
    const isWin = process.platform === "win32";

    if (isWin) {
      const winUrl = "https://ollama.com/download/OllamaSetup.exe";
      shell.openExternal(winUrl);
      return {
        ok: true,
        platform: "windows",
        url: winUrl,
        message: "Ollama Windows installer download initiated. Launch the installer to complete setup.",
      };
    } else if (isMac) {
      const macUrl = "https://ollama.com/download/Ollama-darwin.zip";
      shell.openExternal(macUrl);
      return {
        ok: true,
        platform: "darwin",
        url: macUrl,
        message: "Ollama macOS download initiated. Move Ollama.app to Applications.",
      };
    } else {
      const script = "curl -fsSL https://ollama.com/install.sh | sh";
      return {
        ok: true,
        platform: "linux",
        command: script,
        message: `Run this command in terminal: ${script}`,
      };
    }
  });

  // 5. Pull Model with Streaming Progress
  ipcMain.handle("ollama:pullModel", async (event, modelName) => {
    return new Promise((resolve) => {
      const postData = JSON.stringify({ name: modelName, stream: true });
      const req = http.request(
        {
          hostname: "127.0.0.1",
          port: 11434,
          path: "/api/pull",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
        },
        (res) => {
          if (res.statusCode !== 200) {
            resolve({ ok: false, error: `Ollama returned status ${res.statusCode}` });
            return;
          }

          let buffer = "";
          res.on("data", (chunk) => {
            buffer += chunk.toString("utf-8");
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";
            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (event.sender && !event.sender.isDestroyed()) {
                  event.sender.send("ollama:pullProgress", parsed);
                }
              } catch {}
            }
          });

          res.on("end", () => {
            resolve({ ok: true });
          });
        }
      );

      req.on("error", (err) => {
        resolve({ ok: false, error: err.message });
      });

      req.write(postData);
      req.end();
    });
  });

  // 6. Dynamic Workspace Navigation
  ipcMain.handle("workspace:navigate", async (event, target) => {
    if (!mainWindow) return { ok: false };
    if (target === "local") {
      mainWindow.loadURL(LOCAL_URL).catch(() => {
        mainWindow.loadFile(path.join(__dirname, "index.html"));
      });
    } else if (target === "cloud") {
      mainWindow.loadURL(CLOUD_URL).catch(() => {
        mainWindow.loadFile(path.join(__dirname, "index.html"));
      });
    } else if (target === "launchpad") {
      mainWindow.loadFile(path.join(__dirname, "index.html"));
    } else if (typeof target === "string" && target.startsWith("http")) {
      mainWindow.loadURL(target);
    }
    return { ok: true };
  });

  // 7. Workspace Status Checker
  ipcMain.handle("workspace:getStatus", async () => {
    const localReachable = await checkUrlReachable(LOCAL_URL, 500);
    const cloudReachable = await checkUrlReachable(CLOUD_URL, 1500);
    return {
      localReachable,
      cloudReachable,
      currentUrl: mainWindow ? mainWindow.webContents.getURL() : null,
    };
  });

  // 8. Application Auto-Updater & Status
  ipcMain.handle("updater:check", async () => {
    return await checkForUpdates();
  });

  ipcMain.handle("updater:download", async () => {
    return downloadLatestRelease(process.platform, process.arch);
  });

  // 9. Cross-Platform Native Notification Dispatcher
  ipcMain.handle("notification:show", async (_event, payload) => {
    try {
      if (Notification.isSupported()) {
        const iconPath = getAppIconPath();
        const notif = new Notification({
          title: payload?.title || "itsLARP Update",
          body: payload?.body || "",
          icon: iconPath || undefined,
          silent: false,
        });
        notif.show();
        return { ok: true };
      }
      return { ok: false, error: "Notifications not supported on host platform" };
    } catch (err) {
      return { ok: false, error: err.message };
    }
  });
}
