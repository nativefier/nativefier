
6.4.0 / 2016-01-21
==================

  * Make debug script automatically open the packaged app on OSX
  * Remove "About Electron" from app menu, add nativefier version to help, which fixes #18
  * Implement `--pretend` flag to easily simulate user agent strings, fixes #11
  * Merge branch 'master' of github.com:jiahaog/nativefier
  * Fix bug in error when response is undefined
  * Add helper scripts to debug easily
  * Hide app instead of exiting on OSX to fix #14
  * Update deprecated electron loadUrl usage Remove crash reporter Remove commented code
  * Merge pull request #20 from mattchue/master
  * Merge pull request #25 from PoziWorld/patch-1
  * Merge pull request #24 from himynameisdave/master
  * Make app resource folder contain a short id string, fix #21
  * Minor copy fixes
  * Fixes the issue with "/"'s in the page title
  * Update documentation, no longer need to add the full url with the protocol
  * Fix wrong bool
  * Allow intranet URLs
  * Update readme
  * Hide the webview until it finishes loading
