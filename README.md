# Nativefier
[![Build Status](https://travis-ci.org/jiahaog/nativefier.svg?branch=development)](https://travis-ci.org/jiahaog/nativefier)
[![Code Climate](https://codeclimate.com/github/jiahaog/nativefier/badges/gpa.svg)](https://codeclimate.com/github/jiahaog/nativefier)
[![npm version](https://badge.fury.io/js/nativefier.svg)](https://www.npmjs.com/package/nativefier)

![Dock Screenshot](https://raw.githubusercontent.com/jiahaog/nativefier/master/screenshots/Dock%20Screenshot.png)

You want to make a native wrapper for WhatsApp Web (or any web page).

```bash
$ nativefier web.whatsapp.com
```

You're done.

## Introduction

Nativefier is a command line tool that allows you to easily create a desktop application for any web site with succinct and minimal configuration. Apps are wrapped by [Electron](http://electron.atom.io) in an OS executable (`.app`, `.exe`, etc.) for use on Windows, OSX and Linux.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](http://messenger.com) or [Whatsapp Web](http://web.whatsapp.com).

View the changelog [here](https://github.com/jiahaog/nativefier/blob/master/History.md).

[Relevant Hacker News Thread](https://news.ycombinator.com/item?id=10930718)

### Features

- Automatically retrieves the correct icon and app name
- Flash Support (Needs Testing)
- Javascript and CSS injection

## Installation

With [Node.js](https://nodejs.org/) `>=0.12` installed,

```bash
# for use from the command line
$ npm install nativefier -g
```

See [optional dependencies](#optional-dependencies) for more.

## Usage

Creating a native desktop app for [medium.com](http://medium.com):

```bash
$ nativefier "http://medium.com"
```

Nativefier will intelligently attempt to determine the app name, your OS and processor architecture, among other options. If desired, the app name or other options can be overwritten by specifying the `--name "Medium"` as part of the command line options, as such.

```bash
$ nativefier --name "Some Awesome App" "http://medium.com"
```

If you would like high resoulution icons to be used, please contribute to the [icon repository](https://github.com/jiahaog/nativefier-icons)!

**For Windows Users:** Take note that the application menu is automatically hidden by default, you can press `alt` on your keyboard to access it.

**For Linux Users:** Do not put spaces if you define the app name yourself with `--name`, as this will cause problems (tested on Ubuntu 14.04) when pinning a packaged app to the launcher.

## Optional Dependencies

### Icons for Windows Apps from non-Windows platforms

You need [Wine](https://www.winehq.org/) installed, make sure that `wine` is in your `$PATH`.

### Icon Conversion for OSX

To support conversion of a `.png` or `.ico` into a `.icns` for a packaged OSX app icon (currently only supported on OSX), you need the following dependencies.

#### [iconutil](https://developer.apple.com/library/mac/documentation/GraphicsAnimation/Conceptual/HighResolutionOSX/Optimizing/Optimizing.html)

You need [XCode](https://developer.apple.com/xcode/) installed.

#### [imagemagick](http://www.imagemagick.org/script/index.php)

```bash
$ brew install imagemagick
```

Make sure `convert` and `identify` are in your `$PATH`.

### Flash

#### [Google Chrome](https://www.google.com/chrome/)

Google Chrome is required for flash to be supported. Alternatively, you could download the PepperFlash Chrome plugin and specify the path to it directly with the `--flash` flag. See the command line options below for more details.

## Command Line Options

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

#### Version

```
-V, --version
```

Prints the version of your `nativefier` install.

#### [name]

```
-n, --name <value>
```

The name of the application, which will affect strings in titles and the icon.

**For Linux Users:** Do not put spaces if you define the app name yourself with `--name`, as this will cause problems (tested on Ubuntu 14.04) when pinning a packaged app to the launcher.

#### [platform]

```
-p, --platform <value>
```
Automatically determined based on the current OS. Can be overwritten by specifying either `linux`, `windows`, or `osx`.

The alternative values `win32` (for Windows) or `darwin`, `mac` (for OSX) can also be used.

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

#### [no-overwrite]

```
--no-overwrite
```

Specifies if the destination directory should be not overwritten, defaults to false.

#### [conceal]

```
-c, --conceal
```

Specifies if the source code within the nativefied app should be packaged into an archive, defaults to false, [read more](http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/).

#### [icon]

```
-i, --icon <path>
```

##### Packaging for Windows and Linux

The icon parameter should be a path to a `.png` file.

##### Packaging for OSX

The icon parameter can either be a `.icns` or a `.png` file if the optional dependencies listed [above](#optional-dependencies) are installed.

With `iconutil`, Imagemagick `convert` and `identify` optional dependencies in your `PATH`, Nativefier will automatically convert the `.png` to a `.icns` for you.

###### Manually Converting `.icns`

[iConvertIcons](https://iconverticons.com/online/) can be used to convert `.pngs`, though it can be quite cumbersome.

To retrieve the `.icns` file from the downloaded file, extract it first and press File > Get Info. Then select the icon in the top left corner of the info window and press `⌘-C`. Open Preview and press File > New from clipboard and save the `.icns` file. It took me a while to figure out how to do that and question why a `.icns` file was not simply provided in the downloaded archive.

#### [counter]

```
--counter
```

Use a counter that persists even with window focus for the application badge for sites that use an "(X)" format counter in the page title (i.e. Gmail).  Same limitations as the badge option (above).

#### [width]

```
--width <value>
```

Width of the packaged application, defaults to `1280px`.

#### [height]

```
--height <value>
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
By default, Nativefier uses a preset user agent string for your OS and masquerades as a regular Google Chrome browser, so that sites like WhatsApp Web will not say that the current browser is unsupported.

If this flag is passed, it will not override the user agent.

#### [ignore-certificate]

```
--ignore-certificate
```
Forces the packaged app to ignore certificate errors.

#### [insecure]

```
--insecure
```
Forces the packaged app to ignore web security errors.

#### [flash]

```
--flash <value>
```

By default, Nativefier will automatically try to determine the location of your Google Chrome flash binary. In the event that Flash does not appear to work, you can specify it directly with this command line flag, by retrieving the location of the Flash path from [chrome://plugins](chrome://plugins), under `Adobe Flash Player` > `Location`.

From my experience, it might be helpful to pass the `--insecure` flag if you are using nativefied flash apps, as some `https` websites tend to serve flash insecurely.

#### [inject]

```
--inject <value>
```

Allows you to inject a javascript or css file. This command can be run multiple times to inject the files.

Example:

```bash
$ nativefier http://google.com --inject ./some-js-injection.js --inject ./some-css-injection.css ~/Desktop
```

#### [full-screen]

```
--full-screen
```

Makes the packaged app start in full screen.

## Programmatic API

You can use the Nativefier programmatic API as well.

```bash
$ npm install --save nativefier
```

In your `.js` file:

```javascript
var nativefier = require('nativefier').default;

// possible options, defaults unless specified otherwise
var options = {
    name: 'Web WhatsApp', // will be inferred if not specified
    targetUrl: 'http://web.whatsapp.com', // required
    platform: 'darwin', // defaults to the current system
    arch: 'x64', // defaults to the current system
    version: '0.36.4',
    out: '.',
    overwrite: false,
    asar: false, // see conceal
    icon: '~/Desktop/icon.png',
    counter: false,
    width: 1280,
    height: 800,
    showMenuBar: false,
    userAgent: 'Mozilla ...', // will infer a default for your current system
    ignoreCertificate: false,
    insecure: false,
    honest: false
};

nativefier(options, function(error, appPath) {
    if (error) {
        console.error(error);
        return;
    }
    console.log('App has been nativefied to', appPath);
});
```

More description about the `options` for `nativefier` can be found at the section on [command line flags](#command-line-options).

## How It Works

A template app with the appropriate event listeners and callbacks set up is included in the `./app` folder. When the `nativefier` command is executed, this folder is copied to a temporary directory with the appropriate parameters in a configuration file, and is packaged into an app with [Electron Packager](https://github.com/maxogden/electron-packager).

In addition, I built and used [pageIcon](https://github.com/jiahaog/page-icon) to automatically retrieve a relevant icon from a url.

## Development

### Environment Setup

First clone the project

```bash
$ git clone https://github.com/jiahaog/nativefier.git
$ cd nativefier
```

Install dependencies

```bash
# OSX and Linux
$ npm run dev-up

# Windows
$ npm install
$ cd app
$ npm install
```

You can set up symlinks so that you can run `$ nativefier` for your local changes

```bash
$ npm link
```

After doing so, you can then run Nativefier with your test parameters

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

### Tests

```bash
$ npm test
```

## License

MIT
