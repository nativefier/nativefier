var os = require('os')
var path = require('path')
var fs = require('fs')
var child = require('child_process')

var plist = require('plist')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var ncp = require('ncp').ncp
var asar = require('asar')

module.exports = {
  createApp: function createApp (opts, cb, electronPath) {
    var electronApp = path.join(electronPath, 'dist', 'Electron.app')
    var tmpDir = path.join(os.tmpdir(), 'electron-packager-mac')

    var newApp = path.join(tmpDir, opts.name + '.app')

    // reset build folders + copy template app
    rimraf(tmpDir, function rmrfd () {
      // ignore errors
      mkdirp(newApp, function mkdirpd () {
        // ignore errors
        // copy .app folder and use as template (this is exactly what Atom editor does)
        ncp(electronApp, newApp, function copied (err) {
          if (err) return cb(err)
          buildMacApp(opts, cb, newApp)
        })
      })
    })
  }
}

function buildMacApp (opts, cb, newApp) {
  var paths = {
    info1: path.join(newApp, 'Contents', 'Info.plist'),
    info2: path.join(newApp, 'Contents', 'Frameworks', 'Electron Helper.app', 'Contents', 'Info.plist'),
    app: path.join(newApp, 'Contents', 'Resources', 'app')
  }

  // update plist files
  var pl1 = plist.parse(fs.readFileSync(paths.info1).toString())
  var pl2 = plist.parse(fs.readFileSync(paths.info2).toString())

  var bundleId = opts['app-bundle-id'] || 'com.electron.' + opts.name.toLowerCase()
  var bundleHelperId = opts['helper-bundle-id'] || 'com.electron.' + opts.name.toLowerCase() + '.helper'
  var appVersion = opts['app-version']

  pl1.CFBundleDisplayName = opts.name
  pl1.CFBundleIdentifier = bundleId
  pl1.CFBundleName = opts.name
  pl2.CFBundleIdentifier = bundleHelperId
  pl2.CFBundleName = opts.name

  if (appVersion) {
    pl1.CFBundleVersion = appVersion
  }

  if (opts.protocols) {
    pl2.CFBundleURLTypes = pl1.CFBundleURLTypes = opts.protocols.map(function (protocol) {
      return {
        CFBundleURLName: protocol.name,
        CFBundleURLSchemes: [].concat(protocol.schemes)
      }
    })
  }

  fs.writeFileSync(paths.info1, plist.build(pl1))
  fs.writeFileSync(paths.info2, plist.build(pl2))

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

      fs.rename(newApp, finalPath, function moved (err) {
        if (err) return cb(err)
        if (opts.asar) {
          asarApp(function (err) {
            if (err) return cb(err)
            updateMacIcon()
          })
        } else {
          updateMacIcon()
        }
      })
    }

    function updateMacIcon () {
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '.app')

      if (!opts.icon) {
        return cb(null, finalPath)
      }

      ncp(opts.icon, path.join(finalPath, 'Contents', 'Resources', 'atom.icns'), function copied (err) {
        cb(err, finalPath)
      })
    }

    function asarApp (cb) {
      var finalPath = path.join(opts.out || process.cwd(), opts.name + '.app', 'Contents', 'Resources')
      var src = path.join(finalPath, 'app')
      var dest = path.join(finalPath, 'app.asar')
      asar.createPackage(src, dest, function (err) {
        if (err) return cb(err)
        rimraf(src, cb)
      })
    }
  })
}
