# Release

Releases are automatically deployed to NPM on Travis, when they are tagged. However, we have to make sure that the version in the `package.json`, and the changelog is updated.

## Dependencies
- [Git Extras](https://github.com/tj/git-extras/blob/master/Installation.md)
- [jq](https://stedolan.github.io/jq/download/)

## How to Release `$VERSION`

While on `master`, with no uncommitted changes,

```bash
npm run changelog -- $VERSION
```

This command does 3 things:
1. Update the version in the `package.json`
2. Update the changelog
3. Creates a new commit with the changes

Now we may want to cleanup the changelog:

```bash
vim docs/changelog.md

git commit --amend
```

Once we are satisfied,
```bash
git push origin master
```

On [GitHub Releases](https://github.com/jiahaog/nativefier/releases), draft and publish a new release with title `Nativefier vX.X.X`.

