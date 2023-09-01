# Nativefier - Transform Websites into Desktop Apps

Are you tired of juggling multiple browser tabs to access your favorite web apps like Messenger or WhatsApp Web? Meet Nativefier, the practical tool that effortlessly turns any website into a "desktop app" with simplicity and efficiency.

![Example of Nativefier app in the macOS dock](.github/dock-screenshot.png)

## Preview

![Walkthrough animation](.github/nativefier-walkthrough.gif)

## Introduction

Nativefier is a powerful command-line utility designed to streamline the process of creating dedicated desktop applications for web services. It achieves this by wrapping web apps using Electron, which is essentially Chromium under the hood. This transformation results in executable files (.app, .exe, etc.) that are compatible with Windows, macOS, and Linux.

Gone are the days of endlessly searching for your web apps amidst a sea of browser tabs. Nativefier simplifies your digital life by encapsulating your web services in standalone applications.

## Installation

Before you embark on this web app transformation journey, ensure you have the following prerequisites:

- An operating system (macOS 10.13+, Windows, or Linux)
- [Node.js](https://nodejs.org/) version 16.9 or higher and npm version 7.10 or higher

If you want to enhance your web app experience further, consider these optional dependencies:

- [ImageMagick](http://www.imagemagick.org/) or [GraphicsMagick](http://www.graphicsmagick.org/) for converting icons. Make sure that `convert` and `identify` (or `gm`) are available in your `$PATH`.
- [Wine](https://www.winehq.org/) to convert web apps into Windows applications from non-Windows platforms. Ensure that `wine` is accessible in your `$PATH`.

<details>
  <summary>Or install with Docker (click to expand)</summary>

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
</details>

<details>
  <summary>Or install with Snap & AUR (click to expand)</summary>

  These repos are *not* managed by Nativefier maintainers; use at your own risk.
  If using them, for your security, please inspect the build script.

  - [Snap](https://snapcraft.io/nativefier)
  - [AUR](https://aur.archlinux.org/packages/nodejs-nativefier)
</details>

## Usage

Creating a dedicated app for a website is incredibly straightforward. Just specify the website URL, like so:

```bash
nativefier 'github.com'
```

Nativefier is intelligent enough to attempt to discern the app's name. However, if you desire more control, you can override the name with a custom choice:

```bash
nativefier --name 'GitHub' 'github.com
```

For the adventurous souls, there's a wealth of customization options available in the [API documentation](API.md) and via `nativefier --help`. These options allow you to fine-tune your app's appearance and behavior.

## Troubleshooting

Encountering stubborn websites that resist being wrapped as apps? Don't fret. We've compiled a handy [CATALOG.md](CATALOG.md) with site-specific tips and workarounds contributed by the community. If you still face issues, our [issue tracker](https://github.com/nativefier/nativefier/issues) is where you can seek additional assistance.

## Development

Are you a developer looking to contribute? We welcome your support wholeheartedly! Whether it's fixing [bugs](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Abug) or fulfilling [feature requests](https://github.com/nativefier/nativefier/issues?q=is%3Aopen+is%3Aissue+label%3Afeature-request), your efforts are appreciated. Consult our documentation for guidance: [Developer / build / hacking](HACKING.md), [API / flags](API.md), and stay updated with the [Changelog](CHANGELOG.md).

## License

Nativefier is licensed under the [MIT License](LICENSE.md).
