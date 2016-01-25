var electronPublicApi = [
    'electron',
    // for modules which use deprecated api
    // modules are taken from https://github.com/atom/electron/tree/master/docs/api
    'app',
    'screen'

    // Uncomment as needed if some external module uses the deprecated api

    // 'accelerator',
    // 'auto-updater',
    // 'browser-window',
    // 'chrome-command-line-switches',
    // 'clipboard',
    // 'content-tracing',
    // 'crash-reporter',
    // 'desktop-capturer',
    // 'dialog',
    // 'download-item',
    // 'environment-variables',
    // 'file-object',
    // 'frameless-window',
    // 'global-shortcut',
    // 'ipc-main',
    // 'ipc-renderer',
    // 'menu-item',
    // 'menu',
    // 'native-image',
    // 'power-monitor',
    // 'power-save-blocker',
    // 'process',
    // 'protocol',
    // 'remote',
    // 'session',
    // 'shell',
    // 'synopsis',
    // 'tray',
    // 'web-contents',
    // 'web-frame',
    // 'web-view-tag',
    // 'window-open'
];

var nodeModules = {};
electronPublicApi.forEach(apiString => {
    nodeModules[apiString] = 'commonjs ' + apiString;
});

module.exports = {
    target: 'node',
    output: {
        filename: 'main.js'
    },
    node: {
        global: false,
        __dirname: false
    },
    externals: nodeModules,
    module: {
        loaders: [
            {test: /\.js$/, exclude: /node_modules/, loader: 'babel-loader'}
        ]
    },
    devtool: 'source-map'
};
