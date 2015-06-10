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
  }
}
