import { app,screen, BrowserWindow, session, nativeImage  } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { Menu } from "electron";
import { ipcMain } from 'electron';
import { saveHistory, loadHistory, deleteHistory } from './history.js';
import fetch from 'node-fetch';
import { addBookmark, loadBookmarks, removeBookMark } from './Bookmarks.js';
import { addSavedTab, loadAllSavedTabs,deleteSavedTab } from './savedTabs.js';
import { deleteTab, loadTabs, saveTab } from './tabs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const transparentIcon = nativeImage.createEmpty();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/Logo.png'),
    title: "",
    titleBarOverlay: {
  color: "#09090b",   // Hintergrund
  symbolColor: "#52525b" // Buttons
},
    // frame: false, // Remove the default frame to create custom titlebar
    // titleBarStyle: 'hidden',
    webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,  // Isolates renderer from preload
    sandbox: true,           // Enables sandboxing, neccessary for the search history
    nodeIntegration: false,  // Prevents access to Node.js in web pages
    webviewTag: true,
    partition: 'persist:main'    // this was neccessary for enabling indexedDB for Youtube API to work
    },
  });

  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);
  win.loadURL("http://localhost:5173");

}

let PopUpWindow = null;

// Function to add the new YoutubePopUp
function createNewPopUp(url) {
  if (PopUpWindow && !PopUpWindow.isDestroyed()) {
    PopUpWindow.close();
  }
PopUpWindow = new BrowserWindow({
    width: 600,
    height: 400,
    title: url,
    x: 100, 
    y: 100, 
    alwaysOnTop: true, 
    
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webviewTag: true,
      partition: "persist:main",
    },
  });

  PopUpWindow.setMenuBarVisibility(false);
  PopUpWindow.setAutoHideMenuBar(true);
  PopUpWindow.loadURL(url);

  PopUpWindow.on("close", () =>{
    PopUpWindow = null;
  });
  PopUpWindow.setAlwaysOnTop(true, "screen-saver");

  
}



function removeNewYoutubePopUp(){
  if (PopUpWindow && !PopUpWindow.isDestroyed()) {
    PopUpWindow.close();
  }
  PopUpWindow = null;
}



ipcMain.handle("popup:create", async(_event, url)=>{
  createNewPopUp(url);
})

ipcMain.handle("popup:close",async (_event)=>{
  removeNewYoutubePopUp();
})

ipcMain.handle('get-cookies', async (_event, partition) => {
  const ses = session.fromPartition(partition);
  const cookies = await ses.cookies.get({});
  return cookies;
});

ipcMain.handle("saveImage", (event,url)=>{
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.webContents.downloadURL(url); 
  }
})

ipcMain.handle('history:save',(_event, url, favicon)=>{
  saveHistory(url,favicon);
})

ipcMain.handle('history:load',(_event)=>{
  return loadHistory();
})

ipcMain.handle("history:delete", (_event) => {
  return deleteHistory();
})

ipcMain.handle('bookmarks:save', (_event, url,favicon,id)=>{
  addBookmark(url,favicon,id);
})

ipcMain.handle('bookmarks:load', (_event)=>{
  return loadBookmarks();
})

ipcMain.handle('bookmarks:delete', (_event,id) => {
  return removeBookMark(id);
})

ipcMain.handle('savedTabs:add', (_event, url, favicon, id) => {
  addSavedTab(url,favicon,id)
})

ipcMain.handle('savedTabs:load', (_event) =>{
  return loadAllSavedTabs();
})

ipcMain.handle('savedTabs:delete', (_event,id)=>{
  return deleteSavedTab(id);
})

ipcMain.handle('tabs:add', (_event,id, url, favicon,title) => {
  saveTab(id,url,favicon,title);
})

ipcMain.handle('tabs:remove', (_event,id)=>{
  deleteTab(id);
})

ipcMain.handle('tabs:load',(_event)=>{
  loadTabs();
})

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.commandLine.appendSwitch("disable-features", "SitePerProcess,VizDisplayCompositor");
app.commandLine.appendSwitch("disable-site-isolation-trials");

app.commandLine.appendSwitch("renderer-process-limit", "4");
app.commandLine.appendSwitch("max_active_webgl_contexts", "8");

app.commandLine.appendSwitch("enable-features", "VaapiVideoDecoder,VaapiIgnoreDriverChecks");
app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-oop-rasterization");
app.commandLine.appendSwitch("disable-software-rasterizer");

app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("disable-gpu-driver-bug-workarounds");

app.commandLine.appendSwitch("max_old_space_size", "4096");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");

app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("enable-tcp-fast-open");
app.commandLine.appendSwitch("aggressive-cache-discard");

app.commandLine.appendSwitch("disable-features", "SitePerProcess,VizDisplayCompositor,TranslateUI,AutofillServerCommunication");
app.commandLine.appendSwitch("disable-component-extensions-with-background-pages");
app.commandLine.appendSwitch("disable-default-apps");
app.commandLine.appendSwitch("disable-extensions");

app.commandLine.appendSwitch("disable-background-media-suspend");
app.commandLine.appendSwitch("autoplay-policy", "no-user-gesture-required");

