# Build Commands Catalog

Below you'll find a list of build commands contributed by the Nativefier community. They are here as examples, to help you nativefy "complicated" apps that need a bit of elbow grease to work. We need your help to enrich it, as long as you follow these two guidelines:

1. Only add sites that require something special! No need to document here that `simplesite.com` works with a simple `nativefier simplesite.com` 🙂.
2. Please add commands with the _strict necessary_ to make an app work. For example,
   - Yes to mention that `--widevine` or some `--browserwindow-options` are necessary...
   - ... but don't add other flags that are pure personal preference (e.g. `--disable-dev-tools` or `--disk-cache-size`).

---

## General recipes

### Window size and position

This allows the last set window size and position to be remembered and applied
after your app is restarted. Note: PR welcome for a built-in fix for that :) .

```sh
nativefier 'https://open.google.com/'
  --inject window.js
```

Note: [Inject](https://github.com/nativefier/nativefier/blob/master/API.md#inject)
the following javascript as `windows.js` to prevent the window size and position to reset.
```javascript
function storeWindowPos() {
  window.localStorage.setItem('windowX', window.screenX);
  window.localStorage.setItem('windowY', window.screenY);
}

window.moveTo(window.localStorage.getItem('windowX'), window.localStorage.getItem('windowY'));
setInterval(storeWindowPos, 250);
```

## Google apps

(This example documents Google Sheets, but is applicable to other Google apps,
e.g. Google Calendar)

```sh
nativefier 'https://docs.google.com/spreadsheets' \
  --user-agent firefox
```

Note: lying about the User Agent is required, else Google will notice your
"Chrome" isn't a real Chrome, and will:

1. Refuse login
2. Break notifications

## Outlook

```sh
nativefier 'https://outlook.office.com/mail'
  --internal-urls '.*?(outlook.live.com|outlook.office365.com).*?'
  --file-download-options '{"saveAs": true}'
  --browserwindow-options '{"webPreferences": { "webviewTag": true, "nodeIntegration": true, "nodeIntegrationInSubFrames": true } }'
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

## HBO Max

```sh
nativefier 'https://play.hbomax.com/'
  --widevine
  --enable-es3-apis
&& python -m castlabs_evs.vmp sign-pkg 'name_of_the_generated_hbo_app'
```

Note: as for Udemy, `--widevine` + [app signing](https://github.com/nativefier/nativefier/issues/1147#issuecomment-828750362) is necessary.

## WhatsApp

```sh
nativefier 'https://web.whatsapp.com/'
  --inject whatsapp.js
```

With this `--inject` in `whatsapp.js` (and maybe more, see [#1112](https://github.com/nativefier/nativefier/issues/1112)):

```javascript
if ('serviceWorker' in navigator) {
  caches.keys().then(function (cacheNames) {
    cacheNames.forEach(function (cacheName) {
      caches.delete(cacheName);
    });
  });
}
```

## Spotify

```sh
nativefier 'https://open.spotify.com/'
  --widevine
  --inject spotify.js
  --inject spotify.css
```

Notes:

- You might have to pass `--user-agent firefox` to circumvent Spotify's detection that your browser isn't a real Chrome. But [maybe not](https://github.com/nativefier/nativefier/issues/1195#issuecomment-855003776).
- [Inject](https://github.com/nativefier/nativefier/blob/master/API.md#inject) the following javascript as `spotify.js` to prevent "Unsupported Browser" messages.

```javascript
function dontShowBrowserNoticePage() {
  const browserNotice = document.getElementById('browser-support-notice');
  console.log({ browserNotice });
  if (browserNotice) {
    // When Spotify displays the browser notice, it's not just the notice,
    // but the entire page is focused on not allowing you to proceed.
    // So in this case, we hide the body element (so nothing shows)
    // until our JS deletes the service worker and reload (which will actually load the player)
    document.getElementsByTagName('body')[0].style.display = 'none';
  }
}

function reload() {
  window.location.href = window.location.href;
}

function nukeWorkers() {
  dontShowBrowserNoticePage();
  if ('serviceWorker' in navigator) {
    caches.keys().then(function (cacheNames) {
      cacheNames.forEach(function (cacheName) {
        console.debug('Deleting cache', cacheName);
        caches.delete(cacheName);
      });
    });
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((worker) =>
        worker
          .unregister()
          .then((u) => {
            console.debug('Unregistered worker', worker);
            reload();
          })
          .catch((e) =>
            console.error('Unable to unregister worker', error, { worker }),
          ),
      );
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  nukeWorkers();
});

if (document.readyState === 'interactive') {
  nukeWorkers();
}
```

- It is also required to [sign the app](https://github.com/nativefier/nativefier/blob/master/API.md#widevine), or many songs will not play.
- To hide all download links (as if you were in the actual app), [inject](https://github.com/nativefier/nativefier/blob/master/API.md#inject) the following CSS as `spotify.css`:

```css
a[href='/download'] {
  display: none;
}
```
