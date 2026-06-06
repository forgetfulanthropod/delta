# Delta

**Remodel your space with AI.**

Delta is a cross-platform (React Native + Web) prototype for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

- **Web (easiest demo)**: http://localhost:3000 after `pnpm web`
- **Backend** (for real AI image gen): `cd backend && node server.js` (port 4000)
- Full owner flow: Onboarding → Design Studio (camera/upload + prompt + AI) → Sourcing (approve items) → Labor (auto-schedule with breaks & costing)

## Features (current prototype)

- **Design Studio**: Camera (web file upload + native vision-camera), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after comparison sliders, multiple versions with direct project cost estimates (materials + labor "ready to go"), "use this version" + send to sourcing.
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
- Basic persistence (Zustand + localStorage on web for approved design, sourcing, and labor tasks)

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

## Current Status

This is a functional prototype focused on the web experience (easiest to demo and iterate).

**Owner flow**: Onboarding (role selection + full-screen before/after hero) → Design Studio (photo + prompt + AI variations with tweaks + direct estimated project costs shown on each version + photo carousels in some views) → Sourcing (approve items, totals, retailer links) → Labor (realistic schedules with breaks and $25/hr costing).

**Worker flow**: Dedicated dashboard showing interesting jobs with trade filter (Carpentry, Electrical, Painting, Flooring, etc.), project photos that can be flicked through (using Flickity on web), bullet-point task lists, and **estimated total cost** displayed directly on each job card ("ready to go") instead of a "send to sourcing" handoff. "Claim job" surfaces the locked-in estimate.

- `tsc --noEmit --skipLibCheck` is clean.
- Basic persistence via Zustand (survives refresh on web).
- Content is constrained for desktop readability (max-width containers).
- See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the historical roadmap, completed work, and current remaining gaps. The plan is being actively reconciled with the actual state.

## Known Limitations

- AI generation is still primarily text-prompt driven (image is referenced in prompts but full vision/img2img understanding is limited).
- Persistence is basic (Zustand + localStorage on web); no backend storage or multi-project history yet.
- Native mobile (especially camera with vision-camera) requires additional setup and is not fully turnkey.
- Some demo data, alerts, and flows remain (rapid iteration); owner-side cost estimates and sourcing suggestions are now more dynamic based on design prompt + tweaks.
- No real auth, multi-user, or production retailer APIs.
- Worker experience is web-focused (Flickity carousels for photos); native fallbacks are simpler.

See DEVELOPMENT_PLAN.md for a more detailed gap analysis and historical context.

## Contributing / Next

The project has moved beyond the original early phases. Recent work includes:
- Worker dashboard with trade filters, flickable project photos (Flickity), and per-job estimated costs shown directly ("ready to go").
- Owner-side: Estimated project costs (materials + labor) now shown directly on every AI variation in Design Studio, plus smarter context-aware sourcing suggestions based on prompt + tweaks.
- Desktop UI width constraints across key screens.
- Continued owner flow polish.

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full historical roadmap, what has been completed, and the current remaining priorities (reconciled against this README).

PRs welcome. When making changes, please help keep both README.md and DEVELOPMENT_PLAN.md in sync.

## License

TBD (prototype).

---

Built with React Native, Vite, and a bit of imagination.
