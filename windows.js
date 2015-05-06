var os = require('os')
var path = require('path')
var child = require('child_process')

var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var ncp = require('ncp').ncp
var asar = require('asar')
var mv = require('mv')
var rcedit = require('rcedit')

module.exports = {
  createApp: function createApp (opts, cb, electronPath) {
    var electronApp = path.join(electronPath, 'dist')
    var tmpDir = path.join(os.tmpdir(), 'electron-packager-windows')

    var newApp = path.join(tmpDir, opts.name + '.app')
    console.log('newApp', newApp)
    // reset build folders + copy template app
    rimraf(tmpDir, function rmrfd () {
      // ignore errors
      mkdirp(newApp, function mkdirpd () {
        // ignore errors
        // copy .app folder and use as template (this is exactly what Atom editor does)
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

  function filter (file) {
    var ignore = opts.ignore || []
    if (!Array.isArray(ignore)) ignore = [ignore]
    for (var i = 0; i < ignore.length; i++) {
      if (file.match(ignore[i])) {
        return false
      }
    }
    return true
  }

  // copy users app into .app
  ncp(opts.dir, paths.app, {filter: filter}, function copied (err) {
    if (err) return cb(err)

    if (opts.prune) {
      prune(function pruned (err) {
        if (err) return cb(err)
        moveApp()
      })
    } else {
      moveApp()
    }

    function prune (cb) {
      child.exec('npm prune --production', { cwd: paths.app }, cb)
    }

    function moveApp () {
      // finally, move app into cwd
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '.app')
      console.log('finalPath', finalPath)
      copy(newApp, finalPath, function moved (err) {
        if (err) return cb(err)
        if (opts.asar) {
          asarApp(function (err) {
            if (err) return cb(err)
            updateIcon()
          })
        } else {
          updateIcon()
        }
      })
    }

    function updateIcon () {
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '.app')

      if (!opts.icon) {
        return cb(null, finalPath)
      }

      var exePath = path.join(opts.out || process.cwd(), opts.name + '.app', opts.name + '.exe')

      rcedit(exePath, {icon: opts.icon}, function (err) {
        cb(err, finalPath)
      })

    }

    function asarApp (cb) {
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '.app', 'resources')
      var src = path.join(finalPath, 'app')
      var dest = path.join(finalPath, 'app.asar')
      asar.createPackage(src, dest, function (err) {
        if (err) return cb(err)
        rimraf(src, cb)
      })
    }
  })
}
