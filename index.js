var path = require('path')
var fs = require('fs')
var os = require('os')

var download = require('electron-download')
var extract = require('extract-zip')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var series = require('run-series')
var common = require('./common')

var supportedArchs = {
  ia32: 1,
  x64: 1
}

var supportedPlatforms = {
  // Maps to module ID for each platform (lazy-required if used)
  darwin: './mac',
  linux: './linux',
  win32: './win32'
}

var tempBase = path.join(os.tmpdir(), 'electron-packager')

function testSymlink (cb) {
  var testPath = path.join(tempBase, 'symlink-test')
  var testFile = path.join(testPath, 'test')
  var testLink = path.join(testPath, 'testlink')
  series([
    function (cb) {
      mkdirp(testPath, cb)
    },
    function (cb) {
      fs.writeFile(testFile, '', cb)
    },
    function (cb) {
      fs.symlink(testFile, testLink, cb)
    }
  ], function (err) {
    var result = !err
    rimraf(testPath, function () {
      cb(result) // ignore errors on cleanup
    })
  })
}

function validateList (list, supported, name) {
  // Validates list of architectures or platforms.
  // Returns a normalized array if successful, or an error message string otherwise.

  if (!list) return 'Must specify ' + name
  if (list === 'all') return Object.keys(supported)

  if (!Array.isArray(list)) list = list.split(',')
  for (var i = list.length; i--;) {
    if (!supported[list[i]]) {
      return 'Unsupported ' + name + ' ' + list[i] + '; must be one of: ' + Object.keys(supported).join(', ')
    }
  }

  return list
}

function createSeries (opts, archs, platforms) {
  var combinations = []
  archs.forEach(function (arch) {
    platforms.forEach(function (platform) {
      // Electron does not have 32-bit releases for Mac OS X, so skip that combination
      if (platform === 'darwin' && arch === 'ia32') return
      combinations.push({
        platform: platform,
        arch: arch,
        version: opts.version
      })
    })
  })

  return [
    function (cb) {
      rimraf(tempBase, cb)
    }
  ].concat(combinations.map(function (combination) {
    var arch = combination.arch
    var platform = combination.platform
    var version = combination.version

    return function (callback) {
      download(combination, function (err, zipPath) {
        if (err) return callback(err)

        var tmpDir = path.join(tempBase, platform + '-' + arch + '-template')

        var operations = [
          function (cb) {
            mkdirp(tmpDir, cb)
          },
          function (cb) {
            extract(zipPath, {dir: tmpDir}, cb)
          }
        ]

        function createApp (comboOpts) {
          console.error('Packaging app for platform', platform + ' ' + arch, 'using electron v' + version)
          series(operations, function () {
            require(supportedPlatforms[platform]).createApp(comboOpts, tmpDir, callback)
          })
        }

        function checkOverwrite () {
          // Create delegated options object with specific platform and arch, for output directory naming
          var comboOpts = Object.create(opts)
          comboOpts.arch = arch
          comboOpts.platform = platform

          var finalPath = common.generateFinalPath(comboOpts)
          fs.exists(finalPath, function (exists) {
            if (exists) {
              if (opts.overwrite) {
                rimraf(finalPath, function () {
                  createApp(comboOpts)
                })
              } else {
                console.error('Skipping ' + platform + ' ' + arch +
                  ' (output dir already exists, use --overwrite to force)')
                callback()
              }
            } else {
              createApp(comboOpts)
            }
          })
        }

        if (combination.platform === 'darwin') {
          testSymlink(function (result) {
            if (result) return checkOverwrite()

            console.error('Cannot create symlinks; skipping darwin platform')
            callback()
          })
        } else {
          checkOverwrite()
        }
      })
    }
  }))
}

module.exports = function packager (opts, cb) {
  var archs = validateList(opts.all ? 'all' : opts.arch, supportedArchs, 'arch')
  var platforms = validateList(opts.all ? 'all' : opts.platform, supportedPlatforms, 'platform')
  if (!opts.version) return cb(new Error('Must specify version'))
  if (!Array.isArray(archs)) return cb(new Error(archs))
  if (!Array.isArray(platforms)) return cb(new Error(platforms))

  // Ignore this and related modules by default
  var defaultIgnores = ['/node_modules/electron-prebuilt($|/)', '/node_modules/electron-packager($|/)', '/\.git($|/)']
  if (opts.ignore && !Array.isArray(opts.ignore)) opts.ignore = [opts.ignore]
  opts.ignore = (opts.ignore) ? opts.ignore.concat(defaultIgnores) : defaultIgnores

  series(createSeries(opts, archs, platforms), function (err, appPaths) {
    if (err) return cb(err)

    cb(null, appPaths.filter(function (appPath) {
      // Remove falsy entries (e.g. skipped platforms)
      return appPath
    }))
  })
}
