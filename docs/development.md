# Development

## Environment Setup

This documentation will guide you through the process of installing nativefier to your local environment. At the same time, it will provide you with the latest versions of the required dependecies. Let's begin!

First, go ahead and clone the repository will the command described below.

```bash
git clone https://github.com/jiahaog/nativefier.git

```
Once the repository is successfully cloned to your local environment, navigate to it with following command:
Install dependencies and build:

```
cd nativefier

```
### macOS and Linux
For macOS and Linux execute the following install script to install all the necessary dependencies.
```bash
# macOS and Linux
bash nativefier-install.sh

```

### Windows
For Windows users, install the dependencies, and build, by executing the command below.

```bash
#Windows

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
