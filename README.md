# Delta

**Remodel your space with AI.**

Delta is a cross-platform (React Native + Web) prototype for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

- **Web (easiest demo)**: http://localhost:3000 after `pnpm web`
- **Backend** (for real AI image gen): `cd backend && node server.js` (port 4000)
- Full owner flow: Onboarding → Design Studio (camera/upload + prompt + AI) → Sourcing (approve items) → Labor (auto-schedule with breaks & costing)

## Features (current prototype)

- **Design Studio**: Camera (web file upload + native vision-camera), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after comparison sliders, multiple versions, "use this version" + send to sourcing.
- **Sourcing**: Dynamic list from designs, approve items from Lowe's/Amazon/Home Depot, running total, generate labor tasks.
- **Labor Scheduler**: 8-hour days, built-in breaks (lunch + short), largest-first packing, per-day breakdown with start/end times, half-day progress, $25/hr guaranteed costing.
- **State**: Zustand store flows approved design → sourcing items → labor tasks.
- **AI**: Client provider/key UI (x/Gemini/OpenAI/Anthropic). Backend supports xAI (via env `XAI_API_KEY` or per-request key). Image gen is currently prompt-driven (image URI passed but not yet vision/img2img).
- Cross-platform intent with web shims and .web.tsx files.

## Tech Stack

- React Native 0.85 + react-native-web + Vite (web on :3000)
- TypeScript, Zustand, Tailwind (web via PostCSS), StyleSheet (native)
- Express backend (simple AI proxy)
- Intended native camera: react-native-vision-camera (added; requires extra native setup for full mobile)
- No persistence yet (in-memory + localStorage planned)

## Getting Started

### Prerequisites
- Node >= 22.11
- pnpm (recommended, lockfile present)
- For iOS: Ruby + CocoaPods (see Gemfile)
- (Optional) `XAI_API_KEY` for real Grok image generation

### Run the Web Demo (recommended for Phase 0+)

```sh
# Terminal 1: web app
cd ~/git/delta
pnpm web
# Open http://localhost:3000

# Terminal 2: backend (for AI calls)
cd ~/git/delta/backend
node server.js
# Or: pnpm dev:backend (from root)
```

To use **real AI images**:
- Get an xAI key
- `XAI_API_KEY=your_key node server.js` (or export it)
- In the app UI, you can also "Save Provider & Key" (xAI key will be sent to backend and used)

On web, "Take Photo" opens file picker. Reimagine calls backend or falls back to bundled demo images.

### Mobile (Android/iOS)

```sh
pnpm start          # Metro
pnpm android        # or pnpm ios
```

**Notes**:
- iOS first time: `bundle install && bundle exec pod install` (in ios/)
- Native camera (`react-native-vision-camera`) is declared but requires full native integration (permissions in Info.plist/AndroidManifest, pod/gradle updates, possibly reanimated). Web upload always works as fallback.
- Backend calls from device/emulator need to target your dev machine's LAN IP (not localhost) or use a tunnel.

### Other commands

```sh
pnpm lint
pnpm typecheck     # tsc --noEmit --skipLibCheck (should be clean)
pnpm test
pnpm build:web
```

## Project Structure

```
src/
  features/
    design/          # Camera, AIProviderSelector, DesignStudioScreen, BeforeAfterSlider, realImageGen (stub)
    labor/           # LaborSchedulerScreen + scheduler.ts (core logic)
    sourcing/        # SourcingScreen + types
  onboarding/
  store/             # useDeltaStore.ts (design -> sourcing -> labor)
  web-shims/
backend/server.js    # Express, /api/reimagine (xAI)
public/              # demo images
```

## Current Status & Phase 0

This is an early prototype. Phase 0 focused on:
- Making the web demo clean and usable (no TS errors, consistent styling, working provider UI, implemented TODOs, proper alerts, postcss for Tailwind, web shims, vision-camera declared).
- `tsc --noEmit --skipLibCheck` is clean.
- See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full roadmap, known gaps, and next phases (real AI wiring, persistence, navigation, native polish, etc.).

## Known Limitations (as of Phase 0)

- AI generation is text-prompt only (no full image understanding/img2img yet); multi-provider UI is present but backend only fully supports xAI.
- No real persistence (refresh loses state).
- Sourcing items are sample/hardcoded when sending a design.
- Native mobile camera not fully wired (web file upload works).
- Some hardcoded data and alerts for demo.
- No auth, backend storage, or real retailer APIs.

## Contributing / Next

See DEVELOPMENT_PLAN.md for prioritized tasks (start with remaining Phase 0 doc polish if needed, then Phase 1 cross-platform etc.).

PRs welcome. Update the plan as things evolve.

## License

TBD (prototype).

---

Built with React Native, Vite, and a bit of imagination.
