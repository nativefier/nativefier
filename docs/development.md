# Development

## Environment Setup

First, clone the project

```bash
git clone https://github.com/jiahaog/nativefier.git
cd nativefier
```

Install dependencies and build:

```bash
npm install
npm run build
```

If dependencies are installed and you just want to re-build,

```bash
npm run build
```

To clean the project from built files,

```bash
npm run build
# or, if you want to scrap node_modules too,
npm run build:full
```

Set up a symbolic link so that running `nativefier` invokes your development version including your changes:

```bash
npm link
which nativefier
# -> Should return a path, e.g. /home/youruser/.node_modules/lib/node_modules/nativefier
# If not, be sure your `npm_config_prefix` env var is set and in your `PATH`
```

After doing so, you can run Nativefier with your test parameters:

```bash
nativefier --your-awesome-new-flag
```

## Tests

- To run all tests, `npm t`
- To run only unit tests, `npm run test:unit`
- To run only integration tests, `npm run test:integration`
- Logging is suppressed by default in tests, to avoid polluting Jest output.
  To get debug logs, `npm run test:withlog` or set the `LOGLEVEL` env. var.
- For a good iteration speed, open three terminal panes/tabs and set watchers:
    1. Run a TSC watcher for the CLI: `npm run compile:watch`
    2. Run a TSC watcher for the app: `npm run compile:watch:app`
    3. Run a Jest tests watcher: `npm run test:watch`
