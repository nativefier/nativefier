var exec = require('child_process').exec
var path = require('path')

var series = require('run-series')

var config = require('./config.json')
var util = require('./util')

// Download all Electron distributions before running tests to avoid timing out due to network speed
series([
  function (cb) {
    console.log('Calling electron-download before running tests...')
    util.downloadAll(config.version, cb)
  }, function (cb) {
    console.log('Running npm install in fixtures/basic...')
    exec('npm install', {cwd: path.join(__dirname, 'fixtures', 'basic')}, cb)
  }
], function () {
  console.log('Running tests...')
  require('./basic')
  require('./multitarget')

  if (process.platform !== 'win32') {
    // Perform additional tests specific to building for OS X
    require('./mac')
  }
})
