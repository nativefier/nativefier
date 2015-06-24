var fs = require('fs')
var path = require('path')

var packager = require('..')
var waterfall = require('run-waterfall')

var config = require('./config.json')
var util = require('./util')

function generateBasename (opts) {
  return opts.name + '-' + opts.platform + '-' + opts.arch
}

function generateNamePath (opts) {
  // Generates path to verify reflects the name given in the options.
  // Returns the Helper.app location on darwin since the top-level .app is already tested for the resources path;
  // returns the executable for other OSes
  if (opts.platform === 'darwin') {
    return path.join(opts.name + '.app', 'Contents', 'Frameworks', opts.name + ' Helper.app')
  }

  return opts.name + (opts.platform === 'win32' ? '.exe' : '')
}

function createDefaultsTest (combination) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')

    var finalPath
    var resourcesPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        t.true(Array.isArray(paths), 'packager call should resolve to an array')
        t.equal(paths.length, 1, 'Single-target run should resolve to a 1-item array')

        finalPath = paths[0]
        t.equal(finalPath, path.join(util.getWorkCwd(), generateBasename(opts)),
          'Path should follow the expected format and be in the cwd')
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        fs.stat(path.join(finalPath, generateNamePath(opts)), cb)
      }, function (stats, cb) {
        if (opts.platform === 'darwin') {
          t.true(stats.isDirectory(), 'The Helper.app should reflect opts.name')
        } else {
          t.true(stats.isFile(), 'The executable should reflect opts.name')
        }
        fs.stat(resourcesPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'), cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain devDependencies by default (no prune)')
        util.areFilesEqual(path.join(opts.dir, 'main.js'), path.join(resourcesPath, 'app', 'main.js'), cb)
      }, function (equal, cb) {
        t.true(equal, 'File under packaged app directory should match source file')
        util.areFilesEqual(path.join(opts.dir, 'ignore', 'this.txt'),
          path.join(resourcesPath, 'app', 'ignore', 'this.txt'),
          cb)
      }, function (equal, cb) {
        t.true(equal,
          'File under subdirectory of packaged app directory should match source file and not be ignored by default')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createOutTest (combination) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.out = 'dist'

    var finalPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        t.equal(finalPath, path.join('dist', generateBasename(opts)),
          'Path should follow the expected format and be under the folder specifed in `out`')
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        fs.stat(path.join(finalPath, util.generateResourcesPath(opts)), cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        cb()
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createAsarTest (combination) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.asar = true

    var finalPath
    var resourcesPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        fs.stat(resourcesPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        fs.stat(path.join(resourcesPath, 'app.asar'), cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'app.asar should exist under the resources subdirectory when opts.asar is true')
        fs.exists(path.join(resourcesPath, 'app'), function (exists) {
          t.false(exists, 'app subdirectory should NOT exist when app.asar is built')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createPruneTest (combination) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.prune = true

    var finalPath
    var resourcesPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        resourcesPath = path.join(finalPath, util.generateResourcesPath(opts))
        fs.stat(resourcesPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The output directory should contain the expected resources subdirectory')
        fs.stat(path.join(resourcesPath, 'app', 'node_modules', 'run-series'), cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'npm dependency should exist under app/node_modules')
        fs.exists(path.join(resourcesPath, 'app', 'node_modules', 'run-waterfall'), function (exists) {
          t.false(exists, 'npm devDependency should NOT exist under app/node_modules')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createIgnoreTest (combination, ignorePattern, ignoredFile) {
  return function (t) {
    t.timeoutAfter(config.timeout)

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')
    opts.ignore = ignorePattern

    var appPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        appPath = path.join(paths[0], util.generateResourcesPath(opts), 'app')
        fs.stat(path.join(appPath, 'package.json'), cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'The expected output directory should exist and contain files')
        fs.exists(path.join(appPath, ignoredFile), function (exists) {
          t.false(exists, 'Ignored file should not exist in output app directory')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

function createOverwriteTest (combination) {
  return function (t) {
    t.timeoutAfter(config.timeout * 2) // Multiplied since this test packages the application twice

    var opts = Object.create(combination)
    opts.name = 'basicTest'
    opts.dir = path.join(__dirname, 'fixtures', 'basic')

    var finalPath
    var testPath

    waterfall([
      function (cb) {
        packager(opts, cb)
      }, function (paths, cb) {
        finalPath = paths[0]
        fs.stat(finalPath, cb)
      }, function (stats, cb) {
        t.true(stats.isDirectory(), 'The expected output directory should exist')
        // Create a dummy file to detect whether the output directory is replaced in subsequent runs
        testPath = path.join(finalPath, 'test.txt')
        fs.writeFile(testPath, 'test', cb)
      }, function (cb) {
        // Run again, defaulting to overwrite false
        packager(opts, cb)
      }, function (paths, cb) {
        fs.stat(testPath, cb)
      }, function (stats, cb) {
        t.true(stats.isFile(), 'The existing output directory should exist as before (skipped by default)')
        // Run a third time, explicitly setting overwrite to true
        opts.overwrite = true
        packager(opts, cb)
      }, function (paths, cb) {
        fs.exists(testPath, function (exists) {
          t.false(exists, 'The output directory should be regenerated when overwrite is true')
          cb()
        })
      }
    ], function (err) {
      t.end(err)
    })
  }
}

util.testAllPlatforms('defaults test', createDefaultsTest)
util.testAllPlatforms('out test', createOutTest)
util.testAllPlatforms('asar test', createAsarTest)
util.testAllPlatforms('prune test', createPruneTest)
util.testAllPlatforms('ignore test: string in array', createIgnoreTest, ['ignorethis'], 'ignorethis.txt')
util.testAllPlatforms('ignore test: string', createIgnoreTest, 'ignorethis', 'ignorethis.txt')
util.testAllPlatforms('ignore test: RegExp', createIgnoreTest, /ignorethis/, 'ignorethis.txt')
util.testAllPlatforms('ignore test: string with slash', createIgnoreTest, 'ignore/this',
  path.join('ignore', 'this.txt'))
util.testAllPlatforms('ignore test: only match subfolder of app', createIgnoreTest, 'electron-packager',
  path.join('electron-packager', 'readme.txt'))
util.testAllPlatforms('overwrite test', createOverwriteTest)
