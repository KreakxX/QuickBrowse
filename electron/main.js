import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { Menu } from "electron";
import { ipcMain, session } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
icon: path.join(__dirname, '..', 'src', 'assets', 'Browser.ico'),

    title: "Quick Browse",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,  // Isolates renderer from preload
    sandbox: true,           // Enables sandboxing
    nodeIntegration: false,  // Prevents access to Node.js in web pages
    webviewTag: true,
    },
  });

  win.setMenuBarVisibility(false);
  win.setAutoHideMenuBar(true);
  win.loadURL('http://localhost:5173');
}

ipcMain.handle('get-cookies', async (event, partition) => {
  const ses = session.fromPartition(partition);
  const cookies = await ses.cookies.get({});
  return cookies;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
