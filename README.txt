JOURNEYLOG — INSTALL AS A FREE APP ON YOUR ANDROID PHONE
=========================================================

WHAT'S IN THIS FOLDER
  index.html   — the whole app
  manifest.json, sw.js, icon-192.png, icon-512.png — makes it installable + work offline

ONE-TIME SETUP (about 10 minutes, everything free)

STEP 1 — Put the files online with GitHub Pages
  1. Go to github.com and create a free account (if you don't have one)
  2. Click "+" (top right) -> "New repository"
     Name it: journeylog   |  keep it Public  |  click "Create repository"
  3. On the repository page click "uploading an existing file"
     Drag ALL 5 files from this folder in -> click "Commit changes"
  4. Go to Settings -> Pages (left sidebar)
     Under "Branch" choose: main, folder: / (root) -> Save
  5. Wait 1-2 minutes. Your app is now live at:
     https://YOUR-USERNAME.github.io/journeylog/

STEP 2 — Install on your phone
  1. Open that link in CHROME on your Android phone
  2. Tap the three-dot menu -> "Add to Home screen" (or "Install app")
  3. Done! A "JourneyLog" icon appears on your home screen.
     It opens full-screen like a normal app and works offline.

NOTES
  - Your data (trips, tickets, images) is stored ON THIS PHONE.
    It does not sync with the Claude version or other devices.
  - The alarm button downloads a .ics file — open it once and all
    reminders are added to Google Calendar with phone notifications.
  - "Check fares" opens Google Flights / bus search directly.
  - To update the app later: upload the new index.html to the same
    repository, then refresh the app.
