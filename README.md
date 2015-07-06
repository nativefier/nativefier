# Nativefier

![Dock Screenshot](https://raw.githubusercontent.com/skewedlines/Nativefier/master/screenshots/Dock%20Screenshot.png)

## Introduction
[![NPM](https://nodei.co/npm/nativefier.png)](https://nodei.co/npm/nativefier/)

Packages and wraps a single-page web app in an [Electron](http://electron.atom.io) OS executable (.app, .exe, etc) via the command line. 

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](http://messenger.com) or [Whatsapp Web](http://web.whatsapp.com).

*A fork of the awesome [electron-packager](https://github.com/maxogden/electron-packager).*

## Installation

```bash
# for use from cli
$ npm install nativefier -g
```

## Usage

```
Usage: nativefier <appname> <target> --platform=<platform> --arch=<arch> --version=<version>

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
icon               the icon file to use as the icon for the app (should be a .icns file on OSX)
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
badge              if the target app should show badges in the OSX dock on receipt of desktop notifications
width              window width (default=1280)
height             window height (default=800)
```

See [electron-packager](https://github.com/maxogden/electron-packager) for more details.

### Icon
On OSX, the icon parameter should be a path to an `.icns` file. [iConvertIcons](https://iconverticons.com/online/) can be used to convert `.pngs`, though it can be quite cumbersome.

To retrieve the `.icns` file from the downloaded file, extract it first and press File > Get Info. Then select the icon in the top left corner of the info window and press `⌘-C`. Open Preview and press File > New from clipboard and save the `.icns` file. It took me a while to figure out how to do that and question why a `.icns` file was not simply provided in the downloaded archive.

### OSX Dock Badge

On OSX, it is desired for the App dock icon to show a badge on the receipt of a desktop notification. 

There is no known way to intercept and set an event listener for a desktop notification triggered by the [`<webview>`](https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md), the current workaround is to listen for `document.title` changes within the `<webview>`. Typical web apps like Facebook Messenger will change the `document.title` to "John sent a message..." on the receipt of a desktop notification, and this is what we will listen for to trigger the app badge on the dock.

However, this would cause issues when the command line argument `target` is set to a external page which is not a single page app, because clicking on hyperlinks and switching pages would naturally change the `document.title`. Hence, `--badge` is an optional command argument that can be set by the user if the side effect of this workaround is understood. 

## Examples

Creating an native wrapper for Facebook Messenger with the following arguments:

- App Name: `Messenger`
- Target Url: `http://messenger.com`
- Platform: `darwin` (OSX)
- Architecture: `x64`
- Electron Version: `0.29.1`
- Override existing app (if any)
- OSX dock badges on (See notes above)

```bash
$ nativefier Messenger http://messenger.com --platform=darwin --arch=x64 --version=0.29.1 --overwrite --badge
```

## How It Works

A template app with the appropriate event listeners and callbacks set up is included in the `/app` folder. When the `nativefier` command is executed, this folder is copied to a temporary directory with the appropriate parameters in a configuration file, and the core methods of `electron-packager` is called on that directory.

## Notes

Tested only on OSX, but should work for windows and linux.

### Back Button
A back button is intentionally not provided because the tool is designed for single page apps. However, if desired, an executable can built for any url, and simply pressing the `backspace` key will take the user back to the previous page.

## Issues

- Better workaround for desktop notifications and OSX dock badges