/**
 * Created by JiaHao on 5/7/15.
 */

var ipc = require('electron').ipcRenderer;

var webViewDiv = document.getElementById('webViewDiv');
webViewDiv.style.visibility = 'hidden';

var webView;

ipc.on('params', function (event, message) {
    var appArgs = JSON.parse(message);
    document.title = appArgs.name;

    webView = document.createElement('webview');
    webView.setAttribute('id', 'webView');
    webView.setAttribute('src', appArgs.targetUrl);
    webView.setAttribute('autosize', 'on');
    webView.setAttribute('minwidth', '100');
    webView.setAttribute('minheight', '100');

    webView.addEventListener('dom-ready', function () {
        if (appArgs.userAgent) {
            webView.setUserAgent(appArgs.userAgent);
        }
    });
    webView.addEventListener('new-window', function (e) {
        require('shell').openExternal(e.url);
    });

    webView.addEventListener('did-finish-load', function (e) {
        webViewDiv.style.visibility = 'visible';
        var loadingContainer = document.getElementById('loading-container');
        loadingContainer.parentNode.removeChild(loadingContainer);

        // We check for desktop notifications by listening to a title change in the webview
        // Not elegant, but it will have to do
        if (appArgs.badge) {
            webView.addEventListener('page-title-set', function (event) {
                ipc.send('notification-message', 'TITLE_CHANGED');
            });
        }
    });



    webViewDiv.appendChild(webView);
});

ipc.on('toggle-dev-tools', function (event, message) {
    if (!message) {
        return;
    }
    if (webView.isDevToolsOpened()) {
        webView.closeDevTools();
    } else {
        webView.openDevTools();
    }
});
