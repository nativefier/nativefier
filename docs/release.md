# Release

Releases are automatically deployed to npm from Travis, when they are tagged.
However, we have to make sure that the version in the `package.json`,
and the changelog is updated.

## Tests

Before anything, run a little manual smoke test of some of our
hard-to-programatically-test features:

```bash
npm run test:manual
```

## How to release

With [Git Extras](https://github.com/tj/git-extras/blob/master/Installation.md)
and [jq](https://stedolan.github.io/jq/download/) installed.

While on `master`, with no uncommitted changes,

```bash
npm run changelog -- $VERSION
# With no 'v'. For example: npm run changelog -- 7.7.1
```

This command does 3 things:
1. Update the version in the `package.json`
2. Update the changelog
3. Creates a new commit with the changes

Now we may want to cleanup the changelog:

```bash
vim CHANGELOG.md
git commit --amend
```

Once we are satisfied,

```bash
git tag -a vX.Y.Z -m 'vX.Y.Z'
git push --follow-tags origin master
```

On [GitHub Releases](https://github.com/nativefier/nativefier/releases),
draft and publish a new release with title `Nativefier vX.Y.Z` (yes, with a `v`).

Our CI will react on the new release, and publish it to npm.
The new version will be visible on npm within a few minutes.
