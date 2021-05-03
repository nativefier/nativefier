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
