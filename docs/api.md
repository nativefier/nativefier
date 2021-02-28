# API

## Table of Contents

- [Table of Contents](#table-of-contents)
- [Packaging Squirrel-based installers](#packaging-squirrel-based-installers)
- [Command Line](#command-line)
  - [Target Url](#target-url)
  - [[dest]](#dest)
  - [Help](#help)
  - [Version](#version)
  - [[name]](#name)
  - [[platform]](#platform)
  - [[arch]](#arch)
  - [[app-copyright]](#app-copyright)
  - [[app-version]](#app-version)
  - [[build-version]](#build-version)
  - [[electron-version]](#electron-version)
  - [[widevine]](#widevine)
  - [[no-overwrite]](#no-overwrite)
  - [[conceal]](#conceal)
  - [[icon]](#icon)
    - [Packaging for Windows](#packaging-for-windows)
    - [Packaging for Linux](#packaging-for-linux)
    - [Packaging for macOS](#packaging-for-macos)
      - [Manually Converting `.icns`](#manually-converting-icns)
  - [[counter]](#counter)
  - [[bounce]](#bounce)
  - [[width]](#width)
  - [[height]](#height)
  - [[min-width]](#min-width)
  - [[min-height]](#min-height)
  - [[max-width]](#max-width)
  - [[max-height]](#max-height)
  - [[x]](#x)
  - [[y]](#y)
  - [[show-menu-bar]](#show-menu-bar)
  - [[fast-quit]](#fast-quit)
  - [[user-agent]](#user-agent)
  - [[honest]](#honest)
  - [[ignore-certificate]](#ignore-certificate)
  - [[disable-gpu]](#disable-gpu)
  - [[ignore-gpu-blacklist]](#ignore-gpu-blacklist)
  - [[enable-es3-apis]](#enable-es3-apis)
  - [[insecure]](#insecure)
  - [[internal-urls]](#internal-urls)
  - [[block-external-urls]](#block-external-urls)
  - [[proxy-rules]](#proxy-rules)
  - [[flash]](#flash)
  - [[flash-path]](#flash-path)
  - [[disk-cache-size]](#disk-cache-size)
  - [[inject]](#inject)
  - [[full-screen]](#full-screen)
  - [[maximize]](#maximize)
  - [[hide-window-frame]](#hide-window-frame)
  - [[title-bar-style]](#title-bar-style)
  - [[verbose]](#verbose)
  - [[disable-context-menu]](#disable-context-menu)
  - [[disable-dev-tools]](#disable-dev-tools)
  - [[crash-reporter]](#crash-reporter)
  - [[zoom]](#zoom)
  - [[single-instance]](#single-instance)
  - [[clear-cache]](#clear-cache)
  - [[tray]](#tray)
  - [[basic-auth-username]](#basic-auth-username)
  - [[processEnvs]](#processenvs)
  - [[file-download-options]](#file-download-options)
  - [[always-on-top]](#always-on-top)
  - [[global-shortcuts]](#global-shortcuts)
  - [[browserwindow-options]](#browserwindow-options)
  - [[darwin-dark-mode-support]](#darwin-dark-mode-support)
  - [[background-color]](#background-color)
  - [[disable-old-build-warning-yesiknowitisinsecure]](#disable-old-build-warning-yesiknowitisinsecure)
- [Programmatic API](#programmatic-api)
  - [Addition packaging options for Windows](#addition-packaging-options-for-windows)
    - [[version-string]](#version-string)
    - [[win32metadata]](#win32metadata)
      - [Programmatic API](#programmatic-api)

## Packaging Squirrel-based installers

See [PR #744 - Support packaging nativefier applications into Squirrel-based installers](https://github.com/nativefier/nativefier/pull/744)

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
-v, --version
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

Automatically determined based on the current OS. Can be overwritten by specifying either `linux`, `windows`, `osx` or `mas` for a Mac App Store specific build.

The alternative values `win32` (for Windows) or `darwin`, `mac` (for macOS) can also be used.

#### [arch]

```
-a, --arch <value>
```

The processor architecture to target when building.

- Automatically set to the build-time machine architecture...
- ... or can be overridden by specifying one of: `x64`, `arm`, `arm64`, `ia32`.

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

#### [widevine]

```
--widevine
```

Use a Widevine-enabled version of Electron for DRM playback, see https://github.com/castlabs/electron-releases.

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

##### Packaging for Windows

The icon parameter should be a path to a `.ico` file.

##### Packaging for Linux

The icon parameter should be a path to a `.png` file.

##### Packaging for macOS

The icon parameter can either be a `.icns` or a `.png` file if the [optional dependencies](../README.md#optional-dependencies) are installed.

If your `PATH` has our image-conversion dependencies (`iconutil`, and either ImageMagick `convert` + `identify`, or GraphicsMagick `gm`), Nativefier will automatically convert the `.png` to a `.icns` for you.

On MacOS 10.14+, if you have set a global shortcut that includes a Media key, the user will need to be prompted for permissions to enable these keys in System Preferences > Security & Privacy > Accessibility.

###### Manually Converting `.icns`

[iConvertIcons](https://iconverticons.com/online/) can be used to convert `.pngs`, though it can be quite cumbersome.

To retrieve the `.icns` file from the downloaded file, extract it first and press File > Get Info. Then select the icon in the top left corner of the info window and press `⌘-C`. Open Preview and press File > New from clipboard and save the `.icns` file. It took me a while to figure out how to do that and question why a `.icns` file was not simply provided in the downloaded archive.

#### [counter]

```
--counter
```

Use a counter that persists even with window focus for the application badge for sites that use an "(X)" format counter in the page title (i.e. Gmail).

#### [bounce]

```
--bounce
```

(macOS only) When the counter increases, the dock icon will bounce for one second. This only works if the `--counter` option is active.

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

#### [x]

```
--x <value>
```

X location of the packaged application window.

#### [y]

```
--y <value>
```

Y location of the packaged application window.

#### [show-menu-bar]

```
-m, --show-menu-bar
```

Specifies if the menu bar should be shown.

#### [fast-quit]

```
-f, --fast-quit
```

(macOS only) Specifies to quit the app after closing all windows, defaults to false.

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

#### [disable-gpu]

```
--disable-gpu
```

Disable hardware acceleration for the packaged application.

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

#### [internal-urls]

```
--internal-urls <regex>
```

Regular expression of URLs to consider "internal"; all other URLs will be opened in an external browser. Defaults to URLs on same second-level domain as app.

Example:

```bash
nativefier https://google.com --internal-urls ".*?\.google\.*?"
```

Or, if you want to allow all domains for example for external auths,

```bash
nativefier https://google.com --internal-urls ".*?"
```

#### [block-external-urls]

```
--block-external-urls
```

Forbid navigation to URLs not considered "internal" (see '--internal-urls'). Instead of opening in an external browser, attempts to navigate to external URLs will be blocked, and an error message will be shown. Default: false

Example:

```bash
nativefier https://google.com --internal-urls ".*?\.google\.*?" --block-external-urls
```

Blocks navigation to any URLs except Google and its subdomains.

#### [proxy-rules]

```
--proxy-rules <value>
```

Proxy rules. See [proxyRules](https://electronjs.org/docs/api/session?q=proxy#sessetproxyconfig-callback) for more details.

Example:

```bash
nativefier https://google.com --proxy-rules http://127.0.0.1:1080
```

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

_Note:_ The javascript file is loaded _after_ `DOMContentLoaded`, so you can assume the DOM is complete & available.

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

Disable window frame and controls.

#### [title-bar-style]

```
--title-bar-style <value>
```

(macOS only) Sets the style for the app's title bar. See more details at electron's [Frameless Window](https://github.com/electron/electron/blob/master/docs/api/frameless-window.md#alternatives-on-macos) documentation.

Consider injecting a custom CSS (via `--inject`) for better integration. Specifically, the CSS should specify a draggable region. For instance, if the target website has a `<header>` element, you can make it draggable like so.

```css
/* site.css */

/* header is draggable... */
header {
  -webkit-app-region: drag;
}

/* but any buttons inside the header shouldn't be draggable */
header button {
  -webkit-app-region: no-drag;
}

/* perhaps move some items out of way for the traffic light */
header div:first-child {
  margin-left: 100px;
  margin-top: 25px;
}
```

```sh
nativefier http://google.com --inject site.css --title-bar-style 'hiddenInset'
```

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

#### [clear-cache]

```
--clear-cache
```

Prevents the application from preserving cache between launches.

#### [tray]

```
--tray [start-in-tray]
```

Application will stay as an icon in the system tray. Prevents application from being closed from clicking the window close button.

When the optional argument `start-in-tray` is provided, i.e. the application is started using `--tray start-in-tray`, the main window will not be shown on first start.

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

#### [file-download-options]

```
--file-download-options <json-string>
```

a JSON string of key/value pairs to be set as file download options. See [electron-dl](https://github.com/sindresorhus/electron-dl) for available options.

Example:

```bash
nativefier <your-website> --file-download-options '{"saveAs": true}'
```

#### [always-on-top]

```
--always-on-top
```

Enable always on top for the packaged application.

#### [global-shortcuts]

```
--global-shortcuts shortcuts.json
```

Register global shortcuts which will trigger input events like key presses or pointer events in the application.

You may define multiple global shortcuts which can trigger a series of input events. It has the following structure:

```js
[
  {
    // Key is passed as first argument to globalShortcut.register
    key: 'CommandOrControl+Shift+Z',
    // The input events exactly match the event config in Electron for contents.sendInputEvent(event)
    inputEvents: [
      {
        // Available event types: mouseDown, mouseUp, mouseEnter, mouseLeave, contextMenu, mouseWheel, mouseMove, keyDown, keyUp or char
        type: 'keyDown',
        // Further config depends on your event type. See docs at: https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssendinputeventevent
        keyCode: 'Space',
      },
    ],
  },
];
```

**Important note for using modifier keys:**

If you want to trigger key events which include a modifier (Ctrl, Shift,...), you need to keyDown the modifier key first, then keyDown the actual key _including_ the modifier key as modifier property and then keyUp both keys again. No idea what this means? See the example for `MediaPreviousTrack` below!

**For more details, please see the Electron documentation:**

- List of available keys: https://github.com/electron/electron/blob/master/docs/api/accelerator.md
- Details about how to create input event objects: https://github.com/electron/electron/blob/master/docs/api/web-contents.md#contentssendinputeventevent

Example `shortcuts.json` for `https://deezer.com` & `https://soundcloud.com` to get your play/pause/previous/next media keys working:

```json
[
  {
    "key": "MediaPlayPause",
    "inputEvents": [
      {
        "type": "keyDown",
        "keyCode": "Space"
      }
    ]
  },
  {
    "key": "MediaPreviousTrack",
    "inputEvents": [
      {
        "type": "keyDown",
        "keyCode": "Shift"
      },
      {
        "type": "keyDown",
        "keyCode": "Left",
        "modifiers": ["shift"]
      },
      {
        "type": "keyUp",
        "keyCode": "Left",
        "modifiers": ["shift"]
      },
      {
        "type": "keyUp",
        "keyCode": "Shift"
      }
    ]
  },
  {
    "key": "MediaNextTrack",
    "inputEvents": [
      {
        "type": "keyDown",
        "keyCode": "Shift"
      },
      {
        "type": "keyDown",
        "keyCode": "Right",
        "modifiers": ["shift"]
      },
      {
        "type": "keyUp",
        "keyCode": "Right",
        "modifiers": ["shift"]
      },
      {
        "type": "keyUp",
        "keyCode": "Shift"
      }
    ]
  }
]
```

#### [browserwindow-options]

```
--browserwindow-options <json-string>
```

a JSON string that will be sent directly into electron BrowserWindow options.
See [Electron's BrowserWindow API Documentation](https://electronjs.org/docs/api/browser-window#new-browserwindowoptions) for the complete list of options.

Example:

```bash
nativefier <your-website> --browserwindow-options '{ "webPreferences": { "defaultFontFamily": { "standard": "Comic Sans MS", "serif": "Comic Sans MS" } } }'
```

#### [darwin-dark-mode-support]

```
--darwin-dark-mode-support
```

Enables Dark Mode support on macOS 10.14+.

#### [background-color]

```
--background-color <string>
```

See https://electronjs.org/docs/api/browser-window#setting-backgroundcolor

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
  bounce: false,
  width: 1280,
  height: 800,
  showMenuBar: false,
  fastQuit: false,
  userAgent: 'Mozilla ...', // will infer a default for your current system
  ignoreCertificate: false,
  ignoreGpuBlacklist: false,
  enableEs3Apis: false,
  internalUrls: '.*?', // defaults to URLs on same second-level domain as app
  blockExternalUrls: false,
  insecure: false,
  honest: false,
  zoom: 1.0,
  singleInstance: false,
  clearCache: false,
  fileDownloadOptions: {
    saveAs: true, // always show "Save As" dialog
  },
  processEnvs: {
    GOOGLE_API_KEY: '<your-google-api-key>',
  },
};

nativefier(options, function (error, appPath) {
  if (error) {
    console.error(error);
    return;
  }
  console.log('App has been nativefied to', appPath);
});
```

### Addition packaging options for Windows

#### [version-string]

_Object_ (**deprecated** as removed in `electron-packager` 9.0.0, please use the
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

#### [disable-old-build-warning-yesiknowitisinsecure]

Disables the warning shown when opening a Nativefier app made a long time ago, using an old and probably insecure Electron. Nativefier uses the Chrome browser (through Electron), and remaining on an old version is A. performance sub-optimal and B. dangerous.

However, there are legitimate use cases to disable such a warning. For example, if you are using Nativefier to ship a kiosk app exposing an internal site (over which you have control). Under those circumstances, it is reasonable to disable this warning that you definitely don't want end-users to see.

##### Programmatic API

_Object_

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
