const { contextBridge, ipcRenderer } = require('electron');
let newTabCallback = null;

ipcRenderer.on('create-new-tab', (event, url) => {
  if (newTabCallback) {
    newTabCallback(url);
  }
});
contextBridge.exposeInMainWorld('electronAPI', {
  sendLog: (msg) => ipcRenderer.send('log', msg),
  getCookies: (partition) => ipcRenderer.invoke('get-cookies', partition),
  historysave: (url, favicon) => ipcRenderer.invoke('history:save', url, favicon),
  historyload: () => ipcRenderer.invoke('history:load'),
  historyDelete: () => ipcRenderer.invoke('history:delete'),
  addNewBookmark: (url, favicon,id) => ipcRenderer.invoke('bookmarks:save', url, favicon,id),
  loadAllBookmarks: () => ipcRenderer.invoke("bookmarks:load"),
  removeBookMark: (id) => ipcRenderer.invoke('bookmarks:delete',id),
  addNewSavedtab: (url, favicon, id) => ipcRenderer.invoke('savedTabs:add',url,favicon,id),
  loadSavedTab: () => ipcRenderer.invoke('savedTabs:load'),
  deleteSavedTab: (id) => ipcRenderer.invoke('savedTabs:delete',id),
  addNewYoutubePopup: (url)=> ipcRenderer.invoke('popup:create',url),
  removeYoutubePopup: () => ipcRenderer.invoke("popup:close"),
  saveImage: (url) => ipcRenderer.invoke("saveImage",url),
  addTab: (id,url,favicon) => ipcRenderer.invoke('tabs:add',id,url,favicon),
  removeTab: (id) => ipcRenderer.invoke('tabs:remove',id),
  loadTabs: () => ipcRenderer.invoke('tabs:load'),
  updateTabURL: (id,url) => ipcRenderer.invoke('tabs:updateUrl',id,url),
  updateTabTitle: (id, title) => ipcRenderer.invoke('tabs:updateTitle',id,title),
 setNewTabCallback: (callback) => {
    newTabCallback = callback;
  }
})




