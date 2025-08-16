import { app, BrowserWindow, session, nativeImage  } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { Menu } from "electron";
import { ipcMain } from 'electron';
import { saveHistory, loadHistory } from './history.js';
import fetch from 'node-fetch';
import { addBookmark, loadBookmarks } from './Bookmarks.js';
import { addSavedTab, loadAllSavedTabs,deleteSavedTab } from './savedTabs.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
    const transparentIcon = nativeImage.createEmpty();

  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: transparentIcon,
    title: "",
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
  win.loadURL('http://localhost:5173');
}

ipcMain.handle('get-cookies', async (_event, partition) => {
  const ses = session.fromPartition(partition);
  const cookies = await ses.cookies.get({});
  return cookies;
});



ipcMain.handle('history:save',(_event, url, favicon)=>{
  saveHistory(url,favicon);
})

ipcMain.handle('history:load',(_event)=>{
  return loadHistory();
})

ipcMain.handle('bookmarks:save', (_event, url,favicon)=>{
  addBookmark(url,favicon);
})

ipcMain.handle('bookmarks:load', (_event)=>{
  return loadBookmarks();
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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.commandLine.appendSwitch("disable-renderer-backgrounding");
app.commandLine.appendSwitch("disable-background-timer-throttling");
app.commandLine.appendSwitch("disable-backgrounding-occluded-windows");
app.commandLine.appendSwitch("disable-features", "SitePerProcess,TranslateUI,BlinkGenPropertyTrees");


app.commandLine.appendSwitch("max_old_space_size", "4096");
app.commandLine.appendSwitch("js-flags", "--max-old-space-size=4096");
app.commandLine.appendSwitch("disable-dev-shm-usage");

app.commandLine.appendSwitch("enable-gpu-rasterization");
app.commandLine.appendSwitch("enable-zero-copy");
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app.commandLine.appendSwitch("disable-gpu-sandbox");

app.commandLine.appendSwitch("aggressive-cache-discard");
app.commandLine.appendSwitch("enable-quic");
app.commandLine.appendSwitch("enable-tcp-fast-open");