var path = require('path');
var fs = require('fs');

//http://jlongster.com/Backend-Apps-with-Webpack--Part-I
// set all modules in node_modules as external
var nodeModules = {};
fs
    .readdirSync('./app/node_modules')
    .filter(function (x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function (mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

// add electron to external module
nodeModules['electron'] = 'commonjs electron';

module.exports = {
    target: 'node',
    output: {
        filename: 'main.js'
    },
    node: {
        global: false,
        __dirname: false
    },
    externals: nodeModules
};
