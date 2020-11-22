# Nativefier

[![Build Status](https://github.com/jiahaog/nativefier/workflows/ci/badge.svg)](https://github.com/jiahaog/nativefier/actions?query=workflow%3Aci)
[![npm version](https://badge.fury.io/js/nativefier.svg)](https://www.npmjs.com/package/nativefier)

![Dock](docs/dock.png)

You want to make a native wrapper for WhatsApp Web (or any web page).

```bash
nativefier web.whatsapp.com
```

![Walkthrough animation](docs/walkthrough.gif)

You're done.

## Introduction

Nativefier is a command-line tool to easily create a desktop app for any web site
with minimal configuration. Apps are wrapped by [Electron](https://www.electronjs.org/)
(which uses Chromium under the hood) in an OS executable (`.app`, `.exe`, etc)
for use on Windows, macOS and Linux.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search
through the numerous open tabs when I was using [Facebook Messenger](https://messenger.com) or
[Whatsapp Web](https://web.whatsapp.com) ([HN thread](https://news.ycombinator.com/item?id=10930718)). Nativefier features:

- Automatically retrieval of app icon / name.
- JavaScript and CSS injection.
- Many more, see the [API docs](docs/api.md) or `nativefier --help`

## Installation

- macOS 10.9+ / Windows / Linux
- [Node.js](https://nodejs.org/) `>= 10` and npm `>= 6`
- Optional dependencies:
    - [ImageMagick](http://www.imagemagick.org/) to convert icons.
      Make sure `convert` and `identify` are in your system `$PATH`.
    - [Wine](https://www.winehq.org/) to package Windows apps under non-Windows platforms.
      Make sure `wine` is in your system `$PATH`.

Then, install Nativefier globally with  `npm install -g nativefier`

## Usage

To create a native desktop app for [medium.com](https://medium.com),
simply  `nativefier "medium.com"`

Nativefier will try to determine the app name, and well as lots of other options.
If desired, these options can be overwritten. For example, to override the name,
`nativefier --name 'My Medium App' 'medium.com'`

**Read the [API documentation](docs/api.md) or run `nativefier --help`**
to learn about other command-line flags usable to configure the packaged app.

To have high-resolution icons used by default for an app/domain, please
contribute to the [icon repository](https://github.com/jiahaog/nativefier-icons)!

## Usage with Docker

Nativefier is also usable from Docker.
- Pull the latest stable image from Docker Hub: `docker pull jiahaog/nativefier`
- ... or build the image yourself: `docker build -t local/nativefier .`
  (in this case, replace `jiahaog/` in the below examples with `local/`)

By default, the command `nativefier --help` will be executed.
To build e.g. a Gmail nativefier app to a writable local `~/nativefier-apps`,

```bash
docker run --rm -v ~/nativefier-apps:/target/ jiahaog/nativefier https://mail.google.com/ /target/
```

You can pass Nativefier flags, and mount volumes to provide local files. For example, to use an icon,

```bash
docker run --rm -v ~/my-icons-folder/:/src -v $TARGET-PATH:/target jiahaog/nativefier --icon /src/icon.png --name whatsApp -p linux -a x64 https://web.whatsapp.com/ /target/
```

## Development

Help welcome on [bugs](https://github.com/jiahaog/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Abug) and
[feature requests](https://github.com/jiahaog/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request).

[Developer / build docs](docs/development.md), [API documentation](docs/api.md), 
[Changelog](CHANGELOG.md).

## License

[MIT](LICENSE.md)
