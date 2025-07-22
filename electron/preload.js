const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendLog: (msg) => ipcRenderer.send('log', msg),
  getCookies: (partition) => ipcRenderer.invoke('get-cookies', partition),
})



