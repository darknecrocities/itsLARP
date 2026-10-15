const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,
  arch: process.arch,
  getHardwareSpecs: () => ipcRenderer.invoke("system:getHardwareSpecs"),
  checkOllamaStatus: () => ipcRenderer.invoke("ollama:checkStatus"),
  installOllama: () => ipcRenderer.invoke("ollama:autoInstall"),
  startOllama: () => ipcRenderer.invoke("ollama:startDaemon"),
});
