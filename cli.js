#!/usr/bin/env node
var fs = require('fs');
var args = require('minimist')(process.argv.slice(2), {boolean: ['prune', 'asar', 'all', 'overwrite']});
var packager = require('./');
var usage = fs.readFileSync(__dirname + '/usage.txt').toString();
var validator = require('validator');
var tempDir = require('./tempDir');


args.dir = 'blah'; // set to true first
args.name = args._[0];

var protocolSchemes = [].concat(args.protocol || []);
var protocolNames = [].concat(args['protocol-name'] || []);

if (protocolSchemes && protocolNames && protocolNames.length === protocolSchemes.length) {
    args.protocols = protocolSchemes.map(function (scheme, i) {
        return {schemes: [scheme], name: protocolNames[i]};
    })
}

if (!args.dir || !args.name || !args.version || !args.target || (!args.all && (!args.platform || !args.arch))) {
    console.error(usage);

    process.exit(1);
}


if (!validator.isURL(args.target)) {
    console.error('Enter a valid target url');
    process.exit(1);
}

tempDir(args.name, args.target, args.badge, function (error, appDir) {

    if (error) {
        console.error(error);
        process.exit(1);
    } else {

        args.dir = appDir;
        packager(args, function done(err, appPaths) {
            if (err) {
                if (err.message) console.error(err.message);
                else console.error(err, err.stack);
                process.exit(1);
            }

            if (appPaths.length > 1) console.error('Wrote new apps to:\n' + appPaths.join('\n'));
            else if (appPaths.length === 1) console.error('Wrote new app to', appPaths[0]);
        });
    }

});
