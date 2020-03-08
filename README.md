# Nativefier

[![Build Status](https://travis-ci.org/jiahaog/nativefier.svg)](https://travis-ci.org/jiahaog/nativefier)
[![npm version](https://badge.fury.io/js/nativefier.svg)](https://www.npmjs.com/package/nativefier)

![Dock](dock.png)

You want to make a native wrapper for WhatsApp Web (or any web page).

```bash
nativefier web.whatsapp.com
```

![Walkthrough animation](walkthrough.gif)

You're done.

## Table of Contents

  - [Installation](#installation)
  - [Usage](#usage)
  - [How it works](#how-it-works)
  - [Development](docs/development.md)
  - [License](#license)

## Introduction

Nativefier is a command-line tool to easily create a desktop application for any web site with succinct and minimal configuration. Apps are wrapped by [Electron](https://www.electronjs.org/) in an OS executable (`.app`, `.exe`, etc.) for use on Windows, macOS and Linux.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](https://messenger.com) or [Whatsapp Web](https://web.whatsapp.com) ([relevant Hacker News thread](https://news.ycombinator.com/item?id=10930718)).

[Changelog](https://github.com/jiahaog/nativefier/blob/master/CHANGELOG.md). [Developer docs](https://github.com/jiahaog/nativefier/blob/master/docs/development.md).

Features:

- Automatically retrieves the correct icon and app name.
- JavaScript and CSS injection.
- Many more, see the [API docs](docs/api.md) or `nativefier --help`

## Installation

- macOS 10.9+ / Windows / Linux
- [Node.js](https://nodejs.org/) `>=8`
- Optional dependencies:
    - [ImageMagick](http://www.imagemagick.org/) to convert icons. Make sure `convert` and `identify` are in your `$PATH`.
    - [Wine](https://www.winehq.org/) to package Windows apps under non-Windows platforms. Make sure `wine` is in your `$PATH`.

```bash
npm install nativefier -g
```

## Usage

Creating a native desktop app for [medium.com](https://medium.com):

```bash
nativefier "medium.com"
```

Nativefier will attempt to determine the app name, your OS and processor architecture, among other options. If desired, the app name or other options can be overwritten by specifying the `--name "Medium"` as part of the command line options:

```bash
nativefier --name "Some Awesome App" "medium.com"
```

Read the [API documentation](docs/api.md) (or `nativefier --help`) for other command-line flags that can be used to configure the packaged app.

To have high-resolution icons used by default for an app/domain, please contribute to the [icon repository](https://github.com/jiahaog/nativefier-icons)!

Note that the application menu is hidden by default for a minimal UI. You can press the `alt` keyboard key to access it.

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
