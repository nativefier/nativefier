var path = require('path')
var fs = require('fs')
var child = require('child_process')
var mkdirp = require('mkdirp')
var ncp = require('ncp').ncp
var rimraf = require('rimraf')
var asar = require('asar')

module.exports = {
  createApp: function createApp (opts, cb, electronPath) {
    var templateApp = path.join(electronPath, 'dist')
    var finalDir = opts.out || path.join(process.cwd(), 'dist')
    var userAppDir = path.join(finalDir, 'resources', 'default_app')
    var originalBinary = path.join(finalDir, 'electron')
    var finalBinary = path.join(finalDir, opts.name)

    function copyApp () {
      mkdirp(finalDir, function AppFolderCreated (err) {
        if (err) return cb(err)
        copyAppTemplate()
      })
    }

    function copyAppTemplate () {
      ncp(templateApp, finalDir, {filter: appFilter}, function AppCreated (err) {
        if (err) return cb(err)
        copyUserApp()
      })
    }

    function copyUserApp () {
      ncp(opts.dir, userAppDir, {filter: userFilter}, function copied (err) {
        if (err) return cb(err)
        if (opts.prune) {
          prune(function pruned (err) {
            if (err) return cb(err)
            renameElectronBinary()
          })
        } else {
          renameElectronBinary()
        }
      })
    }

    function renameElectronBinary () {
      fs.rename(originalBinary, finalBinary, function electronRenamed (err) {
        if (err) return cb(err)
        if (opts.asar) {
          asarApp(cb)
        } else {
          cb()
        }
      })
    }

    function prune (cb) {
      child.exec('npm prune --production', { cwd: userAppDir }, cb)
    }

    function appFilter (file) {
      return file.match(/default_app/) === null
    }

    function userFilter (file) {
      var ignore = opts.ignore || []
      if (!Array.isArray(ignore)) ignore = [ignore]
      ignore = ignore.concat([finalDir])
      for (var i = 0; i < ignore.length; i++) {
        if (file.match(ignore[i])) {
          return false
        }
      }
      return true
    }

    function asarApp (cb) {
      var src = path.join(finalDir, 'resources', 'app')
      var dest = path.join(finalDir, 'resources', 'app.asar')
      asar.createPackage(src, dest, function (err) {
        if (err) return cb(err)
        rimraf(src, cb)
      })
    }

    copyApp()
  }
}
