# Mantra Mandiram — Native App Packaging

This folder contains real, ready-to-build native app projects that wrap the
live PWA at **https://annagarments.vercel.app/mantras-app/** so it can be
submitted to the Google Play Store and the Apple App Store. Both are thin
wrappers around the live site (like the official "Trusted Web Activity" and
Capacitor patterns) — the actual app content stays on the web, so updating
the website updates the app automatically, no store resubmission needed for
content changes.

**What I could not do for you:** create or pay for your Google Play Console
account ($25 one-time) or Apple Developer Program account ($99/year), or
actually compile/sign the final builds — that needs tools tied to your own
machine and accounts. Everything else — the full project source, icons,
signing keystore, and Digital Asset Links file — is done and included below.

---

## 1. Android (Play Store)

**Folder:** `native-apps/android/` — a complete Android Studio project.

### One-time setup
1. **Download your signing keystore** — I generated
   `mantra-mandiram-release.keystore` for you (sent separately, not in this
   repo — a signing key must never be committed to source control since
   anyone with it could publish updates to your app). Save it somewhere
   safe and **back it up** — if you lose it, you can never update the app
   again under the same listing.
2. Place the keystore file at `native-apps/android/mantra-mandiram-release.keystore`.
3. Set the keystore password (also sent separately) as an environment
   variable before building:
   ```
   export MM_KEYSTORE_PASSWORD="<the password I sent you>"
   ```
4. Confirm `/.well-known/assetlinks.json` (already added to the site root)
   is live at `https://annagarments.vercel.app/.well-known/assetlinks.json`
   — this is what lets the Android app open the site full-screen with no
   browser address bar. It's already committed and will deploy with the
   site automatically.

### Build
Open `native-apps/android` in **Android Studio** (it will fetch the Android
SDK/Gradle plugin itself on first open — that step needs your own internet
access, which this sandbox doesn't have). Then:
- **Build → Generate Signed Bundle / APK → Android App Bundle**, or from
  the command line: `./gradlew bundleRelease`
- This produces `app/build/outputs/bundle/release/app-release.aab`

### Publish
1. Create a [Google Play Console](https://play.google.com/console) account.
2. Create a new app, upload the `.aab` under **Production → Create release**.
3. Fill in store listing: screenshots (take a few from the live site on a
   phone), short description, full description, category ("Lifestyle" or
   "Books & Reference"), content rating questionnaire, and the privacy
   policy URL: `https://annagarments.vercel.app/mantras-app/privacy.html`
4. Submit for review (usually a few hours to a few days).

---

## 2. iOS (App Store)

**Folder:** `native-apps/ios-app/` — a Capacitor project with a generated
Xcode project at `ios/App/App.xcworkspace`.

**Requirement: a Mac with Xcode.** Apple only allows building and
submitting iOS apps from macOS — this is an Apple platform restriction, not
something any tool can work around. If you don't have a Mac, options
include borrowing one, a Mac-in-the-cloud rental service (e.g. MacStadium,
MacinCloud), or asking someone with a Mac to run the build steps below.

### One-time setup (on the Mac)
1. Install [Xcode](https://apps.apple.com/app/xcode/id497799835) from the
   Mac App Store, and [CocoaPods](https://cocoapods.org/) (`sudo gem install cocoapods`).
2. In this folder: `npm install`
3. `npx cap sync ios`
4. `cd ios/App && pod install`

### Build
1. Open `ios/App/App.xcworkspace` in Xcode (open the `.xcworkspace`, not
   `.xcodeproj`).
2. Under the App target → **Signing & Capabilities**, sign in with your own
   Apple ID and select your Apple Developer Team (this requires the paid
   Apple Developer Program membership).
3. **Product → Archive**, then use the Organizer window's **Distribute App**
   button to upload to App Store Connect.

### Publish
1. Create an [Apple Developer Program](https://developer.apple.com/programs/) account.
2. In [App Store Connect](https://appstoreconnect.apple.com/), create a new
   app with bundle ID `com.mantramandiram.app` (matches the Xcode project).
3. Fill in store listing: screenshots (Xcode's simulator can generate the
   required sizes), description, category, age rating, and the privacy
   policy URL: `https://annagarments.vercel.app/mantras-app/privacy.html`
4. Submit for review (Apple's review typically takes 1–3 days).

---

## Suggested store listing text

**Short description:** Mantras, stotras, ashtottaras and dosha nivarana
mantras for every deity — in Kannada, Sanskrit, Tamil, Malayalam and Telugu.

**Category:** Lifestyle / Books & Reference

**App icon:** `store-assets/play-store-icon-512.png` (512×512, for Play
Console's listing icon; iOS uses the icon already embedded in the Xcode
project).

Both stores will also ask for a handful of phone screenshots — the easiest
way to get these is opening the live site on an actual phone (or Chrome
DevTools' device emulator) and taking screenshots of the home screen, a
deity detail page, and the language switcher.
