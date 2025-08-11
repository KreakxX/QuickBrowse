const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  sendLog: (msg) => ipcRenderer.send('log', msg),
  getCookies: (partition) => ipcRenderer.invoke('get-cookies', partition),
  historysave: (url, favicon) => ipcRenderer.invoke('history:save', url, favicon),
  historyload: () => ipcRenderer.invoke('history:load'),
  addNewBookmark: (url, favicon) => ipcRenderer.invoke('bookmarks:save', url, favicon),
  loadAllBookmarks: () => ipcRenderer.invoke("bookmarks:load"),
  addNewSavedtab: (url, favicon, id) => ipcRenderer.invoke('savedTabs:add',url,favicon,id),
  loadSavedTab: () => ipcRenderer.invoke('savedTabs:load'),
  deleteSavedTab: (id) => ipcRenderer.invoke('savedTabs:delete',id)
})
