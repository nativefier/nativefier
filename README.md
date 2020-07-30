# Nativefier

[![Build Status](https://travis-ci.org/jiahaog/nativefier.svg)](https://travis-ci.org/jiahaog/nativefier)
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

```bash
npm install -g nativefier
```

## Docker Installation
- Docker (Install it [here](https://docs.docker.com/get-docker/))

To build your first nativefier application using Docker, run
```bash
docker run -v $TARGET-PATH:/target snpranav/nativefier https://my-web-app.com/ /target/
```
You can also pass nativefier flags, and mount additional volumes to provide local files. For example, to use a icon:
```bash
docker run -v $PATH_TO_ICON/:/src -v $TARGET-PATH:/target snpranav/nativefier --icon /src/icon.png --name WhatsApp -p linux -a x64 https://my-web-app.com/ /target/
```
Docker hub - [https://hub.docker.com/r/snpranav/nativefier](https://hub.docker.com/r/snpranav/nativefier)

Docker image maintained on [https://gitlab.com/snpranav/nativefier/](https://gitlab.com/snpranav/nativefier-docker/).

Docker images will be updated every day automatically using GitLab CI/CD in the Docker image repository. If they are not updated, you can raise an issue on the [Docker image repository](https://gitlab.com/snpranav/nativefier-docker/).

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

## Development

Help welcome on [bugs](https://github.com/jiahaog/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Abug) and
[feature requests](https://github.com/jiahaog/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request).

[Developer / build docs](docs/development.md), [API documentation](docs/api.md), 
[Changelog](CHANGELOG.md).

## License

[MIT](LICENSE.md)
