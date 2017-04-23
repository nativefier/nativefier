# Release Notes

How to release a new version to NPM

## Releasing

Run the following command to get the changelog

```
git checkout master

# Get the current version
npm version

# Add the changelog for the next version
git changelog docs/changelog.md --tag <next version>

# Edit the changelog
vim docs/changelog.md

# Commit it
git add docs/changelog.md
git commit -m "Update changelog for \`v<next version>\`"
git push
```

On [GitHub Releases](https://github.com/jiahaog/nativefier/releases), draft and publish a new release with title `Nativefier vX.X.X`.

