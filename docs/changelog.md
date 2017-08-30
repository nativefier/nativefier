7.4.1 / 2017-08-06
==================

 * Add support for `--disk-cache-size` Electron flag (PR #400)
 * Add `--ignore-gpu-blacklist` and `--enable-es3-apis` flags to allow WebGL
   apps to work on graphics cards unsupported/blacklisted by Chrome (PR #410)
 * Fix #28 - Executable name being always `Electron` under Windows (PR #389)
 * Fix #353 - `--crash-reporter` option crashing packaged app at startup
 * Fix #402 - Force fullscreen even after first startup, as `electron-window-state`
   does not appear to remember fullscreen in all cases (PR #403).

7.4.0 / 2017-05-21
==================

  * Add jq to docs as release dependency
  * Run Nativefier with Docker (#311)
  * Add hound config (#369)
  * Add codeclimate config
  * Promisfy and parallelise config generation, add unit tests
  * Add ARM build support (#360)

7.3.1 / 2017-04-30
====================

  * Add script to update version and changelog
  * Update changelog for 7.3.0
  * Remove Windows tests
  * Cleanup travis config
  * Update eslint and use Airbnb style
  * Change Mocha to not need a babel build to run (#349)
  * Promisify inferTitle module
  * Add autodeploy to NPM on tag

7.2.0 / 2017-04-20
==================
  * Update dependencies, default to latest Electron 1.6.6 (#327, PR #341). **Feedback welcome in case of issues/regressions!**
  * [Feature] Add `--single-instance` switch (PR #323) 
  * [Bug] Better honor `--zoom` option (#253, PR #347)
  * [Bug] Allow mDNS addresses (ending with `local.`) during URL validation (#308, PR #346)
  * [Docs] Readme and CLI cleanup
  * [Misc] Remove duplicate dependencies (#337)
  * [Misc] Rename 'Open in default browser' contextMenu to 'Open with default browser' (#338)

7.1.0 / 2017-04-07
==================

  * Feature: Add "Copy link location" context menu (#230)
  * Feature: Add `--internal-urls <regex>` option to customize what should open in external browser (#230)
  * Feature: Add `--zoom` option for setting default zoom (#218)
  * Bug: Fix context menu actions broken on <a> elements containing nested markup (#263)
  * Bug: Fix counter notifications (#256)
  * Bug: Remove non-ascii characters or use default for app name (#217)
  * Doc: various fixes, including clarifying optional OSX dependencies for generating icons
  * CI: Fix Travis tests which require wine
  * Dev: Add editorconfig to trim trailing whitespace

7.0.1 / 2016-06-16
==================

  * Fix/performance issues with FOUC (#214)
  * Fix bug where convert icons script fails silently if dependency is not found
  * Use original eslint module for linting instead of gulp

7.0.0 / 2016-05-27
==================

  * Only support node.js >=4
  * Implement downloading of files #185
  * Implement min/max window width and height #82
  * Implement disabling of developer tools #194
  * Update default electron version to stable v1.1.3 #206
  * Update electron-packager to v7.0.1 #193
  * Update validator to v5.2.0
  * Update shelljs to v0.7.0
  * Update cheerio to v0.20.0
  * Update axios to v0.11.1
  * Update eslint to v2.0.0
  * Increase timeout for test
  * Fix bug where gitcloud matching of icons with multiple words is not supported
  * Fix bug where inferred title is too long #195
  * Fix flash of unstyled content #159

6.14.0 / 2016-05-08
===================

  * Properly log errors with injected files
  * Fix slowdown bug #191
  * Revert fix for FOUC with injected CSS files #202
  * Allow fast quit of app after window close on OSX #178
  * Allow hiding of window frame #188
  * Allow disabling the context menu #187
  * Rebind 'Copy Current URL' to 'CmdOrCtrl+L' to mimic 'Open Location' in browsers #181
  * Add walkthrough gif in readme
  * No longer enable flash by default
  * Bump default electron version to 0.37.2

6.13.0 / 2016-03-25
===================

  * Source files will not be included in the packaged app
  * Fix bug where state of mainWindow is not managed properly
  * Implement setting of verbose log level
  * Implement infer of user agent from electron version
  * Implement initial maximization of main window from cli 
  * Fix FOUC with inject CSS files
  * No need to run CI test for gulp release

6.12.1 / 2016-03-14
===================

  * Fix bugs retrieving icons from nativefier-icons
  * Add resize flag to convertToIco convert so that large `.png` will not throw errors when converting to `.ico`
  
6.12.0 / 2016-03-14
===================

  * Try to retrieve icons from `nativefier-icons` first before inferring
  * Add progress bar
  * Use `windows` and `osx` to specify platform
  * Override output directory by default
  * Add checks for icon format
  * Implement conversion to `.ico` for windows target
  * Support only node `0.12` onwards with `babel-polyfill`
  * Organise documentation

6.11.0 / 2016-03-11
===================

  * Use local page-icon dependency instead of bestIcon server to infer icons for a target url
  * Add conversion of images from `.ico` to `.png`
  * Implement conversion of images on Linux in addition to OSX
  * Fix bug in setting icon on for a Windows app while on Windows OS
  * Trim whitespace from inferred page title
  * Remove non-ascii characters from app name to prevent weird Wine error
  * Remove dependency on `sips`
  * Fix bug where shell scripts fail silently
  * Modularize `gulpfile`

6.10.1 / 2016-02-26
===================

  * Fix #117 ENOENT when infering flash

6.10.0 / 2016-02-25
===================

  * Fix bug in mocha where next task is executed before mocha callback
  * Implement command line flag to start app in full screen, resolves #109
  * Implement injection of css and js

6.9.1 / 2016-02-25
==================

  * Do not npm ignore binaries

6.9.0 / 2016-02-25
==================

  * Preserve app data upon regeneration of app
  * Add menu option to clear the app data
  * Change flag usage
    * `--ignore-certificate` to ignore invalid certificate errors,
    * `--insecure` to disable web security to allow mixed content
  * Add flag to allow mixed content over https
  * Add preliminary flash support
  * NPM ignore everything except compiled files
  * Fix #146 Specifying `--electron-version` does not work
  * Update example api usage for `require('nativefier').default`
  * Add issue template
  * #114 Allow [x] and {x} forms of notification count
  * #112 Counter: Allow for [x] and {x} forms of notification count
  * #90 Add keyboard shortcuts for back, forward
  * Add note about not putting spaces in user defined app name
  * Merge pull request #107 from zweicoder/fix/respect-user-choice
  * Do not print done statement if app already exists and `--overwrite` is not passed
  * Respect user choice for naming
  * Allow npm publish to log to stdout

6.8.0 / 2016-01-30
==================

  * Use ES6 for placeholder app
  * Massive refactor of cli code
  * Rename `--app-name` to `--name`
  * Fix #103 App name should not be capitalized
  * Remove electron prebuilt as a dev dependency to speed up ci builds
  * Fix test for non darwin platforms
  * Implement check for wine before attempting to pass icon to electron packager
  * Update gulpfile - Build tests in `gulp build` - Watch test files - Clean test files as well
  * Implement automatic retrieval of png which resolves #16

6.7.0 / 2016-01-28
==================

  * Allow using png to for icon on OSX
  * Use manual compiling of mocha so that sourcemaps can be used
  * Convert app name to capitalized camel case if building for linux to prevent dock problems
  * Fix the icon parameter bug for linux and windows, fix #92, fix #53
  * Make Browserwindow always reference `app/icon.png` for the icon

6.6.2 / 2016-01-26
==================

  * Fix #87, Fix #89 - Sanitize app name before packaging
  * Add command line flag to make the packaged app ignore certificate errors, fixes #69
  * Fix #32 Ability to copy and paste a URL
  * Implement right click context menu for regular href links
  * Allow es6 for app static files

6.6.1 / 2016-01-25
==================

  * Remove unused files
  * Fix #76 where all placeholder app modules are treated as externals
  * Add contributing
  * Update gulp release to also run lints

6.6.0 / 2016-01-25
==================
  * Add CI Integration with travis
  * Add tests and lints
  * Fixes bug where electron packager returns appPath as an array instead of a string
  * Add sourcemaps support
  * Exposes buildApp as a programmatic api for npm
  * Remove shorthand command for height and width to fix conflicts with `-h`. Closes #30, closes #64 and closes #67
  * Automatically hide the menu bar by default on Windows. Users can press `alt` to show it
  * Implement proper build system with ES6 support to facilitate development
  * App window now remembers its previous position
  * Fix #59 Fullscreen goes to a black screen when clicking close
  * Set window title immediately when the window is created, fixes #54
  * Implement navigating backward and forward from the application menu
  * Implement proper notification listeners to change the badge
  * Refactor main.js into separate files, and put static files such as preload and login.html into `app/src/static`
  * Implement changing of zoom which fixes #17

6.5.6 / 2016-01-22
==================

  * Workaround for windows `mkdir -p`, fixes #57

6.5.5 / 2016-01-22
==================

  * Implement script to set up dev environment
  * Fix bug in invalid parameter for link in default browser
  * App is now precompiled with browserify as a workaround for an extremely annoying npm issue
  * Reorganised folder of app

6.5.4 / 2016-01-22
==================

  * Fix #46 Url is not defined
  * Override user agent by default, disable with `--honest` flag
  * Implement counter which closes #33, thanks to @jfouchard
  * Improve automatic retrieval of app name by faking a user agent to make the request

6.5.0 / 2016-01-22
==================

  * Implement support for http authentication, fixes #19
  * Implement authentication that requires a new window to be opened (e.g. OAuth)
  * Under the hood changes:
    * Target web page no longer loads in a `<webview>`, the `BrowserWindow` loads the target url directly

6.4.0 / 2016-01-21
==================

  * Make debug script automatically open the packaged app on OSX
  * Remove "About Electron" from app menu, add nativefier version to help, which fixes #18
  * Implement `--pretend` flag to easily simulate user agent strings, fixes #11
  * Merge branch 'master' of github.com:jiahaog/nativefier
  * Fix bug in error when response is undefined
  * Add helper scripts to debug easily
  * Hide app instead of exiting on OSX to fix #14
  * Update deprecated electron loadUrl usage Remove crash reporter Remove commented code
  * Merge pull request #20 from mattchue/master
  * Merge pull request #25 from PoziWorld/patch-1
  * Merge pull request #24 from himynameisdave/master
  * Make app resource folder contain a short id string, fix #21
  * Minor copy fixes
  * Fixes the issue with "/"'s in the page title
  * Update documentation, no longer need to add the full url with the protocol
  * Fix wrong bool
  * Allow intranet URLs
  * Update readme
  * Hide the webview until it finishes loading
