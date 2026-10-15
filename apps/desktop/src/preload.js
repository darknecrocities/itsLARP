const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,
  arch: process.arch,
  getHardwareSpecs: () => ipcRenderer.invoke("system:getHardwareSpecs"),
  checkOllamaStatus: () => ipcRenderer.invoke("ollama:checkStatus"),
  startOllama: () => ipcRenderer.invoke("ollama:startDaemon"),
  installOllama: () => ipcRenderer.invoke("ollama:autoInstall"),
  pullModel: (modelName) => ipcRenderer.invoke("ollama:pullModel", modelName),
  onPullProgress: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("ollama:pullProgress", handler);
    return () => ipcRenderer.removeListener("ollama:pullProgress", handler);
  },
  navigateWorkspace: (target) => ipcRenderer.invoke("workspace:navigate", target),
  getWorkspaceStatus: () => ipcRenderer.invoke("workspace:getStatus"),
  checkForUpdates: () => ipcRenderer.invoke("updater:check"),
  downloadUpdate: () => ipcRenderer.invoke("updater:download"),
  onUpdateStatus: (callback) => {
    const handler = (_event, data) => callback(data);
    ipcRenderer.on("updater:status", handler);
    return () => ipcRenderer.removeListener("updater:status", handler);
  },
});
