import { app, BrowserWindow, ipcMain, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import {activeWindow} from 'active-win';

let mainWindow = null;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//manage single instance of the app.
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  exitApp();
}

function createMainWindow () {
  mainWindow = new BrowserWindow({
    width:900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
    show:false,
  });

  mainWindow.loadFile('index.html');
  mainWindow.setAlwaysOnTop(true,"normal");

  createIpcActions();
}

function createWelcomingPopupWindow() {
  const welcomePopupWindow = new BrowserWindow({
    frame: false,
    autoHideMenuBar: true,
    transparent: true,
  });

  welcomePopupWindow.loadFile('welcoming_popup_window/welcoming_popup_window.html');
  welcomePopupWindow.setAlwaysOnTop(true,"normal");

  setTimeout(() => {
    welcomePopupWindow.close()
  }, 5000);
}

function createTray() {
  const meun = [
    {
      id: 'show-app', label: 'Show app', click: () => showApp()
    },
    {
      id: 'exit', label: 'Exit', click: () => exitApp()
    }
  ];

  let tray = new Tray(path.resolve(__dirname, 'assets/poeicon.png'));
  const contextMenu = Menu.buildFromTemplate(meun);
  tray.on('click',() => showApp());
  tray.setToolTip('Application running in the background');
  tray.setContextMenu(contextMenu);
}

function createIpcActions() {
  ipcMain.on('open-window', async () => showApp());

  ipcMain.on('close-window', (event) => {
    minimizeApp();
  });

  ipcMain.on('exit-app', (event) => {
    exitApp();
  });
}

function initailzeApp() {
  ipcMain.handle('is-game-on', isGameOn);
  createWelcomingPopupWindow();
  createMainWindow();
  createTray();
}


//manage if we are on the game, this should be used to listen to ctrl-c/ctrl-v or not
async function isGameOn() {
  const window = await activeWindow();
  if(window){
    return window.title === 'Path of Exile' || window.title === 'POE AI PRICER';
  }
}

app.whenReady().then(() => {
  initailzeApp();
});


function exitApp() {
  app.quit();
}

function showApp() {
  mainWindow.show();
}

function minimizeApp() {
  mainWindow.hide();
  mainWindow.blur();
}



