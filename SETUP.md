# VisionAI — Setup & Run

A premium React Native (Expo) app that captures a photo, sends it to Google's
**Gemini Vision** model, and renders a structured AI analysis of the frame.

> The product/design intent lives in [`README.md`](./README.md). This file is
> the practical guide to running it.

## Requirements

- Node 18+ (tested on Node 24)
- The **Expo Go** app on a physical iOS/Android device, or an iOS Simulator /
  Android Emulator
- A free **Gemini API key** → https://aistudio.google.com/app/apikey

## Install

```bash
npm install
```

## Add your Gemini API key

You can do this **without touching code**:

1. Launch the app.
2. On the landing screen, tap the **options icon** (top-right) — or the
   "Add your Gemini API key" hint.
3. Paste your key, optionally set the model (defaults to `gemini-2.5-flash`),
   and **Save**. The key is stored locally with AsyncStorage.

Alternatively, prefill it for development in [`app.json`](./app.json):

```jsonc
"extra": {
  "geminiApiKey": "YOUR_KEY",
  "geminiModel": "gemini-2.5-flash"
}
```

## Run

```bash
npm run ios       # iOS Simulator
npm run android   # Android Emulator
npm start         # Dev server + QR code for Expo Go
```

> The camera requires a real device or a simulator/emulator with a camera.

## Optional — Roboflow object detection

Add a Roboflow API key and model id (`project/version`, e.g. `coco/3`) in the
same Settings sheet. When set, results gain an **Object Detection** card with
bounding boxes and confidence scores alongside the Gemini analysis. It's fully
optional and never blocks the core flow.

## How it works

```
Landing → Camera → Preview (pick a lens) → Results
```

- **Camera** captures at `quality: 0.7`, then downscales/compresses to JPEG
  base64 for a fast request.
- **Preview** offers three analysis lenses: **Academic**, **Safety**,
  **Inventory**.
- **Results** renders structured cards: Objects, Scene Context, Activities,
  Recommendations (+ optional Roboflow detections).

## Architecture

| Area        | Location                          |
| ----------- | --------------------------------- |
| Theme       | `src/theme/`                      |
| AI services | `src/services/ai/`                |
| Providers   | `geminiProvider`, `roboflowProvider` (swappable via `VisionProvider`) |
| State       | `src/context/` (settings, capture) |
| Screens     | `src/screens/`                    |
| Components  | `src/components/`                 |

The model layer is **modular**: `analyzeImage()` accepts any `VisionProvider`,
so swapping in a future Gemini model (or another vision backend) is a one-line
change.

## Type-check

```bash
npx tsc --noEmit
```
