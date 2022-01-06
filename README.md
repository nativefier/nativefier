# Nativefier

![Example of Nativefier app in the macOS dock](.github/dock-screenshot.png)

You want to make a native-looking wrapper for WhatsApp Web (or any web page).

```bash
nativefier 'web.whatsapp.com'
```

![Walkthrough animation](.github/nativefier-walkthrough.gif)

You're done.

## Introduction

Nativefier is a command-line tool to easily create a "desktop app" for any web site
with minimal fuss. Apps are wrapped by [Electron](https://www.electronjs.org/)
(which uses Chromium under the hood) in an OS executable (`.app`, `.exe`, etc)
usable on Windows, macOS and Linux.

I built this because I grew tired of having to `alt-tab` to my browser and then search
through numerous open tabs when using [Messenger](https://messenger.com) or
[Whatsapp Web](https://web.whatsapp.com) ([HN thread](https://news.ycombinator.com/item?id=10930718)). Nativefier features:

- Automatically retrieval of app icon / name
- Injection of custom JS & CSS
- Many more, see the [API docs](API.md) or `nativefier --help`

## Installation

Install Nativefier globally with `npm install -g nativefier` . Requirements:

- macOS 10.9+ / Windows / Linux
- [Node.js](https://nodejs.org/) ≥ 12.9 and npm ≥ 6.9

Optional dependencies:

- [ImageMagick](http://www.imagemagick.org/) or [GraphicsMagick](http://www.graphicsmagick.org/) to convert icons.
  Be sure `convert` + `identify` or `gm` are in your `$PATH`.
- [Wine](https://www.winehq.org/) to build Windows apps from non-Windows platforms.
  Be sure `wine` is in your `$PATH`.

## Usage

To create a native desktop app for [medium.com](https://medium.com),
simply `nativefier "medium.com"`

Nativefier will try to determine the app name, and well as lots of other options.
If desired, these options can be overwritten. For example, to override the name,
`nativefier --name 'My Medium App' 'medium.com'`

**Read the [API documentation](API.md) or run `nativefier --help`**
to learn about other command-line flags usable to configure the packaged app.

To have high-resolution icons used by default for an app/domain, please
contribute to the [icon repository](https://github.com/nativefier/nativefier-icons)!

### Catalog

For a list of build commands contributed by the Nativefier community, see [CATALOG.md file](CATALOG.md).

## Docker

Nativefier is also usable from Docker:

- Pull the image from [Docker Hub](https://hub.docker.com/r/nativefier/nativefier): `docker pull nativefier/nativefier`
- ... or build it yourself: `docker build -t local/nativefier .`
  (in this case, replace `nativefier/` in the below examples with `local/`)

By default, `nativefier --help` will be executed.
To build e.g. a Gmail app into `~/nativefier-apps`,

```bash
docker run --rm -v ~/nativefier-apps:/target/ nativefier/nativefier https://mail.google.com/ /target/
```

You can pass Nativefier flags, and mount volumes to pass local files. E.g. to use an icon,

```bash
docker run --rm -v ~/my-icons-folder/:/src -v $TARGET-PATH:/target nativefier/nativefier --icon /src/icon.png --name whatsApp -p linux -a x64 https://web.whatsapp.com/ /target/
```

## Development

Help welcome on [bugs](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Abug) and
[feature requests](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request)!

Docs: [Developer / build / hacking](HACKING.md), [API / flags](API.md),
[Changelog](CHANGELOG.md).

## License

[MIT](LICENSE.md).

## Troubleshooting

Generally, see [Catalog](CATALOG.md) for ideas & workarounds, and search in existing issues.

### Site says I use an old/unsupported browser

Some sites intentionally block Nativefier (or similar) apps, e.g. [Google](https://github.com/nativefier/nativefier/issues/831) and [WhatsApp](https://github.com/nativefier/nativefier/issues/1112).

First, try setting the [`--user-agent`](https://github.com/nativefier/nativefier/blob/master/API.md#user-agent) to `firefox` or `safari`.

If still broken, see [Catalog](CATALOG.md) for ideas & workarounds, and search in existing issues.

### Videos won't play

This issue comes up for certain sites like [HBO Max](https://github.com/nativefier/nativefier/issues/1153) and [Udemy](https://github.com/nativefier/nativefier/issues/1147).

First, try our [`--widevine` flag](API.md#widevine).

If still broken, see [Catalog](CATALOG.md) for ideas & workarounds, and search in existing issues.

### Settings cached between app rebuilds

This issue can occur because the cache of the app and the app itself are kept separate by default. You can try clearing out the cache.

Try delete your app's cache, which can be found in `<your_app_name_lower_case>-nativefier-<random_id>` in your OS's "App Data" directory (for Linux: `$XDG_CONFIG_HOME` or `~/.config` , for MacOS: `~/Library/Application Support/` , for Windows: `%APPDATA%` or `C:\Users\yourprofile\AppData\Roaming`)
