# Development Guide

## Setup

First, clone the project:

```bash
git clone https://github.com/nativefier/nativefier.git
cd nativefier
```

Install dependencies (for both the CLI and the Electron app):

```bash
npm install
```

The above `npm install` will build automatically (through the `prepare` hook).
When you need to re-build Nativefier,

```bash
npm run build
```

Set up a symbolic link so that running `nativefier` calls your dev version with your changes:

```bash
npm link
which nativefier
# -> Should return a path, e.g. /home/youruser/.node_modules/lib/node_modules/nativefier
# If not, be sure your `npm_config_prefix` env var is set and in your `PATH`
```

After doing so, you can run Nativefier with your test parameters:

```bash
nativefier --your-awesome-new-flag 'https://your-test-site.com'
```

Then run your nativefier app _through the command line too_ (to see logs & errors):

```bash
# Under Linux
./your-test-site-linux-x64/your-test-site

# Under Windows
your-test-site-win32-x64/your-test-site.exe

# Under macOS
./YourTestSite-darwin-x64/YourTestSite.app/Contents/MacOS/YourTestSite --verbose
```

## Linting & formatting

Nativefier uses [Prettier](https://prettier.io/), which will shout at you for
not formatting code exactly like it expects. This guarantees a homogenous style,
but is painful to do manually. Do yourself a favor and install a
[Prettier plugin for your editor](https://prettier.io/docs/en/editors.html).

## Tests

- To run all tests, `npm t`
- To run only unit tests, `npm run test:unit`
- To run only integration tests, `npm run test:integration`
- Logging is suppressed by default in tests, to avoid polluting Jest output.
  To get debug logs, `npm run test:withlog` or set the `LOGLEVEL` env. var.
- For a good live experience, open two terminal panes/tabs running code/tests watchers:
  1. Run a TSC watcher: `npm run build:watch`
  2. Run a Jest unit tests watcher: `npm run test:watch`
- Alternatively, you can run both test processes in the same terminal by running: `npm run watch`
