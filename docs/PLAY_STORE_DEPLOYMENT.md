# Google Play Store Deployment (PWA)

Since the MTG Life Counter is now a fully capable Progressive Web App (PWA), it can be submitted and deployed directly to the Google Play Store *without* needing to write a single line of Java/Kotlin/Flutter code.

Under the hood, Google Play supports **Trusted Web Activities (TWA)**, which is essentially a lightweight wrapper around an instance of Chrome, running your PWA fullscreen as if it were a native app.

## The Strategy: PWABuilder

The easiest, Microsoft and Google-endorsed route for packaging a PWA is using [PWABuilder](https://www.pwabuilder.com/).

### Prerequisites
1. Deploy your app to an HTTPS endpoint (e.g., Vercel: `https://your-mtg-app.vercel.app`).
2. Have a verified Google Play Console developer account.

### Packaging Steps
1. Visit **https://www.pwabuilder.com/** and enter your deployed URL.
2. PWABuilder will automatically scan your `manifest.json`, Service Worker, and icons. Ensure your manifest achieves a passing score.
3. Once verified, click **"Package For Stores"**.
4. Select **Android** and click **"Generate Package"**.
5. PWABuilder will prompt you for variables like the Android Package Name (e.g. `com.mtglife.app`), App Name, and Signing Keys.
6. Once configured, you will download a `.aab` (Android App Bundle).

### Publishing
1. Go to the [Google Play Console](https://play.google.com/console).
2. Create a new App and fill out the store listing details including screenshots (which can just be screenshots of your web app running on a phone).
3. Upload the `.aab` file provided by PWABuilder to the Production / Testing track.
4. Go through the review process!

### Local Build Fallback (Bubblewrap)
If you prefer a local CLI, you can use Google's official command line tool: **Bubblewrap**.
```bash
npm i -g @GoogleChromeLabs/bubblewrap
bubblewrap init --manifest=https://your-mtg-app.vercel.app/manifest.json
bubblewrap build
```
This produces an APK/AAB locally.
