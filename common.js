var asar = require('asar')
var child = require('child_process')
var path = require('path')
var rimraf = require('rimraf')

module.exports = {
  asarApp: function asarApp (finalDir, cb) {
    var src = path.join(finalDir, 'app')
    var dest = path.join(finalDir, 'app.asar')
    asar.createPackage(src, dest, function (err) {
      if (err) return cb(err)
      rimraf(src, function (err) {
        if (err) return cb(err)
        cb(null, dest)
      })
    })
  },

  prune: function prune (opts, cwd, cb, nextStep) {
    if (opts.prune) {
      child.exec('npm prune --production', { cwd: cwd }, function pruned (err) {
        if (err) return cb(err)
        nextStep()
      })
    } else {
      nextStep()
    }
  },

  userIgnoreFilter: function userIgnoreFilter (opts, finalDir) {
    return function filter (file) {
      if (path.sep === '\\') {
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
