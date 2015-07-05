/**
 * Created by JiaHao on 5/7/15.
 */

var ipc = require('ipc');

ipc.on('params', function(message) {

    var appArgs = JSON.parse(message);

    console.log(appArgs.targetUrl);
    console.log(appArgs.name);

    document.title = appArgs.name;

    var webView = document.createElement('webview');

    webView.setAttribute('src', appArgs.targetUrl);
    webView.setAttribute('autosize', 'on');
    webView.setAttribute('minwidth', '600');
    webView.setAttribute('minheight', '800');

    var webViewDiv = document.getElementById('webViewDiv');
    webViewDiv.appendChild(webView);

});

