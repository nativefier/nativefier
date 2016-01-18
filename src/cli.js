#! /usr/bin/env node

import path from 'path';
import program from 'commander';

import optionsFactory from './options';
import buildApp from './buildApp';

const packageJson = require(path.join('..', 'package'));

function main(program) {
    const options = optionsFactory(
        program.appName,
        program.targetUrl,
        program.platform,
        program.arch,
        program.electronVersion,
        program.outDir,
        program.overwrite,
        program.conceal,
        program.icon,
        program.badge,
        program.width,
        program.height);

    console.log(`Using Electron v${options.version}`);
    console.log(options);
    buildApp(options, (error, appPath) => {
        if (error) {
            console.error(error);
            return;
        }

        console.log(`App built to ${appPath}`);
    });
}

if (require.main === module) {
    program
        .version(packageJson.version)
        .arguments('<targetUrl> [appDir]')
        .action(function (targetUrl, appDir) {
            program.targetUrl = targetUrl;
            program.outDir = appDir;
        })
        .option('-n, --appName [value]', 'app name')
        .option('-p, --platform [platform]', 'linux, win32, or darwin')
        .option('-a, --arch [architecture]', 'ia32 or x64')
        .option('-e, --electron-version', 'electron version to package, without the \'v\', see https://github.com/atom/electron/releases')
        .option('-o, --overwrite', 'if output directory for a platform already exists, replaces it rather than skipping it, defaults to true')
        .option('-c, --conceal', 'packages the source code within your app into an archive, defaults to false, see http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/')
        .option('-i, --icon [dir]', 'the icon file to use as the icon for the app (should be a .icns file on OSX)')
        .option('-b, --badge', 'if the target app should show badges in the dock on receipt of desktop notifications (OSX only), defaults to false')
        .option('-w, --width [value]', 'set window width, defaults to 1280px')
        .option('-h, --height [value]', 'set window height, defaults to 800px')
        .parse(process.argv);

    if (!process.argv.slice(2).length) {
        program.help();
    }

    main(program);
}
