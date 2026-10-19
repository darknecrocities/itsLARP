const os = require("os");
const http = require("http");
const { exec, spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

/**
 * Registers all desktop IPC handlers for hardware specs, Ollama, workspace navigation,
 * native notifications, updater, and service orchestration.
 */
function setupIpcHandlers(ctx) {
  const {
    ipcMain,
    shell,
    Notification,
    findOllamaBinary,
    getAppIconPath,
    checkUrlReachable,
    checkForUpdates,
    downloadLatestRelease,
    orchestrator,
    getMainWindow,
    LOCAL_URL,
    CLOUD_URL,
  } = ctx;

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
    const mainWindow = getMainWindow();
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
    const mainWindow = getMainWindow();
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

  // 10. Automated Background Service Orchestration
  ipcMain.handle("orchestrator:getServicesStatus", () => orchestrator.getServicesStatus());
  ipcMain.handle("orchestrator:startLocalStack", () => orchestrator.startLocalStack());
  ipcMain.handle("orchestrator:stopLocalServices", () => {
    orchestrator.stopLocalServices();
    return { ok: true };
  });
}

module.exports = { setupIpcHandlers };
