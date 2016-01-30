import 'source-map-support/register';
import fs from 'fs';
import path from 'path';
import electron from 'electron';
import createLoginWindow from './components/login/loginWindow';
import createMainWindow from './components/mainWindow/mainWindow';
import helpers from './helpers/helpers';

const {app, ipcMain} = electron;
const {isOSX} = helpers;

const APP_ARGS_FILE_PATH = path.join(__dirname, '..', 'nativefier.json');
const appArgs = JSON.parse(fs.readFileSync(APP_ARGS_FILE_PATH, 'utf8'));

const DEFAULT_ICON_PATH = path.join(__dirname, '..', '/icon.png');
const Tray = electron.Tray;
const Menu = electron.Menu;

let mainWindow;

if (appArgs.insecure) {
    app.commandLine.appendSwitch('ignore-certificate-errors');
}

if (!appArgs.icon) {
    appArgs.icon = DEFAULT_ICON_PATH;
}

// do nothing for setDockBadge if not OSX
let setDockBadge = () => {};

if (isOSX()) {
    setDockBadge = app.dock.setBadge;
}

app.on('window-all-closed', () => {
    // Need a better place to store user options, unless you intend to dump everything into cli
    // determined opts
    if (appArgs.minimizeToTray) {
        mainWindow.hide();
        return;
    }
    if (!isOSX()) {
        app.quit();
    }
});

app.on('activate', (event, hasVisibleWindows) => {
    if (isOSX()) {
        // this is called when the dock is clicked
        if (!hasVisibleWindows) {
            mainWindow.show();
        }
    }
});

app.on('before-quit', () => {
    // not fired when the close button on the window is clicked
    if (isOSX()) {
        // need to force a quit as a workaround here to simulate the osx app hiding behaviour
        // Somehow sokution at https://github.com/atom/electron/issues/444#issuecomment-76492576 does not work,
        // e.prevent default appears to persist

        // might cause issues in the future as before-quit and will-quit events are not called
        app.exit(0);
    }
});

let appIcon = null;
app.on('ready', () => {
    mainWindow = createMainWindow(appArgs, app.quit, setDockBadge);
    mainWindow.on('close', (e)=> {
        if (!mainWindow.forceClose && appArgs.minimizeToTray) {
            e.preventDefault();
            mainWindow.hide();
        }
    });

    appIcon = new Tray(appArgs.icon);
    let menu = Menu.buildFromTemplate([
        // See https://github.com/atom/electron/blob/master/docs/api/tray.md for why
        // there is a shitty option to show
        {
            label: 'Show',
            type: 'normal',
            click: function (menuItem) {
                mainWindow.show();
            }
        },
        {
            label: 'Minimize to Tray',
            type: 'checkbox',
            checked: appArgs.minimizeToTray || true,
            click: function (menuItem) {
                appArgs.minimizeToTray = menuItem.checked;
                fs.writeFileSync(APP_ARGS_FILE_PATH, JSON.stringify(appArgs));
            }
        },
        {
            label: 'Close',
            type: 'normal',
            click: function (menuItem) {
                mainWindow.forceClose = true;
                app.quit();
            }
        }
    ]);
    appIcon.setContextMenu(menu);

});

app.on('login', (event, webContents, request, authInfo, callback) => {
    // for http authentication
    event.preventDefault();
    createLoginWindow(callback);
});

ipcMain.on('notification', (event, title, opts) => {
    if (!isOSX() || mainWindow.isFocused()) {
        return;
    }
    setDockBadge('●');
});
