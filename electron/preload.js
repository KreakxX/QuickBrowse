const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendLog: (msg) => ipcRenderer.send('log', msg),
  getCookies: (partition) => ipcRenderer.invoke('get-cookies', partition),
  historysave: (url, favicon) => ipcRenderer.invoke('history:save', url, favicon),
  historyload: () => ipcRenderer.invoke('history:load'),
})
