# electron-packager

Build a distributable app from an electron app source code directory. **Currently only Mac OS and Linux are implemented** but you can send PRs to implement windows :)

*formerly known as atom-shell-packager*

[![NPM](https://nodei.co/npm/electron-packager.png)](https://nodei.co/npm/electron-packager/)

[![Build Status](https://travis-ci.org/maxogden/electron-packager.svg?branch=master)](https://travis-ci.org/maxogden/electron-packager)

For an example project using this, check out [Monu](https://github.com/maxogden/monu)

### installation

```
# for use in npm scripts
npm i electron-packager --save-dev

# for use from cli
npm i electron-packager -g

# you also need electron installed
npm i electron-prebuilt
```

### usage

```
$ electron-packager my-app-source-dir AppName
```

This will:

- Find the closest local version of `electron` installed (using `require.resolve`)
- Use that version of electron to create a Mac app in `cwd` called `AppName.app`

You should be able to double-click `AppName.app` to launch the app. If not, check your settings and try again.

**Be careful** not to include node_modules you don't want into your final app. For example, do not include the `node_modules/electron-packager` folder or `node_modules/electron-prebuilt`. You can use `--ignore=node_modules/electron-prebuilt` to ignore of these

### options

these are optional CLI options you can pass in

- `out` (default current working dir) - the dir to put the app into at the end
- `icon` - the icon file to use as the icon for the app
- `app-bundle-id` - bundle identifier to use in the app plist
- `app-version` - version to set for the app
- `helper-bundle-id` - bundle identifier to use in the app helper plist
- `ignore` (default none) - do not copy files into App whose filenames regex .match this string
- `prune` - runs `npm prune --production` on the app
- `asar` - packages the source code within your app into an archive
