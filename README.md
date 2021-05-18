# Nativefier

![Example of Nativefier app in the macOS dock](.github/dock-screenshot.png)

You want to make a native wrapper for WhatsApp Web (or any web page).

```bash
nativefier 'web.whatsapp.com'
```

![Walkthrough animation](.github/nativefier-walkthrough.gif)

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
- Many more, see the [API docs](API.md) or `nativefier --help`

## Installation

- macOS 10.9+ / Windows / Linux
- [Node.js](https://nodejs.org/) `>= 10` and npm `>= 6`
- Optional dependencies:
    - [ImageMagick](http://www.imagemagick.org/) or [GraphicsMagick](http://www.graphicsmagick.org/) to convert icons.
      Make sure `convert` and `identify` or `gm` are in your system `$PATH`.
    - [Wine](https://www.winehq.org/) to package Windows apps under non-Windows platforms.
      Make sure `wine` is in your system `$PATH`.

Then, install Nativefier globally with  `npm install -g nativefier`

## Usage

To create a native desktop app for [medium.com](https://medium.com),
simply  `nativefier "medium.com"`

Nativefier will try to determine the app name, and well as lots of other options.
If desired, these options can be overwritten. For example, to override the name,
`nativefier --name 'My Medium App' 'medium.com'`

**Read the [API documentation](API.md) or run `nativefier --help`**
to learn about other command-line flags usable to configure the packaged app.

To have high-resolution icons used by default for an app/domain, please
contribute to the [icon repository](https://github.com/nativefier/nativefier-icons)!

### Build Commands Catalog

For a list of build commands contributed by the nativefier community take a look at the [CATALOG.md file](CATALOG.md)

## Usage with Docker

Nativefier is also usable from Docker.
- Pull the latest stable image from Docker Hub: `docker pull nativefier/nativefier`
- ... or build the image yourself: `docker build -t local/nativefier .`
  (in this case, replace `nativefier/` in the below examples with `local/`)

By default, the command `nativefier --help` will be executed.
To build e.g. a Gmail nativefier app to a writable local `~/nativefier-apps`,

```bash
docker run --rm -v ~/nativefier-apps:/target/ nativefier/nativefier https://mail.google.com/ /target/
```

You can pass Nativefier flags, and mount volumes to provide local files. For example, to use an icon,

```bash
docker run --rm -v ~/my-icons-folder/:/src -v $TARGET-PATH:/target nativefier/nativefier --icon /src/icon.png --name whatsApp -p linux -a x64 https://web.whatsapp.com/ /target/
```

## Development

Help welcome on [bugs](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Abug) and
[feature requests](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request).

[Developer / build docs](HACKING.md), [API documentation](API.md), 
[Changelog](CHANGELOG.md).

## License

[MIT](LICENSE.md)

## Troubleshooting

Before submitting a question or bug report, please ensure you have read through these common issues and see if you can resolve the problem on your own. If you still encounter issues after trying these steps, or you don't see something similar to your issue listed, please submit a [bug report](https://github.com/nativefier/nativefier/issues/new?assignees=&labels=bug&template=bug_report.md).

Take a look a the [Build Command Catalog](CATALOG.md) as a working command for your application may already exist there.

### I am trying to use Nativefier to build an app for a site that tells me I have an old/unsupported browser.

This issue comes up for sites that do not wish to support an app made with Nativefier or similar technologies (such as [Google](https://github.com/nativefier/nativefier/issues/831) and [WhatsApp](https://github.com/nativefier/nativefier/issues/1112))

#### Troubleshooting Steps

1. First try setting the [`--user-agent`](https://github.com/nativefier/nativefier/blob/master/API.md#user-agent) to something different. Try using the value you would get at [https://www.whatismybrowser.com/detect/what-is-my-user-agent] and use your current browser's user agent.
2. If this doesn't work, the site (such as WhatsApp) may be using a service worker to analyze the app and detect. You can disable the service worker cache by doing the following, which is a known fix for WhatsApp:
    1.  Create a javascript file containing the following snippet:
        ```javascript
        if ('serviceWorker' in navigator) {
            caches.keys().then(function (cacheNames) {
                cacheNames.forEach(function (cacheName) {
                    caches.delete(cacheName);
                });
            });
        }
        ```
    2. Inject the javascript file into your app when generating it with the [`--inject`](https://github.com/nativefier/nativefier/blob/master/API.md#inject) argument.

### I am trying to use Nativefier to build an app for a site with video, but the video won't play.

This issue comes up for certain sites like [HBO Max](https://github.com/nativefier/nativefier/issues/1153) and [Udemy](https://github.com/nativefier/nativefier/issues/1147).

#### Troubleshooting Steps

1. First try using the [`--widevine`](https://github.com/nativefier/nativefier/blob/master/API.md#widevine) argument when building the app. This uses the [Castlabs version of Electron](https://github.com/castlabs/electron-releases) which allows the playback of DRM enabled video.
2. If this doesn't work, the site may require your app to be signed for `--widevine` to work. See the [Castlabs documentation](https://github.com/castlabs/electron-releases/wiki/EVS) on using their application signing service to sign the application.

### I am trying different options to Nativefier to experiment with, but noticing that sometimes things cache between rebuilds of my app.

This issue can occur because the cache of the app and the app itself are kept separate by default. You can try clearing out the cache.

#### Troubleshooting Steps

1. Delete your app's cache, which can be found under the folder `<your_app_name_lower_case>-nativefier-<random_id>` in your OS's app data directory
    - `<your_app_name_lower_case>` represents the lowercase version of your app's name. E.g., GitHub would be `github`.
    - `<random_id>` represents a randomly generated id for your app. Open the containing folder to see what it may be.
2. For Linux, the app data directory is `$XDG_CONFIG_HOME` or `~/.config`
3. For MacOS, the app data directory is `~/Library/Application\ Support/`
4. For Windows, the app data directory is `%APPDATA%`
