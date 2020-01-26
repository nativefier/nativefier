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

You can set up a symbolic link so that running `nativefier` invokes your development version including your changes:

```bash
npm link
```

After doing so (and not forgetting to build with `npm run build`), you can run Nativefier with your test parameters:

```bash
nativefier --your-awesome-new-flag
```

## Tests

```bash
# To run all tests (unit, end-to-end),
npm test

# To run only unit tests,
npm run jest

# To run only end-to-end integration tests,
npm run test:integration
```

Or watch the files for changes with:

```bash
npm run test:watch
```
