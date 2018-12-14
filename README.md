# Nativefier

[![Build Status](https://travis-ci.org/jiahaog/nativefier.svg?branch=development)](https://travis-ci.org/jiahaog/nativefier)
[![Code Climate](https://codeclimate.com/github/jiahaog/nativefier/badges/gpa.svg)](https://codeclimate.com/github/jiahaog/nativefier)
[![npm version](https://badge.fury.io/js/nativefier.svg)](https://www.npmjs.com/package/nativefier)
[![Dependency Status](https://david-dm.org/jiahaog/nativefier.svg)](https://david-dm.org/jiahaog/nativefier)

![Dock](screenshots/dock.png)

You want to make a native wrapper for WhatsApp Web (or any web page).

```bash
nativefier web.whatsapp.com
```

![Walkthrough](screenshots/walkthrough.gif)

You're done.

## Table of Contents

  - [Installation](#installation)
  - [Usage](#usage)
  - [Optional dependencies](#optional-dependencies)
  - [How it works](#how-it-works)
  - [Development](docs/development.md)
  - [License](#license)

## Introduction

Nativefier is a command-line tool to easily create a desktop application for any web site with succinct and minimal configuration. Apps are wrapped by [Electron](http://electron.atom.io) in an OS executable (`.app`, `.exe`, etc.) for use on Windows, macOS and Linux.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](http://messenger.com) or [Whatsapp Web](http://web.whatsapp.com) ([relevant Hacker News thread](https://news.ycombinator.com/item?id=10930718)).

[Changelog](https://github.com/jiahaog/nativefier/blob/master/docs/changelog.md). [Developer docs](https://github.com/jiahaog/nativefier/blob/master/docs/development.md).

### Features

- Automatically retrieves the correct icon and app name.
- JavaScript and CSS injection.
- Flash Support (with [`--flash`](docs/api.md#flash) flag).
- Many more, see the [API docs](docs/api.md) or `nativefier --help`

## Installation

### Requirements

- macOS 10.9+ / Windows / Linux
- [Node.js](https://nodejs.org/) `>=6` (4.x may work but is no longer tested, please upgrade)
- See [optional dependencies](#optional-dependencies) for more.

```bash
npm install nativefier -g
```

## Usage

Creating a native desktop app for [medium.com](http://medium.com):

```bash
nativefier "http://medium.com"
```

Nativefier will intelligently attempt to determine the app name, your OS and processor architecture, among other options. If desired, the app name or other options can be overwritten by specifying the `--name "Medium"` as part of the command line options:

```bash
nativefier --name "Some Awesome App" "http://medium.com"
```
Read the [API documentation](docs/api.md) (or `nativefier --help`) for other command line flags and options that can be used to configure the packaged app.

If you would like high resolution icons to be used, please contribute to the [icon repository](https://github.com/jiahaog/nativefier-icons)!

**Windows Users:** Take note that the application menu is automatically hidden by default, you can press `alt` on your keyboard to access it.

**Linux Users:** Do not put spaces if you define the app name yourself with `--name`, as this will cause problems when pinning a packaged app to the launcher.

## Optional dependencies

### Icons for Windows apps packaged under non-Windows platforms

You need [Wine](https://www.winehq.org/) installed; make sure that `wine` is in your `$PATH`.

### Icon conversion for macOS

To support conversion of a `.png` or `.ico` into a `.icns` for a packaged macOS app icon (currently only supported on macOS), you need the following dependencies.

* [iconutil](https://developer.apple.com/library/mac/documentation/GraphicsAnimation/Conceptual/HighResolutionOSX/Optimizing/Optimizing.html) (comes with [Xcode](https://developer.apple.com/xcode/)).
* [imagemagick](http://www.imagemagick.org/script/index.php). Make sure `convert` and `identify` are in your `$PATH`.
* If the tools are not found, then Nativefier will fall back to the built-in macOS tool `sips` to perform the conversion, which is more limited.

### Flash

[Google Chrome](https://www.google.com/chrome/) is required for flash to be supported; you should pass the path to its embedded Flash plugin to the `--flash` flag. See the [API docs](docs/api.md) for more details.

## How it works

A template app with the appropriate plumbing is included in the `./app` folder. When `nativefier` is run, this template is parameterized, and packaged using [Electron Packager](https://github.com/electron-userland/electron-packager).

In addition, I built [GitCloud](https://github.com/jiahaog/gitcloud) to use GitHub as an icon index, and also the [pageIcon](https://github.com/jiahaog/page-icon) fallback to infer a relevant icon from a URL.

## Development

Help welcome on [bugs](https://github.com/jiahaog/nativefier/issues?q=is%3Aissue+label%3Abug) and [feature requests](https://github.com/jiahaog/nativefier/issues?q=is%3Aissue+label%3A%22feature+request%22)!

Get started with our docs: [Development](docs/development.md), [API](docs/api.md).

## Docker Image

The [Dockerfile](Dockerfile) is designed to be used like the "normal" nativefier app. By default, the command `nativefier --help` will be executed. Before you can use the image, you have to build it:

    docker build -t local/nativefier .
 
After that, you can build your first nativefier app to the local `$TARGET-PATH`. Ensure you have write access to the `$TARGET-PATH`:

    docker run -v $TARGET-PATH:/target local/nativefier https://my-web-app.com/ /target/

You can also pass nativefier flags, and mount additional volumes to provide local files. For example, to use a icon:

    docker run -v $PATH_TO_ICON/:/src -v $TARGET-PATH:/target local/nativefier --icon /src/icon.png --name whatsApp -p linux -a x64 https://my-web-app.com/ /target/

## License

[MIT](LICENSE.md)
