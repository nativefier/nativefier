#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2))
var packager = require('./')

args.dir = args._[0]
args.name = args._[1]

var protocolSchemes = [].concat(args.protocol || [])
var protocolNames = [].concat(args['protocol-name'] || [])

if (protocolSchemes && protocolNames && protocolNames.length === protocolSchemes.length) {
  args.protocols = protocolSchemes.map(function (scheme, i) {
    return {schemes: [scheme], name: protocolNames[i]}
  })
}

if (!args.dir || !args.name) {
  console.error('Usage: electron-packager <sourcedir> <Appname>')
  process.exit(1)
}

packager(args, function done (err, appPath) {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.error('Wrote new app to', appPath)
})
