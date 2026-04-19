# MTG Life Counter

A Magic: The Gathering life counter app for 1v1 and multiplayer (up to 4 players). Tracks life totals and poison counters with full undo history.

**Platforms:** Web (React, Vercel-ready) · Android (Flutter, Google Play / F-Droid)  
**License:** MIT · **Privacy:** Zero tracking, fully offline, no accounts required

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

# Install Flutter dependencies
flutter pub get

# Run on connected device / emulator
flutter run

# Build release APK
flutter build apk --release
# Output: android/build/app/outputs/flutter-apk/app-release.apk
```

---

## Game Modes

| Mode        | Players | Starting Life |
|-------------|---------|--------------|
| 1v1         | 2       | 20           |
| Multiplayer | 3–4     | 20           |

## Format Presets

| Format           | Life | Poison |
|-----------------|------|--------|
| Standard        | 20   | 10     |
| Commander       | 40   | 10     |
| Two-Headed Giant| 30   | 15     |
| Custom          | any  | 10     |

---

## Features

- Life total tracking (±1, ±5, ±10)
- Poison counter tracking (±1)
- Undo history (last 10 moves)
- Format presets on game start
- Persists across app restart (localStorage / SharedPreferences)
- 1v1 and 3–4 player multiplayer modes
- No backend, no accounts, no telemetry

---

## Contributing

PRs welcome. Please open an issue first for major changes.
