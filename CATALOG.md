# Build Commands Catalog

Below you'll find a list of build commands contributed by the Nativefier community. They are here as examples, to help you nativefy "complicated" apps that need a bit of elbow grease to work. We need your help to enrich it, as long as you follow these two guidelines:

1. Only add sites that require something special! No need to document here that `simplesite.com` works with a simple `nativefier simplesite.com` 🙂.
2. Please add commands with the _strict necessary_ to make an app work. For example,
   - Yes to mention that `--widevine` or some `--browserwindow-options` are necessary...
   - ... but don't add other flags that are pure personal preference (e.g. `--disable-dev-tools` or `--disk-cache-size`).

---

## General recipes

### Videos don’t play

Some sites like [HBO Max](https://github.com/nativefier/nativefier/issues/1153) and [Udemy](https://github.com/nativefier/nativefier/issues/1147) host videos using [DRM](https://en.wikipedia.org/wiki/Digital_rights_management).

For those, try passing the [`--widevine`](API.md#widevine) option.

### Settings cached between app rebuilds

You might be surprised to see settings persist after rebuilding your app.
This occurs because the app cache lives separately from the app.

Try deleting your app's cache, found at `<your_app_name_lower_case>-nativefier-<random_id>` in your OS’s "App Data" directory (Linux: `$XDG_CONFIG_HOME` or `~/.config` , MacOS: `~/Library/Application Support/` , Windows: `%APPDATA%` or `C:\Users\yourprofile\AppData\Roaming`)

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

---

## Site-specific recipes

### Google apps

Lying about the User Agent is required, else Google Login will notice your
"Chrome" isn't a real Chrome, and will: 1. Refuse login, 2. Break notifications.

This example documents Google Sheets, but is applicable to other Google apps,
e.g. Google Calendar, GMail, etc. If `firefox` doesn’t work, try `safari` .

```sh
nativefier 'https://docs.google.com/spreadsheets' \
  --user-agent firefox
```

### Outlook

```sh
nativefier 'https://outlook.office.com/mail'
  --internal-urls '.*?(outlook.live.com|outlook.office365.com).*?'
  --file-download-options '{"saveAs": true}'
  --browserwindow-options '{"webPreferences": { "webviewTag": true, "nodeIntegration": true, "nodeIntegrationInSubFrames": true } }'
```

Note: `--browserwindow-options` is needed to allow pop-outs when creating/editing an email.

### Udemy

```sh
nativefier 'https://www.udemy.com/'
  --internal-urls '.*?udemy.*?'
  --file-download-options '{"saveAs": true}'
  --widevine
```

Note: most videos will work, but to play some DRMed videos you must pass `--widevine` AND [sign the app](https://github.com/nativefier/nativefier/issues/1147#issuecomment-828750362).

### HBO Max

```sh
nativefier 'https://play.hbomax.com/'
  --widevine
  --enable-es3-apis
&& python -m castlabs_evs.vmp sign-pkg 'name_of_the_generated_hbo_app'
```

Note: as for Udemy, `--widevine` + [app signing](https://github.com/nativefier/nativefier/issues/1147#issuecomment-828750362) is necessary.

### WhatsApp

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

Another option to see WhatsApp or WhatsApp Business more macOS-like (macos only):

```sh
nativefier https://web.whatsapp.com --name 'WhatsApp Business' --counter true --darwin-dark-mode-support true --title-bar-style hidden --inject whatsappmacos.css
```

with this `whatsappmacos.css` to make the window draggable, and move the user avatar to the right:
```css
header > div:first-child {
    flex: 0 0 auto;
    margin-right: 15px;
}
div#app > div.os-mac > span:first-child {
    position: fixed;
    top: 0;
    z-index: 1000;
    width: 100%;
    height: 59px;
    pointer-events: none;
    -webkit-app-region: drag;
}
```

### Spotify

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


### Notion

You can use Notion pages with Nativefier without much hassle, but Notion itself does not present an easy way to use HTML buttons. As such, if you want to use Notion Pages as a quick way to make dashboards and interactive panels, you will be restricted to only plain links and standard components. 

With Nativefier you can now extend Notion's functionality and possibilities by adding HTML buttons that can call other javascript functions, since it enables you to inject custom Javascript and CSS.

```sh
nativefier 'YOUR_NOTION_PAGE_SHARE_URL'
  --inject notion.js
  --inject notion.css
```

Notes:

- You can inject the notion.js and notion.css files by copying them to the resources/app/inject folder of your nativefier app.
- In your Notion page, use [notionbutton]BUTTON_TEXT|BUTTON_ACTION[/notionbutton], where BUTTON_TEXT is the text contained in your button and BUTTON_ACTION is the action which will be called in your JS function.
```javascript
/* notion.js */

// First, we replace all placeholders in our Notion page to add our interactive buttons to it.
window.onload = 
  setTimeout(function(){
    let htmlCode = document.body.getElementsByTagName("*");
    for (let i = 0; i <= htmlCode.length; i++) {
      if(htmlCode[i] && htmlCode[i].innerHTML){
        let match = htmlCode[i].innerHTML.match(/\[notionbutton\]([\s\S]*?)\[\/notionbutton\]/);
        if (match && typeof match == 'object'){
          let btnarray = match['1'].split("|");
          let btn_text = btnarray[0];
          let btn_action = btnarray[1];
          htmlCode[i].innerHTML = htmlCode[i].innerHTML.replace(match['0'], "<button class=\"btn-notion\" btnaction=\"" + btn_action + "\"  >"+btn_text+"</button>");
        }
      }
    }
    let buttons = document.querySelectorAll(".btn-notion");
    for (let j=0; j <= buttons.length; j++){
      if(buttons[j].hasAttribute("btnaction")){
        buttons[j].onclick = function () { runAction(buttons[j].getAttribute("btnaction")) };
      }
    }
  }, 3000);

// And then we define your action below, according to our needs
function runAction(action) {
    switch(action){
      case '1':
        alert('Nice One!');
        break;
      default:
        alert('Hello World!');
    }
}
```

After that, set your css file as follows:
```css
.notion-topbar{ /* hiding notion's default navigation bar for a more "app" feeling */
  display:none; 
}
.btn-notion{ /* defining some style for our buttons */
  background-color:#FFC300;
  color: #333333;
}
.notion-selectable.notion-page-block.notion-collection-item span{
  pointer-events: auto !important; /* notion prevents clicks on items inside databases. Use this to remove that. */
}
```

### Microsoft Teams

You can get an almost macOS look-alike using this:

```sh
nativefier https://teams.microsoft.com --name 'Microsoft Teams' --counter true --darwin-dark-mode-support true --title-bar-style hidden --internal-urls "(.*)" --inject teamsapp.css
```
Note that the `--internal-urls` argument is necessary to login.

Inject the following `teamsapp.css` file to hide the download button at the bottom left and the Office 365 apps waffle button at the top left:
```css
get-app-button.ts-sym.app-bar-link {
    display: none;
}
button#ts-waffle-button {
    display: none;
}
```
