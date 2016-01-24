# Nativefier
[![Build Status](https://travis-ci.org/jiahaog/nativefier.svg?branch=master)](https://travis-ci.org/jiahaog/nativefier)
[![npm version](https://badge.fury.io/js/nativefier.svg)](https://www.npmjs.com/package/nativefier)
![Dock Screenshot](https://raw.githubusercontent.com/jiahaog/nativefier/master/screenshots/Dock%20Screenshot.png)

You want to make a native wrapper for Google Maps (or any web page).

```bash
$ nativefier maps.google.com
```

You're done.

## Introduction

Nativefier is a command line tool that allows you to easily create a desktop application for any web site with succinct and minimal configuration. Apps are wrapped by [Electron](http://electron.atom.io) in an OS executable (`.app`, `.exe`, etc.) for use on Windows, OSX and Linux.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](http://messenger.com) or [Whatsapp Web](http://web.whatsapp.com).

View the changelog [here](https://github.com/jiahaog/nativefier/blob/master/History.md).

## Installation

With [Node.js](https://nodejs.org/) installed,

```bash
# for use from the command line
$ npm install nativefier -g
```

## Usage

Creating a native desktop app for [medium.com](http://medium.com):

```bash
$ nativefier "http://medium.com"
```

Nativefier will intelligently attempt to determine the app name, your OS and processor architecture, among other options. If desired, the app name or other options can be overwritten by specifying the `--app-name "Medium"` as part of the command line options, as such.

```
$ nativefier --app-name "Some Awesome App" "http://medium.com"
```

**For Windows Users:** Take note that the application menu is automatically hidden by default, you can press `alt` on your keyboard to access it.

## Options

```bash
$ nativefier [options] <targetUrl> [dest]
```
Command line options are listed below.

#### Target Url

The url to point the application at.

#### [dest]

Specifies the destination directory to build the app to, defaults to the current working directory.

#### Help

```
-h, --help
```

Prints the usage information.

#### [app-name]

```
-n, --app-name <value>
```

The name of the application, which will affect strings in titles and the icon.

#### [platform]

```
-p, --platform <value>
```
Automatically determined based on the current OS. Can be overwritten by specifying either `linux`, `win32`, or `darwin`.

#### [arch]

```
-a, --arch <value>
```

Processor architecture, automatically determined based on the current OS. Can be overwritten by specifying either `ia32` or `x64`.

#### [electron-version]

```
-e, --electron-version <value>
```

Electron version without the `v`, see https://github.com/atom/electron/releases.

#### [overwrite]

```
-o, --overwrite
```

Specifies if the destination directory should be overwritten.

#### [conceal]

```
-c, --conceal
```

Specifies if the source code within the nativefied app should be packaged into an archive, defaults to false, [read more](http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/).

#### [icon]

```
-i, --icon <path>
```

On OSX, the icon parameter should be a path to an `.icns` file. [iConvertIcons](https://iconverticons.com/online/) can be used to convert `.pngs`, though it can be quite cumbersome.

To retrieve the `.icns` file from the downloaded file, extract it first and press File > Get Info. Then select the icon in the top left corner of the info window and press `⌘-C`. Open Preview and press File > New from clipboard and save the `.icns` file. It took me a while to figure out how to do that and question why a `.icns` file was not simply provided in the downloaded archive.

#### [badge]

```
-b, --badge
```

On OSX, it is desired for the App dock icon to show a badge on the receipt of a desktop notification.

There is no known way to intercept and set an event listener for a desktop notification triggered by the [`<webview>`](https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md), the current workaround is to listen for `document.title` changes within the `<webview>`. Typical web apps like Facebook Messenger will change the `document.title` to "John sent a message..." on the receipt of a desktop notification, and this is what we will listen for to trigger the app badge on the dock.

However, this would cause issues when the command line argument `target` is set to a external page which is not a single page app, because clicking on hyperlinks and switching pages would naturally change the `document.title`. Hence, `--badge` is an optional command argument that can be set by the user if the side effect of this workaround is understood.

#### [counter]

```
--counter
```

Use a counter that persists even with window focus for the application badge for sites that use an "(X)" format counter in the page title (i.e. Gmail).  Same limitations as the badge option (above).

#### [width]

```
-w, --width <value>
```

Width of the packaged application, defaults to `1280px`.

#### [height]

```
-h, --height <value>
```

Height of the packaged application, defaults to `800px`.

#### [show-menu-bar]

```
-m, --show-menu-bar
```

Specifies if the menu bar should be shown.

#### [user-agent]

```
-u, --user-agent <value>
```

Set the user agent to run the created app with.

#### [honest]

```
--honest
```
By default, nativefier uses a preset user agent string for your OS and masquerades as a regular Google Chrome browser, so that sites like WhatsApp Web will not say that the current browser is unsupported.

If this flag is passed, it will not override the user agent.

## How It Works

A template app with the appropriate event listeners and callbacks set up is included in the `./app` folder. When the `nativefier` command is executed, this folder is copied to a temporary directory with the appropriate parameters in a configuration file, and is packaged into an app with [Electron Packager](https://github.com/maxogden/electron-packager).

## Development

Setting up the project

```bash
$ git clone https://github.com/jiahaog/nativefier.git
$ cd nativefier

# Set up dependencies for the cli tool and the placeholder app
$ npm run dev-up

# Set up symlinks so that you can run `$ nativefier` for your local changes
$ npm link
```

After doing so, you can then run nativefier with your test parameters

```bash
$ nativefier <...>
```

Don't forget to compile source files (after making changes):

```bash
$ npm run build
```

Or you can automatically watch the files for changes with:

```bash
$ npm run watch
```

## Notes

Tested mostly on OSX, but should work for Windows and Linux.
