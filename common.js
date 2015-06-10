var asar = require('asar')
var path = require('path')
var rimraf = require('rimraf')

module.exports = {
  asarApp: function asarApp (finalDir, cb) {
    var src = path.join(finalDir, 'resources', 'app')
    var dest = path.join(finalDir, 'resources', 'app.asar')
    asar.createPackage(src, dest, function (err) {
      if (err) return cb(err)
      rimraf(src, function (err) {
        if (err) return cb(err)
        cb(null, dest)
      })
    })
  },

  userIgnoreFilter: function userIgnoreFilter (opts, is_win32, finalDir) {
    return function filter (file) {
      if (is_win32) {
        // convert slashes so unix-format ignores work
        file = file.replace(/\\/g, '/')
      }

      var ignore = opts.ignore || []
      if (!Array.isArray(ignore)) ignore = [ignore]
      if (typeof finalDir !== 'undefined') {
        ignore = ignore.concat([finalDir])
      }
      for (var i = 0; i < ignore.length; i++) {
        if (file.match(ignore[i])) {
          return false
        }
      }
      return true
    }
  }
}
