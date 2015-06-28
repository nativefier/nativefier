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
sign               should contain the identity to be used when running `codesign` (OS X only)
version-string     should contain a hash of the application metadata to be embedded into the executable (Windows only). Keys supported
                   - CompanyName
                   - LegalCopyright
                   - FileDescription
                   - OriginalFilename
                   - FileVersion
                   - ProductVersion
                   - ProductName
                   - InternalName
                   

```

This will:

- Find or download the correct release of Electron
- Use that version of electron to create a app in `<out>/<appname>-<platform>`

You should be able to launch the app on the platform you built for. If not, check your settings and try again.

**Be careful** not to include node_modules you don't want into your final app. `electron-packager`, `electron-prebuilt` and `.git` will be ignored by default. You can use `--ignore` to ignore files and folders, e.g. `--ignore=node_modules/electron-packager` or `--ignore="node_modules/(electron-packager|electron-prebuilt)"`.

### API
```javascript
var packager = require('electron-packager')
packager(opts, function done (err, appPath) { })
```
#### packager(opts, callback)

##### opts
**Required**  
`dir` - *String*  
The source directory.

`name` - *String*  
The application name.

`platform` - *String*  
Allowed values: *linux, win32, darwin*

`arch` - *String*  
Allowed values: *ia32, x64*

`version` - *String*  
Electron version (without the 'v'). See https://github.com/atom/electron/releases

**Optional**  
`out` - *String*

`icon` - *String*

`app-bundle-id` - *String*

`app-version` - *String*

`helper-bundle-id` - *String*

`ignore` - *String*

`prune` - *Boolean*

`asar` - *Boolean*

`sign` - *String*

##### callback

`err` - *Error*  
Contains errors if any.

`appPath` - *String*  
Path to the newly created application.

### Building windows apps from non-windows platforms

If you run this on windows and you want to set the icon for your app using the `--icon` option, it requires running a thing called `rcedit.exe` (via [this](https://github.com/atom/node-rcedit)), which means you will need to install `wine` and have it available in your path. To do this on Mac OS you can `brew install wine`.

### related

- [grunt-electron](https://github.com/sindresorhus/grunt-electron) - grunt plugin for electron-packager
