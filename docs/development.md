# Development

## Environment Setup

First, clone the project

```bash
git clone https://github.com/jiahaog/nativefier.git
cd nativefier
```

Install dependencies and build:

```bash
# macOS and Linux
npm run dev-up

# Windows
npm run dev-up-win
```

If dependencies are installed and you just want to re-build,

```bash
npm run build
```

You can set up a symbolic link so that running `nativefier` invokes your development version including your changes:

```bash
npm link
```

After doing so (and not forgetting to build with `npm run build`), you can run Nativefier with your test parameters:

```bash
nativefier <--your-awesome-new-flag>
```

Or you can automatically watch the files for changes with:

```bash
npm run watch
```

## Tests

```bash
# To run all tests (unit, end-to-end),
npm test

# To run only unit tests,
npm run jest

# To run only end-to-end tests,
npm run e2e
```
