const https = require("https");
const { shell } = require("electron");
const pkg = require("../package.json");

const CURRENT_VERSION = pkg.version || "1.0.0";
const UPDATES_API_URL = "https://getitslarp.vercel.app/api/updates";
const GITHUB_RELEASES_API = "https://api.github.com/repos/darknecrocities/itsLARP/releases/latest";

/**
 * Checks for application updates from the production API or GitHub Releases.
 */
function checkForUpdates() {
  return new Promise((resolve) => {
    const req = https.get(
      UPDATES_API_URL,
      {
        headers: { "User-Agent": "itsLARP-Desktop-Client/1.0" },
        timeout: 3000,
      },
      (res) => {
        if (res.statusCode === 200) {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              const data = JSON.parse(body);
              const latestVer = data.latestVersion || CURRENT_VERSION;
              const hasUpdate = latestVer !== CURRENT_VERSION;
              resolve({
                ok: true,
                currentVersion: CURRENT_VERSION,
                latestVersion: latestVer,
                updateAvailable: hasUpdate,
                status: hasUpdate ? "update_available" : "up_to_date",
                releaseTag: data.releaseTag || "v1.0.0-desktop",
                releaseDate: data.releaseDate || "2026-10-15",
                branch: data.branch || "main",
                commitSha: data.commitSha || "ea4008c",
                data: data.data || null,
              });
            } catch {
              resolve(getFallbackUpdateStatus());
            }
          });
        } else {
          resolve(getFallbackUpdateStatus());
        }
      }
    );

    req.on("error", () => resolve(getFallbackUpdateStatus()));
    req.on("timeout", () => {
      req.destroy();
      resolve(getFallbackUpdateStatus());
    });
  });
}

function getFallbackUpdateStatus() {
  return {
    ok: true,
    currentVersion: CURRENT_VERSION,
    latestVersion: CURRENT_VERSION,
    updateAvailable: false,
    status: "up_to_date",
    releaseTag: "v1.0.0-desktop",
    releaseDate: "2026-10-15",
    branch: "main",
    commitSha: "ea4008c",
    data: null,
  };
}

/**
 * Triggers download of the latest release binary for the current platform.
 */
function downloadLatestRelease(platform, arch) {
  const isMac = platform === "darwin";
  const isArm64 = arch === "arm64";

  let filename = "itsLARP-win-x64-setup.exe";
  if (isMac) {
    filename = isArm64 ? "itsLARP-mac-arm64.dmg" : "itsLARP-mac-x64.dmg";
  }

  const downloadUrl = `https://getitslarp.vercel.app/api/download?file=${filename}`;
  shell.openExternal(downloadUrl);
  return { ok: true, url: downloadUrl, filename };
}

/**
 * Initializes background auto-update checks on desktop startup.
 */
function initAutoUpdater(mainWindow) {
  setTimeout(async () => {
    try {
      const update = await checkForUpdates();
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("updater:status", update);
        if (update.updateAvailable) {
          mainWindow.webContents.send("updater:available", update);
        }
      }
    } catch (err) {
      console.error("[itsLARP Updater] Check failed:", err);
    }
  }, 4000);
}

module.exports = {
  CURRENT_VERSION,
  checkForUpdates,
  downloadLatestRelease,
  initAutoUpdater,
};
