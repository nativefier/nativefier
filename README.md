# Nativefier

## Introduction
[![NPM](https://nodei.co/npm/nativefier.png)](https://nodei.co/npm/nativefier/)

Package and wraps a single-page web app in an [electron](http://electron.atom.io) OS executable (.app, .exe, etc) via the command line. 

Simply a fork with a small layer of abstraction on top of [electron-packager](https://github.com/maxogden/electron-packager) for the CLI.

I did this because I was tired of having to `⌘-tab or alt-tab` to my browser and then search through the numerous tabs open when I was using [Whatsapp Web](http://web.whatsapp.com) or [Facebook Messenger](http://messenger.com).

### Notes

A back button is intentionally not provided because the tool is designed for single page apps. However, if desired, an executable can built for any url, and simply pressing the `backspace` key will take the user back to the previous page.

## Installation

```bash
# for use from cli
npm install nativefier -g
```

## Usage

```css
Usage: nativefier <appname> --target=<url> --platform=<platform> --arch=<arch> --version=<version>

Required options

appname            name for the app
target             target url for the single page app
platform           all, or one or more of: linux, win32, darwin (comma-delimited if multiple)
arch               all, ia32, x64
version            see https://github.com/atom/electron/releases

Example            nativefier Messenger --target=http://messenger.com --platform=darwin --arch=x64 --version=0.28.2

Optional options

all                equivalent to --platform=all --arch=all
out                the dir to put the app into at the end. defaults to current working dir
icon               the icon file to use as the icon for the app
app-bundle-id      bundle identifier to use in the app plist
app-version        version to set for the app
helper-bundle-id   bundle identifier to use in the app helper plist
ignore             do not copy files into App whose filenames regex .match this string
prune              runs `npm prune --production` on the app
overwrite          if output directory for a platform already exists, replaces it rather than skipping it
asar               packages the source code within your app into an archive
sign               should contain the identity to be used when running `codesign` (OS X only)
version-string     should contain a hash of the application metadata to be embedded into the executable (Windows only).
                   These can be specified on the command line via dot notation,
                   e.g. --version-string.CompanyName="Company Inc." --version-string.ProductName="Product"
                   Keys supported:
                   - CompanyName
                   - LegalCopyright
                   - FileDescription
                   - OriginalFilename
                   - FileVersion
                   - ProductVersion
                   - ProductName
                   - InternalName
```

See [electron-packager](https://github.com/maxogden/electron-packager) for more details.
## Examples

Creating a native wrapper of `http://messenger.com` for `OSX x64`:

```bash
$ nativefier Messenger --platform=darwin --arch=x64 --version=0.29.1 --target='http://messenger.com' --overwrite
```

## Todo

- Set the app icon from a url in the CLI
- Set the app window dimensions from the CLI