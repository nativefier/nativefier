var child = require('child_process')
var fs = require('fs')
var os = require('os')
var path = require('path')

var asar = require('asar')
var mkdirp = require('mkdirp')
var ncp = require('ncp').ncp
var rimraf = require('rimraf')
var series = require('run-series')

function asarApp (appPath, cb) {
  var src = path.join(appPath)
  var dest = path.join(appPath, '..', 'app.asar')
  asar.createPackage(src, dest, function (err) {
    if (err) return cb(err)
    rimraf(src, function (err) {
      if (err) return cb(err)
      cb(null, dest)
    })
  })
}

function generateFinalBasename (opts) {
  return opts.name + '-' + opts.platform + '-' + opts.arch
}

function generateFinalPath (opts) {
  return path.join(opts.out || process.cwd(), generateFinalBasename(opts))
}

function userIgnoreFilter (opts) {
  return function filter (file) {
    file = file.split(path.resolve(opts.dir))[1]

    if (path.sep === '\\') {
      // convert slashes so unix-format ignores work
      file = file.replace(/\\/g, '/')
    }

    var ignore = opts.ignore || []
    if (!Array.isArray(ignore)) ignore = [ignore]
    for (var i = 0; i < ignore.length; i++) {
      if (file.match(ignore[i])) {
        return false
      }
    }
    return true
  }
}

module.exports = {
  generateFinalPath: generateFinalPath,

  initializeApp: function initializeApp (opts, templatePath, appRelativePath, callback) {
    // Performs the following initial operations for an app:
    // * Creates temporary directory
    // * Copies template into temporary directory
    // * Copies user's app into temporary directory
    // * Prunes non-production node_modules (if opts.prune is set)
    // * Creates an asar (if opts.asar is set)

    var tempParent = path.join(os.tmpdir(), 'electron-packager', opts.platform + '-' + opts.arch)
    var tempPath = path.join(tempParent, generateFinalBasename(opts))
    // Path to `app` directory
    var appPath = path.join(tempPath, appRelativePath)

    var operations = [
      function (cb) {
        rimraf(tempParent, function () {
          // Ignore errors (e.g. directory didn't exist anyway)
          cb()
        })
      },
      function (cb) {
        mkdirp(tempPath, cb)
      },
      function (cb) {
        ncp(templatePath, tempPath, cb)
      },
      function (cb) {
        ncp(opts.dir, appPath, {filter: userIgnoreFilter(opts), dereference: true}, cb)
      }
    ]

    // Prune and asar are now performed before platform-specific logic, primarily so that
    // appPath is predictable (e.g. before .app is renamed for mac)
    if (opts.prune) {
      operations.push(function (cb) {
        child.exec('npm prune --production', {cwd: appPath}, cb)
      })
    }

    if (opts.asar) {
      operations.push(function (cb) {
        asarApp(path.join(appPath), cb)
      })
    }

    series(operations, function (err) {
      if (err) return callback(err)
      // Resolve to path to temporary app folder for platform-specific processes to use
      callback(null, tempPath)
    })
  },

  moveApp: function finalizeApp (opts, tempPath, callback) {
    var finalPath = generateFinalPath(opts)
    // Prefer ncp over mv (which seems to cause issues on Win8)
    series([
      function (cb) {
        mkdirp(finalPath, cb)
      },
      function (cb) {
        ncp(tempPath, finalPath, cb)
      }
    ], function (err) {
      callback(err, finalPath)
    })
  },

  normalizeExt: function normalizeExt (filename, targetExt, cb) {
    // Forces a filename to a given extension and fires the given callback with the normalized filename,
    // if it exists.  Otherwise reports the error from the fs.stat call.
    // (Used for resolving icon filenames, particularly during --all runs.)

    // This error path is used by win32.js if no icon is specified
    if (!filename) return cb(new Error('No filename specified to normalizeExt'))

    var ext = path.extname(filename)
    if (ext !== targetExt) {
      filename = filename.slice(0, filename.length - ext.length) + targetExt
    }

    fs.stat(filename, function (err) {
      cb(err, err ? null : filename)
    })
  }
}
