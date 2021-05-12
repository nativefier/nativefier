# Build Commands Catalog

Below you'll find a list of build commands contributed by the Nativefier community. They are here as examples, to help you nativefy "complicated" apps that need a bit of elbow grease to work. We need your help to enrich it, as long as you follow these two guidelines:

1. Only add sites that require something special! No need to document here that `simplesite.com` works with a simple `nativefier simplesite.com` 🙂.
2. Please add commands with the *strict necessary* to make an app work. For example,
    - Yes to mention that `--widevine` or some `--browserwindow-options` are necessary...
    - ... but don't add other flags that are pure personal preference (e.g. `--disable-dev-tools` or `--disk-cache-size`).

---

## Google apps

(This example documents Google Sheets, but is applicable to other Google apps)

```sh
nativefier 'https://docs.google.com/spreadsheets' \
  --user-agent 'user agent of current stable Firefox'
```

Note: lying about the User Agent is required, else Google will notice your "Chrome" isn't a real Chrome, and will refuse access.

## Outlook

```sh
nativefier 'https://outlook.office.com/mail'
  --internal-urls '.*?(outlook.live.com|outlook.office365.com).*?'
  --file-download-options '{"saveAs": true}'
  --browserwindow-options '{"webPreferences": { "webviewTag": true, "nodeIntegration": true, "nodeIntegrationInSubFrames": true, "nativeWindowOpen": true } }'
```

Note: `--browserwindow-options` is needed to allow pop-outs when creating/editing an email.

## Udemy

```sh
nativefier 'https://www.udemy.com/'
  --internal-urls '.*?udemy.*?'
  --file-download-options '{"saveAs": true}'
  --widevine
```

Note: most videos will work, but to play some DRMed videos you must pass `--widevine` AND [sign the app](https://github.com/nativefier/nativefier/issues/1147#issuecomment-828750362).
