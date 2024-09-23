import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import {activeWindow} from 'active-win';

let win = null;

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);
const gotTheLock = app.requestSingleInstanceLock()
    
if (!gotTheLock) {
  app.quit()
}

function createMainWindow () {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    show:false,
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools();
  win.setAlwaysOnTop(true,"normal");

  ipcActions();
}

function createAppRunningWindow() {
  const appRunningNotifWindow = new BrowserWindow({
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
  });

  appRunningNotifWindow.loadFile('app_running_notification/app_running_notification.html');
  appRunningNotifWindow.setAlwaysOnTop(true,"normal");

  setTimeout(() => {
    appRunningNotifWindow.close()
  }, 5000);
}


async function isGameOn() {
  const window = await activeWindow();
  if(window){
    return window.title === 'Path of Exile' || window.title === 'POE AI PRICER';
  }
}
  
function ipcActions() {
  ipcMain.on('open-window', async (event) => {
    win.show();
  });

  ipcMain.on('close-window', (event) => {
    win.hide();
    win.blur();
  
  });
}

function createTray() {
  const meun = [
    {
      id: 'Exit', label: 'Exit', click: () => {
        app.quit();
      }
    },
  ];
  let tray = new Tray(path.resolve(__dirname, 'poeicon.png'));
  const contextMenu = Menu.buildFromTemplate(meun);
  tray.setToolTip('Application running in the background');
  tray.setContextMenu(contextMenu);
}

app.whenReady().then(() => {
  ipcMain.handle('is-game-on', isGameOn);
  createAppRunningWindow();
  createMainWindow();
  createTray();
});

