var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var ncp = require('ncp').ncp
var common = require('./common')

module.exports = {
  createApp: function createApp (opts, templateApp, cb) {
    var finalDir = opts.out || path.join(process.cwd(), opts.name + '-linux')
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
      ncp(opts.dir, userAppDir, {filter: common.userIgnoreFilter(opts, false, finalDir), dereference: true}, function copied (err) {
        if (err) return cb(err)
        common.prune(opts, userAppDir, cb, renameElectronBinary)
      })
    }

    function renameElectronBinary () {
      fs.rename(originalBinary, finalBinary, function electronRenamed (err) {
        if (err) return cb(err)
        if (opts.asar) {
          common.asarApp(finalDir, cb)
        } else {
          cb(null, finalBinary)
        }
      })
    }

    function appFilter (file) {
      return file.match(/default_app/) === null
    }

    copyApp()
  }
}
