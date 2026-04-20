# MTG Life Counter

> No ads. No accounts. No one arguing about the starting life total.

Track life and poison across 1v1 and multiplayer. Screen rotates so every player faces their own impending doom from their seat — tap either side of the life total to adjust by 1, because that's what you were doing anyway.

**Platforms:** Web (React, Vercel-ready) · Android (Flutter)  
**License:** MIT · **Privacy:** Fully offline. We don't want your data — we just want to watch you lose to Thassa's Oracle.

---

## Project Structure

```
mtg-life-counter/
├── shared/       # Framework-agnostic TypeScript state logic
├── web/          # React 18 + Vite + Tailwind web app
└── android/      # Flutter 3 Android app
```

---

## Prerequisites

- **Node.js** 18+ and npm 9+
- **Flutter** 3.x SDK — https://docs.flutter.dev/get-started/install

---

## Web App

```bash
# Install dependencies (run from repo root)
npm install

# Start dev server with hot reload
npm run dev
# → http://localhost:5173

# Build for production (Vercel-ready)
npm run build
```

### Deploy to Vercel

```bash
vercel --cwd web
```

---

## Android App

```bash
cd android
flutter pub get
flutter run

# Release APK
flutter build apk --release
# → android/build/app/outputs/flutter-apk/app-release.apk
```

---

## Formats

| Format           | Life | Poison | Notes |
|-----------------|------|--------|-------|
| Standard        | 20   | 10     | Two Bolts to the face and you're done |
| Commander       | 40   | 10     | Long enough for someone to combo off twice |
| Two-Headed Giant| 30   | 15     | Share life, share blame |
| Custom          | any  | 10     | For when you've houserule everything anyway |

---

## Features

- Tap left/right of the life total for ±1 — the way nature intended
- ±5 and ±10 for when Earthquake resolves
- Poison counter tracking — because someone always brings Infect
- Undo history (last 10 moves) for when you fat-finger mid-storm
- Screen orientations per player count: opposite in 1v1, rotated at 90° increments in multiplayer
- Persists across restarts — Commander games outlive browser sessions
- No backend. No telemetry. Dark like your Swamps.

---

## Contributing

PRs welcome. Open an issue first for major changes — unlike a Counterspell, we're willing to discuss it.
