var fs = require('fs')
var path = require('path')
var test = require('tape')

var download = require('electron-download')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var series = require('run-series')

var ORIGINAL_CWD = process.cwd()
var WORK_CWD = path.join(__dirname, 'work')

var archs = ['ia32', 'x64']
var platforms = ['darwin', 'linux', 'win32']
var slice = Array.prototype.slice
var version = require('./config.json').version

var combinations = []
archs.forEach(function (arch) {
  platforms.forEach(function (platform) {
    // Electron does not have 32-bit releases for Mac OS X, so skip that combination
    // Also skip testing darwin target on Windows since electron-packager itself skips it
    // (see https://github.com/maxogden/electron-packager/issues/71)
    if (platform === 'darwin' && (arch === 'ia32' || require('os').platform() === 'win32')) return

    combinations.push({
      arch: arch,
      platform: platform,
      version: version
    })
  })
})

exports.areFilesEqual = function areFilesEqual (file1, file2, callback) {
  series([
    function (cb) {
      fs.readFile(file1, cb)
    },
    function (cb) {
      fs.readFile(file2, cb)
    }
  ], function (err, buffers) {
    callback(err, slice.call(buffers[0]).every(function (b, i) {
      return b === buffers[1][i]
    }))
  })
}

exports.downloadAll = function downloadAll (version, callback) {
  series(combinations.map(function (combination) {
    return function (cb) {
      download(combination, cb)
    }
  }), callback)
}

exports.forEachCombination = function forEachCombination (cb) {
  combinations.forEach(cb)
}

exports.generateResourcesPath = function generateResourcesPath (opts) {
  return opts.platform === 'darwin' ? path.join(opts.name + '.app', 'Contents', 'Resources') : 'resources'
}

exports.getWorkCwd = function getWorkCwd () {
  return WORK_CWD
}

// tape doesn't seem to have a provision for before/beforeEach/afterEach/after,
// so run setup/teardown and cleanup tasks as additional "tests" to put them in sequence
// and run them irrespective of test failures

exports.setup = function setup () {
  test('setup', function (t) {
    mkdirp(WORK_CWD, function (err) {
      if (err) t.end(err)
      process.chdir(WORK_CWD)
      t.end()
    })
  })
}

exports.teardown = function teardown () {
  test('teardown', function (t) {
    process.chdir(ORIGINAL_CWD)
    rimraf(WORK_CWD, function (err) {
      t.end(err)
    })
  })
}

exports.testAllPlatforms = function testAllPlatforms (name, createTest /*, ...createTestArgs */) {
  var args = slice.call(arguments, 2)
  exports.setup()
  exports.forEachCombination(function (combination) {
    test(name + ': ' + combination.platform + '-' + combination.arch,
      createTest.apply(null, [combination].concat(args)))
  })
  exports.teardown()
}
