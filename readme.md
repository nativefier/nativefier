# electron-packager

Package your electron app in OS executables (.app, .exe, etc) via JS or CLI. Supports building Windows, Linux or Mac executables.

*formerly known as atom-shell-packager*

[![NPM](https://nodei.co/npm/electron-packager.png)](https://nodei.co/npm/electron-packager/)

[![Build Status](https://travis-ci.org/maxogden/electron-packager.svg?branch=master)](https://travis-ci.org/maxogden/electron-packager)

### installation

```
# for use in npm scripts
npm i electron-packager --save-dev

# for use from cli
npm i electron-packager -g
```

### usage

```
Usage: electron-packager <sourcedir> <appname> --platform=<platform> --arch=<arch> --version=<version>
  
Required options

platform           linux, win32, darwin
arch               ia32, x64
version            see https://github.com/atom/electron/releases
                  
Example            electron-packager ./ FooBar --platform=darwin --arch=x64 --version=0.25.1

Optional options

out                the dir to put the app into at the end. defaults to current working dir
icon               the icon file to use as the icon for the app
app-bundle-id      bundle identifier to use in the app plist
app-version        version to set for the app
helper-bundle-id   bundle identifier to use in the app helper plist
ignore             do not copy files into App whose filenames regex .match this string
prune              runs `npm prune --production` on the app
asar               packages the source code within your app into an archive
```

This will:

- Find or download the correct release of Electron
- Use that version of electron to create a app in `cwd` named using `appname` for the platform you specified

You should be able to launch the app on the platform you built for. If not, check your settings and try again.

**Be careful** not to include node_modules you don't want into your final app. For example, do not include the `node_modules/electron-packager` folder or `node_modules/electron-prebuilt`. You can use `--ignore=node_modules/electron-prebuilt` to ignore of these

### related

- [grunt-electron](https://github.com/sindresorhus/grunt-electron) - grunt plugin for electron-packager
