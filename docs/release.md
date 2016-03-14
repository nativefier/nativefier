# Release Notes

My notes for release commands to NPM

## Releasing

At branch `development` ready to release to npm:

``` bash
# Make sure ci tests pass
npm run ci

# See the current version
npm version

# Update the changlog and perform cleanup on it
git changelog docs/changelog.md --tag <next version>
subl docs/changelog.md

git add docs/changelog.md
git commit -m "Update changelog for \`v<next version>\`"

npm version <next version>

# Can automate from here onwards

# Publish it to npm
npm run release

# Merge changes into master
git checkout master
git merge development

git push --follow-tags

# Return to development
git checkout development

```
