# Contributing to Nativefier

## Issues

Please include the following in your new issue:

- Version of Nativefier (run `$ nativefier --version`)
- Version of Node.js (run `$ node --version`)
- Command line parameters
- OS and architecture you are running Nativefier from
- Stack trace from the error message (if any)
- Instructions to reproduce the issue

## Pull Requests

See [here](https://github.com/jiahaog/nativefier#development) for instructions on how to set up a development environment.

Follow the current code style, and make sure tests and lints pass before submitting with the following commands:

Run the following command before submitting the pull request:

```bash
# Run tests and linting
$ npm run ci
```

Or you can run them separately:

```bash
# Tests
$ npm run test

# Lint source files
$ npm run lint
```

Thank you so much for your contribution!
