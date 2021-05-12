# Build Commands Catalog

Below you'll find a list of build commands contributed by the Nativefier community. They are here as examples, and to help you nativefy "complicated" apps that ask a bit of elbow grease to work.

- Only add sites that require something special! No need to document here that `simplesite.com` works with a simple `nativefier simplesite.com` 🙂
- If you'd like to add to this catalog, please add commands with the *strict necessary* to make an app work. So, for example,

- Yes to have `--widevine` in Udemy. Yes to `--internal-urls` and `--browserwindow-options` for Outlook Web. Yes to a name and icon for both...
- ... but let's not have all the other flags that are a matter of personal preference (e.g. `--disable-dev-tools` or `--disk-cache-size`).

* * *

## Outlook Web

```
nativefier https://outlook.office.com/mail 
--internal-urls ".*?(outlook.live.com|outlook.office365.com|outlook.office.com).*?" 
--file-download-options "{\"saveAs\": true}" 
--browserwindow-options "{ \"webPreferences\": { \"webviewTag\": true, \"nodeIntegration\": true, \"nodeIntegrationInSubFrames\": true, \"nativeWindowOpen\": true } }"
```

### Notes

`--browserwindow-options` -- This is needed in order to allow the window to pop out when creating/editing an email.

## Udemy

```
nativefier https://www.udemy.com/  
--internal-urls ".*?udemy.*?" 
--file-download-options "{\"saveAs\": true}" 
--widevine
```

### Notes

Most videos will work, but to be sure everything works you are better off using the `--widevine` version AND signing the app afterwards. See this post: [#1147 (comment)](https://github.com/nativefier/nativefier/issues/1147#issuecomment-828750362)


## Spotify

```
nativefier https://open.spotify.com/
--name "Spotify" 
--widevine 
-u "<useragent your browser uses>"
--inject spotify.js
--inject spotify.css
--icon icon.
```

### Notes

- [Inject](https://github.com/nativefier/nativefier/blob/master/docs/api.md#inject) the folowing javascript as `spotify.js` to prevent "Unsupported Browser" messages.
```javascript
function dontShowBrowserNoticePage() {
    const browserNotice = document.getElementById('browser-support-notice');
    console.log({ browserNotice })
    if (typeof browserNotice !== "undefined" && browserNotice !== null) {
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
                worker.unregister().then((u) => {
                    console.debug('Unregistered worker', worker);
                    reload();
                }).catch((e) =>
                    console.error('Unable to unregister worker', error, { worker })
                )
            );
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    nukeWorkers()
});

if (document.readyState === "interactive") {
    nukeWorkers();
}
```
- It is also required to [sign](https://github.com/nativefier/nativefier/blob/master/docs/api.md#widevine) the app afterwards or many songs will not play.
- The [icon](https://github.com/nativefier/nativefier/blob/master/docs/api.md#icon) also needs to be changed manually.
- To hide all download links (as if you were in the actual app), [inject](https://github.com/nativefier/nativefier/blob/master/docs/api.md#inject) the following CSS as `spotify.css`:
```css
a[href="/download"] {
    display: none;
}
```
