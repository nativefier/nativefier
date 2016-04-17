# API

## Table of Contents

- [Command Line](#command-line)
    - [Target Url](#target-url)
    - [[dest]](#dest)
    - [Help](#help)
    - [Version](#version)
    - [[name]](#name)
    - [[platform]](#platform)
    - [[arch]](#arch)
    - [[electron-version]](#electron-version)
    - [[no-overwrite]](#no-overwrite)
    - [[conceal]](#conceal)
    - [[icon]](#icon)
    - [[counter]](#counter)
    - [[width]](#width)
    - [[height]](#height)
    - [[show-menu-bar]](#show-menu-bar)
    - [[user-agent]](#user-agent)
    - [[honest]](#honest)
    - [[ignore-certificate]](#ignore-certificate)
    - [[insecure]](#insecure)
    - [[flash]](#flash)
    - [[flash-path]](#flash-path)
    - [[inject]](#inject)
    - [[full-screen]](#full-screen)
    - [[maximize]](#maximize)
    - [[verbose]](#verbose)
- [Programmatic API](#programmatic-api)

## Command Line

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

The icon parameter can either be a `.icns` or a `.png` file if the optional dependencies listed are installed.

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
Forces the packaged app to ignore web security errors, such as [Mixed Content](https://developer.mozilla.org/en-US/docs/Security/Mixed_content) errors when receiving HTTP content on a HTTPS site.

#### [flash]

```
--flash
```

If `--flash` is specified, Nativefier will automatically try to determine the location of your Google Chrome flash binary. Take note that the version of Chrome on your computer should be the same as the version used by the version of Electron for the Nativefied package.

Take note that if this flag is specified, the `--insecure` flag will be added automatically, to prevent the Mixed Content errors on sites such as [Twitch.tv](https://www.twitch.tv/).

#### [flash-path]

```
--flash-path <value>
```

You can also specify the path to the Chrome flash plugin directly with this flag. The path can be found at [chrome://plugins](chrome://plugins), under `Adobe Flash Player` > `Location`. This flag automatically enables the `--flash` flag as well.

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


#### [maximize]

```
--maximize
```

Makes the packaged app start maximized.

#### [verbose]

```
--verbose
```

Shows detailed logs in the console.

#### [disable-context-menu]

```
--disable-context-menu
```

Disable the context menu

## Programmatic API

You can use the Nativefier programmatic API as well.

```bash
# install and save to package.json
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

More description about the options for `nativefier` can be found at the above [section](#command-line).
