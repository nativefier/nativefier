var path = require('path')
var fs = require('fs')
var mkdirp = require('mkdirp')
var ncp = require('ncp').ncp
var rimraf = require('rimraf')
var common = require('./common')

module.exports = {
  createApp: function createApp (opts, templateApp, cb) {
    var finalDir = path.join(opts.out || process.cwd(), opts.name + '-linux')
    var userAppDir = path.join(finalDir, 'resources', 'default_app')
    var originalBinary = path.join(finalDir, 'electron')
    var finalBinary = path.join(finalDir, opts.name)

    function copyApp () {
      var createApp = function (err) {
        if (err) return cb(err)
        mkdirp(finalDir, function AppFolderCreated (err) {
          if (err) return cb(err)
          copyAppTemplate()
        })
      }
      if (opts.overwrite) {
        fs.exists(finalDir, function (exists) {
          if (exists) {
            console.log('Overwriting existing ' + finalDir + ' ...')
            rimraf(finalDir, createApp)
          } else {
            createApp()
          }
        })
      } else {
        createApp()
      }
    }

    function copyAppTemplate () {
      ncp(templateApp, finalDir, {filter: appFilter}, function AppCreated (err) {
        if (err) return cb(err)
        copyUserApp()
      })
    }

    function copyUserApp () {
      ncp(opts.dir, userAppDir, {filter: common.userIgnoreFilter(opts, finalDir), dereference: true}, function copied (err) {
        if (err) return cb(err)
        common.prune(opts, userAppDir, cb, renameElectronBinary)
      })
    }

    function renameElectronBinary () {
      fs.rename(originalBinary, finalBinary, function electronRenamed (err) {
        var asarDir
        if (err) return cb(err)
        if (opts.asar) {
          asarDir = path.join(finalDir, 'resources')
          common.asarApp(asarDir, cb)
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
