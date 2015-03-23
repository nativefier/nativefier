# atom-shell-packager

Build a distributable app from an atom-shell app source code directory. **Currently only Mac OS is implemented** but you can send PRs to implement windows/linux :)

[![NPM](https://nodei.co/npm/atom-shell-packager.png)](https://nodei.co/npm/atom-shell-packager/)

### installation

```
npm i atom-shell-packager
```

### usage

```
$ atom-shell-packager my-app-source-dir AppName
```

This will:

- Download latest version of Atom Shell
- Create a Mac app in `cwd` called `AppName.app`

You should be able to double-click `AppName.app` to launch the app. If not, check your settings and try again.

### options

these are optional CLI options you can pass in

- `out` (default current working dir) - the dir to put the app into at the end
- `version` (default hardcoded in source) - atom-shell version to use
- `app-bundle-id` - bundle identifier to use in the app plist
- `helper-bundle-id` - bundle identifier to use in the app helper plist

also, the entire `options` objects gets passed into the [`ncp`](https://npmjs.org/ncp) instance when copying your app source directory into the app container, so you can pass in any `ncp` options you want as well
