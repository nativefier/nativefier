# Development

## Environment Setup

First clone the project

```bash
git clone https://github.com/jiahaog/nativefier.git
cd nativefier
```

Install dependencies

```bash
# OSX and Linux
npm run dev-up

# Windows
npm install
cd app
npm install
```

Don't forget to compile source files:

```bash
npm run build
```

You can set up symlinks so that you can run `nativefier` for your local changes

```bash
npm link
```

After doing so, you can then run Nativefier with your test parameters

```bash
nativefier <...>
```

Or you can automatically watch the files for changes with:

```bash
npm run watch
```

## Tests

```bash
npm test
```
