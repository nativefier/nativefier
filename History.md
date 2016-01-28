
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
