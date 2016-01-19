# Nativefier

![Dock Screenshot](https://raw.githubusercontent.com/jiahaog/nativefier/master/screenshots/Dock%20Screenshot.png)

## Introduction
Create a desktop application for any single page web application by wrapping it in an OS executable (`.app`, `.exe`, etc.).

Applications are packaged with [Electron](http://electron.atom.io) by simply running a simple command.

I did this because I was tired of having to `⌘-tab` or `alt-tab` to my browser and then search through the numerous open tabs when I was using [Facebook Messenger](http://messenger.com) or [Whatsapp Web](http://web.whatsapp.com).

## Installation

```bash
# for use from the command line
$ npm install nativefier -g
```

## Usage

Creating an native desktop app for [medium.com](medium.com):

```bash
$ nativefier http://medium.com
```

Note that nativefier will intelligently attempt to determine the app name. If desired, the app name or other options can be overwritten by specifying the `--name=Medium` as part of the command line options, as such.

```
$ nativefier --app-name='Some Awesome App' http://medium.com
```

Other command line options are listed below.

## Options
```bash
$ nativefier [options] <targetUrl> [dest]
```

#### Target Url

The url to point the application at. Take note that you have to enter the full url, i.e. `http://google.com`, and simply entering `google.com` will not work.

#### [dest]

Specifies the destination directory to build the app to, defaults to the current working directory.

#### Help

```
-h, --help
```

Prints the usage information.

#### [app-name]

```
-n, --app-name <value>
```

The name of the application, which will affect strings in titles and the icon.

#### [platform]

```
-p, --platform <value>
```
Automatically determined based on the current OS. Can be overwritten by specifying either `linux`, `win32`, or `darwin`.

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


#### [overwrite]

```
-o, --overwrite
```

Specifies if the destination directory should be overwritten.

#### [conceal]

```
-c, --conceal
```

Specifies if the source code within the nativefied app should be packaged into an archive, defaults to false, [read more](http://electron.atom.io/docs/v0.36.0/tutorial/application-packaging/).

#### [icon]

```
-i, --icon <path>
```

On OSX, the icon parameter should be a path to an `.icns` file. [iConvertIcons](https://iconverticons.com/online/) can be used to convert `.pngs`, though it can be quite cumbersome.

To retrieve the `.icns` file from the downloaded file, extract it first and press File > Get Info. Then select the icon in the top left corner of the info window and press `⌘-C`. Open Preview and press File > New from clipboard and save the `.icns` file. It took me a while to figure out how to do that and question why a `.icns` file was not simply provided in the downloaded archive.

#### [badge]

```
-b, --badge
```

On OSX, it is desired for the App dock icon to show a badge on the receipt of a desktop notification.

There is no known way to intercept and set an event listener for a desktop notification triggered by the [`<webview>`](https://github.com/atom/electron/blob/master/docs/api/web-view-tag.md), the current workaround is to listen for `document.title` changes within the `<webview>`. Typical web apps like Facebook Messenger will change the `document.title` to "John sent a message..." on the receipt of a desktop notification, and this is what we will listen for to trigger the app badge on the dock.

However, this would cause issues when the command line argument `target` is set to a external page which is not a single page app, because clicking on hyperlinks and switching pages would naturally change the `document.title`. Hence, `--badge` is an optional command argument that can be set by the user if the side effect of this workaround is understood.

#### [width]

```
-w, --width <value>
```

Width of the packaged application, defaults to `1280px`.

#### [height]

```
-h, --height <value>
```

Height of the packaged application, defaults to `800px`.

#### [user-agent]

```
-u, --user-agent <value>
```

Set the user agent to run the created app with.


## How It Works

A template app with the appropriate event listeners and callbacks set up is included in the `./app` folder. When the `nativefier` command is executed, this folder is copied to a temporary directory with the appropriate parameters in a configuration file, and is packaged into an app with [Electron Packager](https://github.com/maxogden/electron-packager).

## Notes

Tested mostly on OSX, but should work for windows and linux.

### Back Button
A back button is intentionally not provided because the tool is designed for single page apps. However, if desired, an executable can built for any url, and simply pressing the `backspace` key will take the user back to the previous page.

## Issues

- Better workaround for desktop notifications and OSX dock badges
