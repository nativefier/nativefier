var os = require('os')
var path = require('path')

module.exports = function packager (opts, cb) {
  var electronPath
  var platform

  try {
    electronPath = require.resolve('electron-prebuilt')
    electronPath = path.join(electronPath, '..')
  } catch (e) {
    try {
      electronPath = require.resolve(path.join(process.execPath, '../../lib/node_modules/electron-prebuilt'))
      electronPath = path.join(electronPath, '..')
    } catch (e) {
      cb(new Error('Cannot find electron-prebuilt from here, please install it from npm'))
    }
  }

  var electronPkg = require(path.join(electronPath, 'package.json'))
  console.error('Using electron-prebuilt version', electronPkg.version, 'from', electronPath)

  switch (os.platform()) {
    case 'darwin': platform = require('./mac'); break
    case 'linux': platform = require('./linux'); break
    case 'win32': platform = require('./windows'); break
    default: cb(new Error('Unsupported platform'))
  }

  platform.createApp(opts, cb, electronPath)
}
