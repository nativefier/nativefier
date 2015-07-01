var app = require('app')
var BrowserWindow = require('browser-window')
var mainWindow

app.on('window-all-closed', function () {
  app.quit()
})

app.on('ready', function () {
  mainWindow = new BrowserWindow({
    center: true,
    title: 'Basic Test',
    width: 800,
    height: 600
  })

  mainWindow.loadUrl('file://' + require('path').resolve(__dirname, 'index.html'))

  mainWindow.on('closed', function () {
    mainWindow = null
  })
})
