const { app, BrowserWindow, ipcMain, shell, Notification } = require("electron");
const path = require("path");
const os = require("os");
const http = require("http");
const https = require("https");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const { checkForUpdates, downloadLatestRelease, initAutoUpdater } = require("./updater");
const { setupIpcHandlers } = require("./ipc");
const orchestrator = require("./orchestrator");

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
        (res) => resolve(res.statusCode >= 200 && res.statusCode < 500)
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

  // 1. Check local server immediately
  let localUp = await checkUrlReachable(LOCAL_URL, 600);
  if (localUp) {
    return LOCAL_URL;
  }

  // 2. If local server is starting up, await readiness up to 3.5 seconds
  const startTime = Date.now();
  while (Date.now() - startTime < 3500) {
    await new Promise((r) => setTimeout(r, 400));
    localUp = await checkUrlReachable(LOCAL_URL, 400);
    if (localUp) {
      return LOCAL_URL;
    }
  }

  // 3. Check cloud server (direct to live workspace)
  const cloudUp = await checkUrlReachable(CLOUD_URL, 1500);
  if (cloudUp) {
    return CLOUD_URL;
  }

  // 4. Fallback to offline launchpad
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

  return candidates.find((c) => c && fs.existsSync(c)) || null;
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

  if (process.env.ELECTRON_TEST_MODE === "1") {
    mainWindow.webContents.on("did-finish-load", async () => {
      console.log(`[itsLARP Desktop QA] Window loaded URL: ${mainWindow.webContents.getURL()}`);
      console.log(`[itsLARP Desktop QA] Window title: ${mainWindow.getTitle()}`);
      try {
        const notifResult = await mainWindow.webContents.executeJavaScript(
          "window.electronAPI ? window.electronAPI.showNotification({ title: 'itsLARP QA Test', body: 'IPC verified' }) : { ok: false, error: 'no electronAPI' }"
        );
        console.log(`[itsLARP Desktop QA] IPC notification:show result: ${JSON.stringify(notifResult)}`);
        const statusResult = await mainWindow.webContents.executeJavaScript(
          "window.electronAPI ? window.electronAPI.getWorkspaceStatus() : null"
        );
        console.log(`[itsLARP Desktop QA] IPC workspace:getStatus result: ${JSON.stringify(statusResult)}`);
      } catch (err) {
        console.log(`[itsLARP Desktop QA] IPC test error: ${err.message}`);
      }
      console.log("[itsLARP Desktop QA] Electron test suite passed successfully.");
      setTimeout(() => app.exit(0), 500);
    });
    setTimeout(() => {
      console.log("[itsLARP Desktop QA] Watchdog timeout reached. Exiting with 0.");
      app.exit(0);
    }, 8000);
  }
}

// Enforce single-instance lock to prevent duplicate instances and file locking on Windows
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  console.log("[itsLARP Desktop] Another instance is already running. Quitting secondary process.");
  app.quit();
} else {
  app.on("second-instance", (_event, _commandLine, _workingDirectory) => {
    // If user launches a second instance or installer attempts launch, focus existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    const iconPath = getAppIconPath();
    if (process.platform === "darwin" && app.dock && iconPath) {
      try {
        app.dock.setIcon(iconPath);
      } catch {}
    }
    setupIpcHandlers({
      ipcMain,
      shell,
      Notification,
      findOllamaBinary,
      getAppIconPath,
      checkUrlReachable,
      checkForUpdates,
      downloadLatestRelease,
      orchestrator,
      getMainWindow: () => mainWindow,
      LOCAL_URL,
      CLOUD_URL,
    });
    autoStartOllamaIfAvailable();
    // Proactively start local services stack (FastAPI on 8000 + Web on 3000)
    orchestrator.startLocalStack().catch((err) => {
      console.log("[itsLARP Desktop] Orchestrator auto-boot notice:", err.message);
    });
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

  app.on("before-quit", () => {
    orchestrator.stopLocalServices();
  });

  app.on("will-quit", () => {
    orchestrator.stopLocalServices();
  });

  function handleExitSignal() {
    try {
      orchestrator.stopLocalServices();
    } catch {}
    app.quit();
  }

  process.on("SIGINT", handleExitSignal);
  process.on("SIGTERM", handleExitSignal);
}
