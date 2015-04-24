# atom-shell-packager

Build a distributable app from an atom-shell app source code directory. **Currently only Mac OS is implemented** but you can send PRs to implement windows/linux :)

[![NPM](https://nodei.co/npm/atom-shell-packager.png)](https://nodei.co/npm/atom-shell-packager/)

[![Build Status](https://travis-ci.org/maxogden/atom-shell-packager.svg?branch=master)](https://travis-ci.org/maxogden/atom-shell-packager)

For an example project using this, check out [Monu](https://github.com/maxogden/monu)

### installation

```
# for use in npm scripts
npm i atom-shell-packager --save-dev

# for use from cli
npm i atom-shell-packager -g

# you also need atom-shell installed
npm i atom-shell
```

### usage

```
$ atom-shell-packager my-app-source-dir AppName
```

This will:

- Find the closest local version of `atom-shell` installed (using `require.resolve`)
- Use that version of atom-shell to create a Mac app in `cwd` called `AppName.app`

You should be able to double-click `AppName.app` to launch the app. If not, check your settings and try again.

**Be careful** not to include node_modules you don't want into your final app. For example, do not include the `node_modules/atom-shell-packager` folder or `node_modules/atom-shell`. You can use `--ignore=node_modules/atom-shell` to ignore of these

### options

these are optional CLI options you can pass in

- `out` (default current working dir) - the dir to put the app into at the end
- `version` (default hardcoded in source) - atom-shell version to use
- `icon` - the icon file to use as the icon for the app
- `app-bundle-id` - bundle identifier to use in the app plist
- `helper-bundle-id` - bundle identifier to use in the app helper plist
- `ignore` (default none) - do not copy files into App whose filenames regex .match this string
- `prune` - runs `npm prune --production` on the app
