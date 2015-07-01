var path = require('path')

var mv = require('mv')
var series = require('run-series')
var common = require('./common')

module.exports = {
  createApp: function createApp (opts, templatePath, callback) {
    common.initializeApp(opts, templatePath, path.join('resources', 'app'), function buildWinApp (err, tempPath) {
      if (err) return callback(err)

      var newExePath = path.join(tempPath, opts.name + '.exe')
      var operations = [
        function (cb) {
          mv(path.join(tempPath, 'electron.exe'), newExePath, cb)
        }
      ]

      if (opts.icon || opts['version-string']) {
        operations.push(function (cb) {
          common.normalizeExt(opts.icon, '.ico', function (err, icon) {
            var rcOpts = {}
            if (opts['version-string']) rcOpts['version-string'] = opts['version-string']

            // Icon might be omitted or only exist in one OS's format, so skip it if normalizeExt reports an error
            if (!err) {
              rcOpts.icon = icon
            }

            require('rcedit')(newExePath, rcOpts, cb)
          })
        })
      }

      series(operations, function () {
        common.moveApp(opts, tempPath, callback)
      })
    })
  }
}
