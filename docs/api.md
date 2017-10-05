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
    - [[min-width]](#min-width)
    - [[min-height]](#min-height)
    - [[max-width]](#max-width)
    - [[max-height]](#max-height)
    - [[show-menu-bar]](#show-menu-bar)
    - [[fast-quit]](#fast-quit)
    - [[user-agent]](#user-agent)
    - [[honest]](#honest)
    - [[ignore-certificate]](#ignore-certificate)
    - [[insecure]](#insecure)
    - [[flash]](#flash)
    - [[flash-path]](#flash-path)
    - [[disk-cache-size]](#disk-cache-size)
    - [[inject]](#inject)
    - [[full-screen]](#full-screen)
    - [[maximize]](#maximize)
    - [[hide-window-frame]](#hide-window-frame)
    - [[verbose]](#verbose)
    - [[disable-context-menu]](#disable-context-menu)
    - [[disable-dev-tools]](#disable-dev-tools)
    - [[zoom]](#zoom)
    - [[crash-reporter]](#crash-reporter)
    - [[single-instance]](#single-instance)
    - [[tray]](#tray)
    - [[basic-auth-username]](#basic-auth-username)
    - [[basic-auth-password]](#basic-auth-username)
- [Programmatic API](#programmatic-api)

## Command Line

```bash
nativefier [options] <targetUrl> [dest]
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

Processor architecture, automatically determined based on the current OS. Can be overwritten by specifying either `ia32`, `x64` or `armv7l`.

#### [app-copyright]

```
--app-copyright <value>
```

The human-readable copyright line for the app. Maps to the `LegalCopyright` metadata property on Windows, and `NSHumanReadableCopyright` on OS X.

#### [app-version]

```
--app-version <value>
```

The release version of the application. By default the `version` property in the `package.json` is used but it can be overridden with this argument. If neither are provided, the version of Electron will be used. Maps to the `ProductVersion` metadata property on Windows, and `CFBundleShortVersionString` on OS X.

#### [build-version]

```
--build-version <value>
```

The build version of the application. Maps to the `FileVersion` metadata property on Windows, and `CFBundleVersion` on OS X.

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

The icon parameter can either be a `.icns` or a `.png` file if the [optional dependencies](../README.md#optional-dependencies) are installed.

If you have the optional dependencies `iconutil`, Imagemagick `convert`, and Imagemagick `identify` in your `PATH`, Nativefier will automatically convert the `.png` to a `.icns` for you.

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

#### [min-width]

```
--min-width <value>
```

Minimum width of the packaged application, defaults to `0`.

#### [min-height]

```
--min-height <value>
```

Minimum height of the packaged application, defaults to `0`.

#### [max-width]

```
--max-width <value>
```

Maximum width of the packaged application, default is no limit.

#### [max-height]

```
--max-height <value>
```

Maximum height of the packaged application, default is no limit.

#### [show-menu-bar]

```
-m, --show-menu-bar
```

Specifies if the menu bar should be shown.

#### [fast-quit]

```
-f, --fast-quit
```

(OSX Only) Specifies to quit the app after closing all windows, defaults to false.

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

#### [ignore-gpu-blacklist]

```
--ignore-gpu-blacklist
```
Passes the ignore-gpu-blacklist flag to the Chrome engine, to allow for WebGl apps to work on non supported graphics cards.

#### [enable-es3-apis]

```
--enable-es3-apis
```
Passes the enable-es3-apis flag to the Chrome engine, to force the activation of WebGl 2.0.


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

#### [disk-cache-size]

```
--disk-cache-size <value>
```
Forces the maximum disk space to be used by the disk cache. Value is given in bytes.

#### [inject]

```
--inject <value>
```

Allows you to inject a javascript or css file. This command can be run multiple times to inject the files.

Example:

```bash
nativefier http://google.com --inject ./some-js-injection.js --inject ./some-css-injection.css ~/Desktop
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


#### [hide-window-frame]

```
--hide-window-frame
```

Disable window frame and controls


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

#### [disable-dev-tools]

```
--disable-dev-tools
```

Disable the Chrome developer tools

#### [crash-reporter]

```
--crash-reporter <value>
```

Enables crash reporting and set the URL to submit crash reports to

Example:

```bash
nativefier http://google.com --crash-reporter https://electron-crash-reporter.appspot.com/PROJECT_ID/create/
```

#### [zoom]

```
--zoom <value>
```

Sets a default zoom factor to be used when the app is opened, defaults to `1.0`.

#### [single-instance]

```
--single-instance
```

Prevents application from being run multiple times. If such an attempt occurs the already running instance is brought to front.

#### [tray]

```
--tray
```

Application will stay as an icon in the system tray. Prevents application from being closed from clicking the window close button.

#### [basic-auth-username]

```
--basic-auth-username <value> --basic-auth-password <value>
```

Set basic http(s) auth via the command line to have the app automatically log you in to a protected site. Both fields are required if one is set.


#### [processEnvs]

```
--processEnvs <json-string>
```

a JSON string of key/value pairs to be set as environment variables before any browser windows are opened.

Example:

```bash
nativefier <your-geolocation-enabled-website> --processEnvs '{"GOOGLE_API_KEY": "<your-google-api-key>"}'
```

## Programmatic API

You can use the Nativefier programmatic API as well.

```bash
# install and save to package.json
npm install --save nativefier
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
    fastQuit: false,
    userAgent: 'Mozilla ...', // will infer a default for your current system
    ignoreCertificate: false,
    ignoreGpuBlacklist: false,
    enableEs3Apis: false,
    insecure: false,
    honest: false,
    zoom: 1.0,
    singleInstance: false,
    processEnvs: {
      "GOOGLE_API_KEY": "<your-google-api-key>"
    }
};

nativefier(options, function(error, appPath) {
    if (error) {
        console.error(error);
        return;
    }
    console.log('App has been nativefied to', appPath);
});
```

### Addition packaging options for Windows

#### [version-string]

*Object* (**deprecated** and will be removed in a future major version (of `electron-packager`), please use the
[`win32metadata`](#win32metadata) parameter instead)

#### [win32metadata]

```
--win32metadata <json-string>
```

a JSON string of key/value pairs of application metadata (ProductName, InternalName, FileDescription) to embed into the executable (Windows only).

Example:

```bash
nativefier <your-geolocation-enabled-website> --win32metadata '{"ProductName": "Your Product Name", "InternalName", "Your Internal Name", "FileDescription": "Your File Description"}'
```

##### Programmatic API

*Object*

Object (also known as a "hash") of application metadata to embed into the executable:
- `CompanyName`
- `FileDescription`
- `OriginalFilename`
- `ProductName`
- `InternalName`

_(Note that `win32metadata` was added to `electron-packager` in version 8.0.0)_

In your `.js` file:

```javascript
var options = {
    ...
    win32metadata: {
      CompanyName: 'Your Company Name',
      FileDescription: 'Your File Description',
      OriginalFilename: 'Your Original Filename',
      ProductName: 'Your Product Name',
      InternalName: 'Your Internal Name'
    }
};
```

More description about the options for `nativefier` can be found at the above [section](#command-line).
