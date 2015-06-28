var test = require('tape')
var mkdirp = require('mkdirp')
var rimraf = require('rimraf')
var packager = require('../index.js')

var distdir = __dirname + '/dist'
rimraf.sync(distdir)
mkdirp.sync(distdir)

var opts = {
  dir: __dirname + '/testapp',
  name: 'Test',
  version: '0.28.2',
  out: distdir
}

test('package for windows', function (t) {
  opts.platform = 'win32'
  opts.arch = 'ia32'

  packager(opts, function done (err, appPath) {
    t.notOk(err, 'no err')
    t.end()
  })
})

test('package for linux', function (t) {
  opts.platform = 'linux'
  opts.arch = 'x64'

  packager(opts, function done (err, appPath) {
    t.notOk(err, 'no err')
    t.end()
  })
})

test('package for darwin', function (t) {
  opts.platform = 'darwin'
  opts.arch = 'x64'

  packager(opts, function done (err, appPath) {
    t.notOk(err, 'no err')
    t.end()
  })
})
