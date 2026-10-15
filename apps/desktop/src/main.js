const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("path");
const os = require("os");
const http = require("http");
const { exec, spawn } = require("child_process");

let mainWindow = null;

const DASHBOARD_URL = process.env.DESKTOP_START_URL || "http://localhost:3000/dashboard";

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: "itsLARP - AI Job-Hunting Workforce",
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Direct load: Open directly into /dashboard without landing page or login
  mainWindow.loadURL(DASHBOARD_URL).catch(() => {
    mainWindow.loadFile(path.join(__dirname, "index.html"));
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Open external links in default browser
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
  setupIpcHandlers();
  createWindow();

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
    };
  });

  // 2. Check Ollama Status
  ipcMain.handle("ollama:checkStatus", async () => {
    return new Promise((resolve) => {
      const req = http.get("http://127.0.0.1:11434/api/tags", (res) => {
        if (res.statusCode === 200) {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            try {
              const parsed = JSON.parse(data);
              resolve({
                running: true,
                port: 11434,
                models: (parsed.models || []).map((m) => m.name),
              });
            } catch {
              resolve({ running: true, port: 11434, models: [] });
            }
          });
        } else {
          resolve({ running: false, port: 11434, models: [] });
        }
      });

      req.on("error", () => {
        resolve({ running: false, port: 11434, models: [] });
      });

      req.setTimeout(2000, () => {
        req.destroy();
        resolve({ running: false, port: 11434, models: [] });
      });
    });
  });

  // 3. Automated Install Trigger
  ipcMain.handle("ollama:autoInstall", async () => {
    const isMac = process.platform === "darwin";
    const downloadUrl = isMac
      ? "https://ollama.com/download/Ollama-darwin.zip"
      : "https://ollama.com/download/OllamaSetup.exe";

    shell.openExternal(downloadUrl);
    return {
      ok: true,
      url: downloadUrl,
      platform: process.platform,
      message: "Installer download initiated. Launch the downloaded installer to start Ollama.",
    };
  });

  // 4. Start Ollama Daemon
  ipcMain.handle("ollama:startDaemon", async () => {
    return new Promise((resolve) => {
      exec("ollama serve", (error) => {
        if (error) {
          resolve({ ok: false, error: error.message });
        } else {
          resolve({ ok: true });
        }
      });
    });
  });
}
