var electron = require('electron');
var Menu = electron.Menu;

module.exports = function (app, mainWindow) {
    if (Menu.getApplicationMenu())
        return;

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
                },
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: function(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.reload();
                    }
                },
                {
                    label: 'Toggle Full Screen',
                    accelerator: (function() {
                        if (process.platform == 'darwin')
                            return 'Ctrl+Command+F';
                        else
                            return 'F11';
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
                    }
                },
                {
                    label: 'Toggle Window Developer Tools',
                    accelerator: (function() {
                        if (process.platform == 'darwin')
                            return 'Alt+Command+I';
                        else
                            return 'Ctrl+Shift+I';
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow)
                            focusedWindow.toggleDevTools();
                    }
                },
                {
                    label: 'Toggle Web Developer Tools',
                    accelerator: (function() {
                        if (process.platform == 'darwin')
                            return 'Alt+Command+J';
                        else
                            return 'Ctrl+Shift+J';
                    })(),
                    click: function(item, focusedWindow) {
                        if (focusedWindow) {
                            mainWindow.webContents.send('toggle-dev-tools', true);
                        }

                    }
                },
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
                },
            ]
        },
        {
            label: 'Help',
            role: 'help',
            submenu: [
                {
                    label: 'Learn More',
                    click: function() { shell.openExternal('http://electron.atom.io') }
                },
                {
                    label: 'Documentation',
                    click: function() {
                        shell.openExternal(
                            `https://github.com/atom/electron/tree/v${process.versions.electron}/docs#readme`
                        )
                    }
                },
                {
                    label: 'Community Discussions',
                    click: function() { shell.openExternal('https://discuss.atom.io/c/electron') }
                },
                {
                    label: 'Search Issues',
                    click: function() { shell.openExternal('https://github.com/atom/electron/issues') }
                }
            ]
        },
    ];

    if (process.platform == 'darwin') {
        template.unshift({
            label: 'Electron',
            submenu: [
                {
                    label: 'About Electron',
                    role: 'about'
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Services',
                    role: 'services',
                    submenu: []
                },
                {
                    type: 'separator'
                },
                {
                    label: 'Hide Electron',
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
                    click: function() { app.quit(); }
                },
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
};
