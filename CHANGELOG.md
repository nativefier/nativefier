
43.0.0 / 2021-03-10
===================

  * **[BREAKING]** Bump to Electron 12.0.1 with Chrome 89.0.4389.82
    See https://www.electronjs.org/blog/electron-12-0
    and https://www.electronjs.org/docs/breaking-changes#planned-breaking-api-changes-120

    Noteworthy to Nativefier users:
    * As usual, new Chrome, with potential improvements/regressions to websites you use
    * Removed Flash support. If you still need flash, pass a <12 version to the `-e` flag
    * Removed support for older x86 CPUs that do not have SSE3

  * **[BREAKING]** Automatically consider known login pages as internal (fix #706) (PR #1124)
    URLs for known login pages (e.g. `accounts.google.com` or `login.live.com`)
    are now automatically considered internal, to let you login in your
    Nativefier app without having to fiddle with `--internal-urls`.

    This does not replace `internal-urls`, it complements it, and happens
    _before_ your `internal-urls` rule is applied. So, if you already set
    the flag to let such auth pages open internally, you can change it if
    you want to clean it up, but it's not unnecessary.

    We think this is desirable behavior and are so far unaware of cases
    where users might not want this. If you disagree, please chime in at
    [PR #1124: App: Automatically consider known login pages as internal](https://github.com/nativefier/nativefier/pull/1124)

  * Various maintenance fixes: deps, scripts, slim down Docker size

42.4.0 / 2021-03-04
===================

  * macOS: Prompt for accessibility permissions if needed by Global Shortcuts using Media Keys (fix #1120, PR #1121)
  * Icon conversion: support GraphicsMagick in addition to  ImageMagick (PR #1002)
  * Docker: fix Windows builds, line endings, switch to Alpine (fix #997, PR #1122)
  * Fix considering "same domain-ish" URLs as internal (PR #1126)
    This was a regression introduced in 42.3.0 by dropping `wurl` in 6b266b781.
    The new behavior is super close to 42.2.1. So, not considering it breaking.
  * Various maintenance fixes: tooling, deps, CI

42.3.0 / 2021-02-25
===================

  * Bump default Electron to 11.3.0 (with Chromium 87.0.4280.141).
    macOS-segfault-causing icon bug #1101 should remain fixed.
  * API docs: fix typo in option "-v" (PR #1114)
  * Get rid of dep `shelljs` and abandoned app dep `wurl`
  * Bump commander from 4 to 7 and eslint-config-prettier from 7 to 8

42.2.1 / 2021-01-30
===================

  * Move GitHub repository to [`nativefier/nativefier`](https://github.com/nativefier/nativefier)
  * Temporarily increase timeout for network call in test
  * Move TS @types from dependencies to devDependencies (PR #1102)

42.2.0 / 2021-01-18
===================

  * Revert default Electron back to 11.1.1 (Chrome 87.0.4280.88) (fix #1101)
    11.2.0 was causing segfaults in macOS.

42.1.0 / 2021-01-16
===================

  * Bump default Electron to 11.2.0 (with Chromium 87.0.4280.141)
  * Maintenance:
    * A bit more filename & appname sanitization
    * Get rid of two direct deps: cheerio, lodash
    * Fix error surfacing in full since recent changes in `page-icon`
    * Publish TS types, for them to show up in npm

42.0.2 / 2020-12-07
===================

  * Fix arg validation regression in #1080 with `--{x,y}` (fix #1084)

42.0.1 / 2020-12-06
===================

  * Fix arg validation regression in #1080 (fix #1083)

42.0.0 / 2020-12-06
===================

This release includes several contributor patches. Thanks @sorhtyre @mattruzzi !

  * **[BREAKING CHANGE] Warn on old Electron/Chrome (fix #556) (PR #1076)**
    ⚠️ Users packaging kiosk apps running for a long time on internal websites,
    see https://github.com/nativefier/nativefier/blob/master/docs/api.md#disable-old-build-warning-yesiknowitisinsecure
  * Check for improperly-formatted arguments (fix #885) (PR #1080)
  * Correctly start in tray when both `--maximize` and `--tray start-in-tray` are passed (fix #1015) (PR #1079)
  * Fix icon path error when passing asar `--conceal` flag (fix #975) (PR #1074)
  * Migrate from Travis CI to GitHub Actions
  * Bump default Electron to 11.0.3, bump dep eslint-config-prettier to 7.x

Also, bumping npm version to something far away from current Electron version.

Rationale for the nonsensical major version bump: around Nativefier 8.x,
versions of Nativefier and Electron aligned, by release schedule coincidence.
Since Nativefier has little breaking changes, it was great: as Electron
releases are breaking, Nativefier had no breaking changes, I bumped our
major version on new major Electron, and everything was good.

Except *now*, as I have a breaking change, which would bump Nativefier to
12.x, being annoyingly confusing since we'd still default to Electron 11 :-/ .

-> To keep respecting semver and reduce confusion, bumping Nativefier
   version to something far ahead of Electron versions. No it doesn't
   matter, version number are meaningless anyway (well, outside of
   semver, whose respect is precisely the point here).

11.0.2 / 2020-11-21
===================

  * **[BREAKING CHANGE] Bump default Electron to 11.0.2 / Chromium 87**
  * Support using a Widevine-enabled Electron for DRM playback, see flag `--widevine` (fix #435) (PR #1073)

10.1.5 / 2020-11-08
===================

  * Bump default Electron to 10.1.5 (with Chromium 85.0.4183.121) (#1066)
  * Readme: suggest docker "-rm" flag to clean up containers after build (#1064)
  * Deps bumps: webpack, ts-eslint
  * CI: Add a node.js 15 build

10.1.0 / 2020-08-29
===================

  * **[BREAKING CHANGE] Bump default Electron to 10.1.0 / Chromium 85**
  * Support `arm64` architecture (PR #1037, fix #804)
  * On successful build, better explain how to run the app and what to do with it (fix #1029)
  * Bump to TypeScript 4.x

9.2.0 / 2020-08-10
==================

  * Add `--block-external-urls` flag to forbid external navigation attempts (fix #978, PR#1012)
  * Restore Docker docs in README, now that Docker build-on-release has been fixed (fix #848)
  * Emit TS type declarations, and type NativefierOptions (PR #1016)
  * Emit a warning about incorrectly-named "Electron" process when building windows apps under non-Windows and without Wine (fix #1022)
  * Add unified {build,test} watch mode, using `concurrently` (PR #1011)
  * Bump default Electron to 9.2.0
  * Bump eslint to 7.x

9.1.0 / 2020-07-18
==================

  * Fix 'Image could not be created' app error on run (fix #992)
  * Bump docker Node image version from 8 to 12 (#996)
  * Bump default Electron to 9.1.0 and deps (electron-packager, ts-loader)

9.0.0 / 2020-06-13
==================

  * **[BREAKING CHANGE] Require Node.js >= 10 and npm >= 6**
  * **[BREAKING CHANGE] Bump default Electron to 9.0.4**
  * Bump deps (ts-loader, jest, electron-context-menu)
  * --help: fix typo, clarify `--icon` helptext (PR #976)
  * Fix notifications (#88, #956), processEnvs, using as git dep (PR #955)

8.0.7 / 2020-04-22
==================

  * Fix `Unable to load preload script` error at runtime (fix #934)
  * Bump default Electron to 8.2.3, and bump app/electron-context-menu to 1.x

8.0.6 / 2020-03-27
==================

  * App: Fix unintentionally *global*/os-wide keyboard shortcuts (fix #930)
  * App: Back & forward: expose standard shortcuts first & handle mac,
    keep old weird (Ctrl+[ and Ctrl+]) shortcuts for backward compat
  * App: Properly hide Developer Tools when asked by flag (fix #842)
  * Log a helpful error when failing to parse JSON arg (fix #928)
  * Bump default Electron to 8.2.0
  * Misc GitHub & Travis nits.

8.0.4 / 2020-03-16
==================

  * Fix failing to global-sudo-install due to postinstall script
    (#923, maybe #924)

8.0.3 / 2020-03-15
==================

  * Attempt to fix failing to install due to app yarn install (#923)
    See https://github.com/nativefier/nativefier/pull/898#issuecomment-583865045 .

8.0.2 / 2020-03-15
==================

  * CI nitty-gritty, nothing to see here. See 8.0.0 news below.

8.0.1 / 2020-03-15
==================

  * CI nitty-gritty, nothing to see here. See 8.0.0 news below.

8.0.0 / 2020-03-15
==================

Revamp and move to TypeScript (#898)

## Breaking changes

- Require **Node >= 8.10.0 and npm 5.6.0**
- Move to **Electron 8.1.1**.
- That's it. Lots of care went into breaking CLI & programmatic behavior
  as little as possible. **Please report regressions**.
- Known issue: build may fail behind a proxy. Get in touch if you use one:
  https://github.com/nativefier/nativefier/issues/907#issuecomment-596144768

## Changes summary

Nativefier didn't get much love recently, to the point that it's
becoming hard to run on recent Node, due to old dependencies.
Also, some past practices now seem weird, as better expressible
by modern JS/TS, discouraging contributions including mine.

Addressing this, and one thing leading to another, came a
bigger-than-expected revamp, aiming at making Nativefier more
**lean, stable, future-proof, user-friendly and dev-friendly**,
while **not changing the CLI/programmatic interfaces**. Highlights:

- **Require Node>=8**, as imposed by many of our dependencies. Node 8
  is twice LTS, and easily available even in conservative Linux distros.
  No reason not to demand it.
- **Default to Electron 8**.
- **Bump** all dependencies to latest version, including electron-packager.
- **Move to TS**. TS is great. As of today, I see no reason not to use it,
  and fight interface bugs at runtime rather than at compile time.
  With that, get rid of everything Babel/Webpack.
- **Move away from Gulp**. Gulp's selling point is perf via streaming,
  but for small builds like Nativefier, npm tasks are plenty good
  and less dependency bloat. Gulp was the driver for this PR: broken
  on Node 12, and I didn't feel like just upgrading and keeping it.
- Add tons of **verbose logs** everywhere it makes sense, to have a
  fine & clear trace of the program flow. This will be helpful to
  debug user-reported issues, and already helped me fix a few bugs.
    - With better simple logging, get rid of the quirky and buggy
      progress bar based on package `progress`. Nice logging (minimal
      by default, the verbose logging mentioned above is only used
      when passing `--verbose`) is better and one less dependency.
- **Dump `async` package**, a relic from old callback-hell early Node.
  Also dump a few other micro-packages unnecessary now.
- A first pass of code **cleanup** thanks to modern JS/TS features:
  fixes, simplifications, jsdoc type annotations to types, etc.
- **Remove GitHub integrations Hound & CodeClimate**, which are more
  exotic than good'ol'linters, and whose signal-to-noise ratio is too low.
- Quality: **Add tests** and add **Windows + macOS CI builds**.
  Also, add a **manual test script**, helping to quickly verify the
  hard-to-programatically-test stuff before releases, and limit regressions.
- **Fix a very small number of existing bugs**. The goal of this PR was
  *not* to fix bugs, but to get Nativefier in better shape to do so.
  Bugfixes will come later. Still, these got addressed:
  - Add common `Alt`+`Left`/`Right` for previous/next navigation.
  - Improve #379: fix zoom with `Ctrl` + numpad `+`/`-`
  - Fix pinch-to-zoom (see https://github.com/nativefier/nativefier/issues/379#issuecomment-598612128 )


7.7.1 / 2020-01-23
==================

  * Feature: proxy rules with `--proxy-rules` flag (PR #854)
  * Fix weirdly platform-dependent folder naming logic (PR #850, issue #708)
  * Fix filter exception when injecting CSS (PR #837)
  * Fix Handle nativefier.json readonly access with options.maximize (PR #856)
  * Fix/app: Application menu support on Electron 5.x (PR #876)
  * Doc: Clarify `--background-color` arguments (PR #891)
  * Doc: Fix duplicate word for `--bounce` doc (PR #883)
  * Bump default Electron to 5.0.13

7.7.0 / 2019-08-22
==================

  * Default to Electron 5.x (#796)
  * Add `--darwin-dark-mode-support` to support macOS 10.4+ Dark Mode (PR #796)
  * Add `--browserwindow-options` to completely expose Electron options (PR #835)
  * Add `--background-color` to set background color (fixes #795) (PR #819)
  * Restore login functionality broken since Electron 5.x (PR #826)
  * Squirrel: resolve .quit() issue with missing ../screen (PR #784)
  * Doc: improve doc for `--internal-urls` (PR #833)

7.6.12 / 2019-03-25
===================

  * Fix crash when launching a second instance using option --single-instance (Fixes #664, PR #772)
  * Prevent menu from opening on Alt+Shift, by defining Alt+... menu shortcuts (PR #768)
  * Bump default Electron to 3.1.7

7.6.11 / 2019-02-10
===================

  * Add `--clear-cache` flag to cleanup session on start/exit ("incognito" mode) (Fixes #316, PR #747)
  * Support packaging Nativefier applications as [Squirrel](https://github.com/Squirrel/)-based installers (PR #744)
  * Icon conversion: don't crash if source/destination paths have spaces (PR #736)
  * Bump default Electron to 3.1.3

7.6.10 / 2019-01-01
===================

  * Fix CSS & JavaScript injection (Fixes #703, Fixes #731, PR #732)
  * Bump default Electron to 3.0.13

7.6.9 / 2018-12-01
==================

  * Add `start-in-tray` CLI option to `--tray` flag to let app start in background (PR #564, Fixes #522)
  * Add `--global-shortcuts` flag to trigger in-app input events (PR #698, Fixes #15)
  * Fix CSS injection broken with Electron 3 (PR #709, Fixes #703)
  * Bump default Electron to 3.0.10

7.6.8 / 2018-10-06
==================

  * Bump default Electron to 3.0.3, based on Chrome 66 / Node 10 / V8 6.6
  * Show application window on notification click (#640)
  * Update docs: Windows icon requirements (#663), badge option (#693)
  * Bump deps (eslint-config-prettier, eslint-plugin-prettier)

7.6.7 / 2018-07-31
==================

  * Fix broken `--version` (issue #660)
  * Bump default Electron to 2.0.6
  * **Upcoming compatibility break notice:**
    **Nativefier may still work with node 4.x & 5.x, but <6.x is no longer tested.**
    **Minimum node version will be enforced to >=6.x at some point soon.**

7.6.6 / 2018-07-22
==================

 * Nothing new, just a re-push to npm.
   See changelog for 7.6.5.

7.6.5 / 2018-07-21
==================

  * Fix "Copy Current URL" causing `TypeError` (#633, PR #634)
  * Add Unix/Mac-conventional `-v` version flag (PR #628)
  * Bump default Electron to 2.0.5
  * Dev: Add `jest --watch` helper for npm scripts, Code cleanups, Add tests

7.6.4 / 2018-05-31
==================

  * Add `--title-bar-style` flag (macOS only) (PR #627)
  * Make the `--counter` regexp allow punctuation (e.g. "1,234") (fix #610, PR #626)
  * Fix sites that use about:blank redirect technique (PR #623)
  * Always open external links externally (fix #621 - PRs #622 #624)
  * Only override the default window opening behavior when necessary (fix #616 - PR #620)
  * Don't run tests on node 4 and 5, due to Jest not supporting those.
    In time, Nativefier will stop supporting them too and will enforce node>=6.
  * Tests cleanups: use async/await, separate e2e tests, mocha -> jest.
  * Use [prettier](https://github.com/prettier/prettier) for code formatting.

7.6.3 / 2018-05-23
==================

  * macOS: Add tabs, used automatically instead of windows (PR #579).
    Provided by Electron and (so far) no available for Windows/Linux, contributions welcome.
  * Fix #547 - Default to Electron 2.0.2 (including Chrome 61, Node 8.9.3, V8 6.1.534.41, GTK3 on Linux) (PR #587)
  * Fix Gmail complaining window creation was prevented by a popup blocker (PR #603)
  * Fix two build-time deprecation warnings

7.6.2 / 2018-05-01
==================

  * Fix #94, Fix #575 - Fix run-time crash due to insufficient permissions (PR #581)
  * Fix #574 - Allow build to continue if icon conversion fails (PR#585)
  * Fix #199 - On macOS, perform image conversion tasks using `sips` when available (PR #583).
  * Fix #95, Fix #384 - Add cut/copy/paste context menu entries, using `electron-context-menu` (PR #588)
  * Fix #364 - Add `--disable-gpu` flag to disable hardware acceleration (PR #584)
  * Fix #474 - Remember custom zoom level (PR #582)
  * Fix #590, Fix #439 - Ensure children windows have the same behavior as the mainWindow (PR #591)
  * macOS: Add `--bounce` option for dock counter (PR #570)
  * Default to latest stable electron 1.8.6 and update dependencies (electron-packager)
  * Enforce staying on `npm@5.8.x` for a little while, as npm@6 breaks under Node 4, which we still support.

7.6.1 / 2018-03-29
==================

  * Fix CD with Travis #482

7.6.0 / 2018-03-29
==================

  * Fix infer icon url #529
  * Fix #549: Add --always-on-top build flag (PR #551)
  * Update deps, default to Electron 1.8.4 stable
  * Document internal-urls option (PR #465)
  * Support Mac App Store (--mas) builds (PR #532)
  * Fix #499: Add options to control file download behavior (PR #526)
  * Fix #325 - Add --x and --y window position flags (PR #515)
  * Fix #480 - Move all console.* to loglevel.* calls, eslint-fail on console.* (PR #507)
  * Fix #496 - Recommend .png for --icon on all platforms, even macOS (PR #502)
  * Fix #486 : --tray flag crashes nativefied app under Windows (PR #495)
  * Fix #462 - When minimized to tray and single-instance, re-running the app should activate and focus it (#490)
  * Fix #461 & address #375 in Docker: move Dockerfile to Debian and use wine32 (#488)

7.5.4 / 2017-11-24
==================

  * Update Dockerfile to node8-alpine, fix typos
  * Upgrade dependencies and default to latest Electron 1.7.9 (PR #483)

7.5.0 / 2017-11-12
==================

* Add `--tray` flag to let app running in background on window close. Supports in-title counter. (Issue #304, PR #457)
* Add HTTP `--basic-auth-{username,password}` flags (Issue #275, PR #444)
* Add offline build detection and advice (Issue #448, PR #452)
* Add 'Paste and Match Style' to Edit menu (Issue #404, PR #447)
* Add setting environment variables (PR #419)
* Add `app-copyright`, `app-version`, `build-version`, `version-string` and `win32metadata` flags (Issue #226, PR #244)
* Fix: Make title counter regex match '+' after number, used by certain sites (PR #424)

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
  * Merge branch 'master' of github.com:nativefier/nativefier
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
