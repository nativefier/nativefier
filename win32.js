var os = require('os')
var path = require('path')

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var ncp = require('ncp').ncp
var mv = require('mv')
var rcedit = require('rcedit')
var common = require('./common')

module.exports = {
  createApp: function createApp (opts, electronApp, cb) {
    var tmpDir = path.join(os.tmpdir(), 'electron-packager-windows')

    var newApp = path.join(tmpDir, opts.name + '-win32')
    // reset build folders + copy template app
    rimraf(tmpDir, function rmrfd () {
      // ignore errors
      mkdirp(newApp, function mkdirpd () {
        // ignore errors
        // copy app folder and use as template (this is exactly what Atom editor does)
        ncp(electronApp, newApp, function copied (err) {
          if (err) return cb(err)
          // rename electron.exe
          mv(path.join(newApp, 'electron.exe'), path.join(newApp, opts.name + '.exe'), function (err) {
            if (err) return cb(err)

            buildWinApp(opts, cb, newApp)
          })
        })
      })
    })
  }
}

function copy (from, to, cb) {
  rimraf(to, function () {
    mkdirp(to, function () {
      ncp(from, to, function (err) {
        if (err) { return cb(err) }
        cb()
      })
    })
  })
}

function buildWinApp (opts, cb, newApp) {
  var paths = {
    app: path.join(newApp, 'resources', 'app')
  }

  // copy users app into destination path
  ncp(opts.dir, paths.app, {filter: common.userIgnoreFilter(opts), dereference: true}, function copied (err) {
    if (err) return cb(err)

    function moveApp () {
      // finally, move app into cwd
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '-win32')
      copy(newApp, finalPath, function moved (err) {
        if (err) return cb(err)
        if (opts.asar) {
          var finalPath = path.join(opts.out || process.cwd(), opts.name + '-win32', 'resources')
          common.asarApp(finalPath, function (err) {
            if (err) return cb(err)
            updateResourceData()
          })
        } else {
          updateResourceData()
        }
      })
    }

    function updateResourceData () {
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '-win32')

      if (!opts.icon && !opts['version-string']) {
        return cb(null, finalPath)
      }

      var exePath = path.join(opts.out || process.cwd(), opts.name + '-win32', opts.name + '.exe')
      var rcOptions = {
        icon: opts.icon,
        'version-string': opts['version-string']
      }
      rcedit(exePath, rcOptions, function (err) {
        cb(err, finalPath)
      })
    }

    common.prune(opts, paths.app, cb, moveApp)
  })
}
