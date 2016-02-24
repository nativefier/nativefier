import {Menu, shell, clipboard, dialog} from 'electron';

/**
 *
 * @param {string} nativefierVersion
 * @param {function} onQuit should be from app.quit
 * @param {function} onGoBack
 * @param {electron} onGoForward
 * @param {function} onZoomIn
 * @param {function} onZoomOut
 * @param {function} getUrl
 */
function createMenu(nativefierVersion, onQuit, onGoBack, onGoForward, onZoomIn, onZoomOut, getUrl) {
    if (Menu.getApplicationMenu()) {
        return;
    }

    const template = [
        {
            label: 'Edit',
            submenu: [
                {
                    label: 'Undo',
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: 'Redo',
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Cut',
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: 'Copy',
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: 'Copy Current URL',
                    accelerator: 'CmdOrCtrl+C',
                    click: () => {
                        const currentURL = getUrl();
                        clipboard.writeText(currentURL);
                    }
                },
                {
                    label: 'Paste',
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: 'Select All',
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Back',
                    accelerator: 'CmdOrCtrl+[',
                    click: () => {
                        onGoBack();
                    }
                },
                {
                    label: 'Forward',
                    accelerator: 'CmdOrCtrl+]',
                    click: () => {
                        onGoForward();
                    }
                },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.reload();
                        }
                    }
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F';
                        }
                        return 'F11';
                    })(),
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                {
                    label: 'Zoom In',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Command+=';
                        }
                        return 'Ctrl+=';
                    })(),
                    click: () => {
                        onZoomIn();
                    }
                },
                {
                    label: 'Zoom Out',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Command+-';
                        }
                        return 'Ctrl+-';
                    })(),
                    click: () => {
                        onZoomOut();
                    }
                },
                {
                    label: 'Clear App Data',
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            dialog.showMessageBox(focusedWindow, {
                                type: 'warning',
                                buttons: ['Yes', 'Cancel'],
                                defaultId: 1,
                                title: 'Clear cache confirmation',
                                message: 'This will clear all data (cookies, local storage etc) from this app. Are you sure you wish to proceed?'
                            }, response => {
                                if (response === 0) {
                                    focusedWindow.webContents.session.clearStorageData({},
                                    () => {
                                        focusedWindow.webContents.session.clearCache(() => {
                                            focusedWindow.reload();
                                        });
                                    });
                    }
                },
                {
                    label: 'Toggle Window Developer Tools',
                    accelerator: (() => {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I';
                        }
                        return 'Ctrl+Shift+I';
                    })(),
                    click: (item, focusedWindow) => {
                        if (focusedWindow) {
                            focusedWindow.toggleDevTools();
                        }
                    }
                }
            ]
        },
        {
            label: 'Window',
            role: 'window',
            submenu: [
                {
                    label: 'Minimize',
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: 'Close',
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                }
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: `Built with Nativefier v${nativefierVersion}`,
                    click: () => {
                        shell.openExternal('https://github.com/jiahaog/nativefier');
                    }
                },
                {
                    label: 'Report an Issue',
                    click: () => {
                        shell.openExternal('https://github.com/jiahaog/nativefier/issues');
                    }
                }
            ]
        }
    ];

    if (process.platform === 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide App',
                    accelerator: 'Command+H',
                    role: 'hide'
                },
                {
                    label: 'Hide Others',
                    accelerator: 'Command+Shift+H',
                    role: 'hideothers'
                },
                {
                    label: 'Show All',
                    role: 'unhide'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Quit',
                    accelerator: 'Command+Q',
                    click: () => {
                        onQuit();
                    }
                }
            ]
        });
        template[3].submenu.push(
            {
                type: 'separator'
            },
            {
                label: 'Bring All to Front',
                role: 'front'
            }
        );
    }

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

export default createMenu;
