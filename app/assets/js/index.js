/**
 * Created by JiaHao on 5/7/15.
 */

var ipc = require('ipc');

ipc.on('params', function(message) {

    var appArgs = JSON.parse(message);
    console.log(appArgs);
    document.title = appArgs.name;

    var webView = document.createElement('webview');

    webView.setAttribute('id', 'webView');
    webView.setAttribute('src', appArgs.targetUrl);
    webView.setAttribute('autosize', 'on');
    webView.setAttribute('minwidth', '100');
    webView.setAttribute('minheight', '100');

    webView.addEventListener('new-window', function(e) {
        require('shell').openExternal(e.url);
    });

    // We check for desktop notifications by listening to a title change in the webview
    // Not elegant, but it will have to do
    if (appArgs.badge) {
        webView.addEventListener('did-finish-load', function(e) {
            webView.addEventListener('page-title-set', function(event) {
                ipc.send('notification-message', 'TITLE_CHANGED');
            });
        });
    }

    var webViewDiv = document.getElementById('webViewDiv');
    webViewDiv.appendChild(webView);

    Mousetrap.bind('mod+c', function(e) {
        var webView = document.getElementById('webView');
        webView.copy();
    });

    Mousetrap.bind('mod+x', function(e) {
        var webView = document.getElementById('webView');
        webView.cut();
    });

    Mousetrap.bind('mod+v', function(e) {
        var webView = document.getElementById('webView');
        webView.paste();
    });

    Mousetrap.bind('mod+a', function(e) {
        var webView = document.getElementById('webView');
        webView.selectAll();
    });

    Mousetrap.bind('mod+z', function(e) {
        var webView = document.getElementById('webView');
        webView.undo();
    });
});

