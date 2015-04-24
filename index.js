var os = require('os')
var path = require('path')
var fs = require('fs')
var child = require('child_process')

var plist = require('plist')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var ncp = require('ncp').ncp

module.exports = function packager (opts, cb) {
  var atomShellPath

  try {
    atomShellPath = require.resolve('atom-shell')
    atomShellPath = path.join(atomShellPath, '..')
  } catch (e) {
    try {
      atomShellPath = require.resolve(path.join(process.execPath, '../../lib/node_modules/atom-shell'))
      atomShellPath = path.join(atomShellPath, '..')
    } catch (e) {
      cb(new Error('Cannot find atom-shell from here, please install it from npm'))
    }
  }

  var atomPkg = require(path.join(atomShellPath, 'package.json'))
  console.error('Using atom-shell version', atomPkg.version, 'from', atomShellPath)

  var atomShellApp = path.join(atomShellPath, 'dist', 'Atom.app')
  var tmpDir = path.join(os.tmpdir(), 'atom-shell-packager-mac')

  var newApp = path.join(tmpDir, opts.name + '.app')

  // reset build folders + copy template app
  rimraf(tmpDir, function rmrfd () {
    // ignore errors
    mkdirp(newApp, function mkdirpd () {
      // ignore errors
      // copy .app folder and use as template (this is exactly what Atom editor does)
      ncp(atomShellApp, newApp, function copied (err) {
        if (err) return cb(err)
        buildMacApp()
      })
    })
  })

  function buildMacApp () {
    var paths = {
      info1: path.join(newApp, 'Contents', 'Info.plist'),
      info2: path.join(newApp, 'Contents', 'Frameworks', 'Atom Helper.app', 'Contents', 'Info.plist'),
      app: path.join(newApp, 'Contents', 'Resources', 'app')
    }

    // update plist files
    var pl1 = plist.parse(fs.readFileSync(paths.info1).toString())
    var pl2 = plist.parse(fs.readFileSync(paths.info2).toString())

    var bundleId = opts['app-bundle-id'] || 'com.atom-shell.' + opts.name.toLowerCase()
    var bundleHelperId = opts['helper-bundle-id'] || 'com.atom-shell.' + opts.name.toLowerCase() + '.helper'

    pl1.CFBundleDisplayName = opts.name
    pl1.CFBundleIdentifier = bundleId
    pl1.CFBundleName = opts.name
    pl2.CFBundleIdentifier = bundleHelperId
    pl2.CFBundleName = opts.name

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
          updateMacIcon()
        })
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
}
