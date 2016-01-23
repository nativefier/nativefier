var electron = require('electron');
var Menu = electron.Menu;
var shell = electron.shell;

/**
 *
 * @param {string} nativefierVersion
 * @param {function} onQuit should be from app.quit
 * @param {function} onGoBack
 * @param {electron} onGoForward
 * @param {function} onZoomIn
 * @param {function} onZoomOut
 */
function createMenu(nativefierVersion, onQuit, onGoBack, onGoForward, onZoomIn, onZoomOut) {
    if (Menu.getApplicationMenu()) {
        return;
    }

    var template = [
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
                    click: function() {
                        onGoBack();
                    }
                },
                {
                    label: 'Forward',
                    click: function() {
                        onGoForward();
                    }
                },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
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
                    accelerator: (function() {
                        if (process.platform === 'darwin') {
                            return 'Ctrl+Command+F';
                        }
                        return 'F11';
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                        }
                    }
                },
                {
                    label: 'Zoom In',
                    accelerator: (function() {
                        if (process.platform === 'darwin') {
                            return 'Command+=';
                        }
                        return 'Ctrl+=';
                    })(),
                    click: function() {
                        onZoomIn();
                    }
                },
                {
                    label: 'Zoom Out',
                    accelerator: (function() {
                        if (process.platform === 'darwin') {
                            return 'Command+-';
                        }
                        return 'Ctrl+-';
                    })(),
                    click: function() {
                        onZoomOut();
                    }
                },
                {
                    label: 'Toggle Window Developer Tools',
                    accelerator: (function() {
                        if (process.platform === 'darwin') {
                            return 'Alt+Command+I';
                        }
                        return 'Ctrl+Shift+I';
                    })(),
                    click: function(item, focusedWindow) {
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
                    click: function() {
                        shell.openExternal('https://github.com/jiahaog/nativefier');
                    }
                },
                {
                    label: 'Report an Issue',
                    click: function() {
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
                    click: function() {
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

    var menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

module.exports = createMenu;
