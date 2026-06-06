# Delta

**Remodel your space with AI.**

Delta is a cross-platform (React Native + Web) prototype for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

- **Web (easiest demo)**: http://localhost:3000 after `pnpm web`
- **Backend** (for real AI image gen): `cd backend && node server.js` (port 4000)
- Full owner flow: Onboarding → Design Studio (camera/upload + prompt + AI + prominent ready-to-go cost estimates, summaries, confirms) → Sourcing (approve items) → Labor (auto-schedule with breaks & costing)

## Features (current prototype)

- **Design Studio**: Camera (web file upload + native vision-camera), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after comparison sliders, multiple versions with *prominent* direct project cost estimates (materials + labor "ready to go" in highlighted pills on every card), make-current now surfaces detailed cost summary in alert + dedicated owner Cost Summary panel (breakdown + total) appears when version approved, "Send to Sourcing" evolved to cost confirmation dialog showing/locking total upfront before handoff, improved pipeline status now always includes full est. project cost + breakdowns for transparency. Owner costs feel "ready to go" across the journey.
- **Sourcing**: Dynamic list from designs, approve items from Lowe's/Amazon/Home Depot, running total, generate labor tasks.
- **Labor Scheduler**: 8-hour days, built-in breaks (lunch + short), largest-first packing, per-day breakdown with start/end times, half-day progress, $25/hr guaranteed costing.
- **Worker Experience**: Trade filters, Flickity per-project photo carousels, direct est. costs shown as "ready to go". Full claim/assign flows that update Zustand state (jobs move to "My Assigned Jobs"), owner-sourced data integration (live cards pulling sourcingItems + laborTasks for relevant tasks/costs), scheduling visibility for claimed jobs (day schedules with breaks/costs).
- **State**: Zustand store flows approved design → sourcing items → labor tasks. Worker claims augment the shared store (assignedJobs + laborTasks sync on claim).
- **AI**: Client provider/key UI (x/Gemini/OpenAI/Anthropic). Backend supports xAI (via env `XAI_API_KEY` or per-request key). Backend now leverages uploaded image via reference (data URI for web uploads or http) using xAI image edits endpoint (/images/edits) for real visual understanding + realistic transformations (not just text prompt); significantly richer image-aware prompts direct model to analyze/preserve exact room structure, perspective, lighting etc. Client-side: dynamic material suggestions and cost estimates now much more detailed/realistic based on the actual AI prompt output + tweaks (room inference, style-matched SKUs, luxury multipliers, scope scaling). Priority #1 AI Quality meaningfully advanced.
- Cross-platform intent with web shims and .web.tsx files.

## Tech Stack

- React Native 0.85 + react-native-web + Vite (web on :3000)
- TypeScript, Zustand, Tailwind (web via PostCSS), StyleSheet (native)
- Express backend (simple AI proxy)
- Intended native camera: react-native-vision-camera (added; requires extra native setup for full mobile)
- Enhanced persistence (Zustand multi-project with history/save/load + names/metadata; still uses localStorage on web for designs/sourcing/labor state; optional backend routes for cross-session/demo cloud save)

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

**Owner flow**: Onboarding (role selection + full-screen before/after hero) → Design Studio (photo + prompt + AI variations with tweaks + *prominent* cost estimates + breakdowns surfaced directly on cards, make-current summary, confirm-before-send total, dedicated Cost Summary panel, and pipeline with full est. project cost — "ready to go" transparency in addition to/instead of just "Send to Sourcing") → Sourcing (approve items, totals, retailer links) → Labor (realistic schedules with breaks and $25/hr costing).

**Worker flow**: Dedicated dashboard showing interesting jobs with trade filter (Carpentry, Electrical, Painting, Flooring, etc.), project photos that can be flicked through (using Flickity on web), bullet-point task lists, and **estimated total cost** displayed directly on each job card ("ready to go"). Claim/assign buttons move jobs to a "My Assigned Jobs" section (persisted via store), integrate with owner-sourced items + generated laborTasks (shows live "Owner Project" card pulling from current store data when owner has approved sourcing/labor), and provide actual scheduling visibility (per-claimed-job auto-generated day-by-day schedule with breaks/costs using the shared scheduler logic). Unclaim supported; claiming also syncs tasks into labor state.

- `tsc --noEmit --skipLibCheck` is clean.
- Enhanced persistence: multi-project support (createProject/switchProject/getProjects/rename/delete/saveCurrent + auto current sync), project names/metadata, legacy migration; full state (approvedDesign + sourcingItems + laborTasks) saved per project. Optional backend save/load via store methods + /api/projects (see backend/server.js). Survives refresh on web via localStorage; improved AsyncStorage guidance.
- Content is constrained for desktop readability (max-width containers).
- See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the historical roadmap, completed work, and current remaining gaps. The plan is being actively reconciled with the actual state.

## Known Limitations

- AI generation now uses image references (when data URI or public URL provided from upload) + detailed visual analysis prompts for true image understanding and realistic remodel transformations (via xAI /images/edits path when ref available); pure text fallback for non-data cases. Cost est + material suggestions now much richer and directly derived from the reimagination's prompt/tweaks for better accuracy. (Still limited by model capabilities and demo data.)
- Persistence now supports multi-project history: create/switch/rename/delete/save projects with full design/sourcing/labor state + metadata (names, timestamps); client-side via Zustand (localStorage web) + explicit backend /api/projects routes (in-memory demo on server). Legacy single-project data auto-migrates on load. (AsyncStorage note improved for future native.)
- Native mobile (especially camera with vision-camera) requires additional setup and is not fully turnkey.
- Some demo data, alerts, and flows remain (rapid iteration); owner-side cost estimates now much more prominent/direct with breakdowns, summary panels, and confirm flows (Priority #5 advanced); sourcing suggestions are dynamic based on design prompt + tweaks.
- No real auth, multi-user, or production retailer APIs.
- Worker experience is web-focused (Flickity carousels for photos); native fallbacks are simpler.

See DEVELOPMENT_PLAN.md for a more detailed gap analysis and historical context.

## Contributing / Next

The project has moved beyond the original early phases. Recent work includes:
- Worker experience (Priority #4): claiming/assignment flows (claim buttons update store, move jobs into persisted "My Assigned Jobs" section), "My Assigned Jobs" with unclaim, better integration with owner-sourced data (banner + live "Owner Project" card showing approved sourcingItems count/cost + laborTasks as worker tasks/costs), actual scheduling visibility (inline per-claimed-job schedules computed via scheduler: days/breaks/costs/"starts ~08:00"). Preserves + builds on trade filter, Flickity carousels, direct "ready to go" est costs. Claiming integrates claimed tasks into shared laborTasks.
- Owner-side: Estimated project costs (materials + labor) now shown directly on every AI variation in Design Studio (enhanced with prominent "ready to go" cost pills + breakdown), make-current surfaces costs in alert, new dedicated Cost Summary panel appears for approved version (full transparency), "Send to Sourcing" now requires confirming the total est. cost first, pipeline status improved to always surface the locked-in full project estimate + materials/labor split (advances Owner Flow & Cost Transparency priority). Plus smarter context-aware sourcing suggestions based on prompt + tweaks. (Backend AI note as before.)
- Desktop UI width constraints across key screens.
- Continued owner flow polish.

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full historical roadmap, what has been completed, and the current remaining priorities (reconciled against this README).

PRs welcome. When making changes, please help keep both README.md and DEVELOPMENT_PLAN.md in sync.

## License

TBD (prototype).

---

Built with React Native, Vite, and a bit of imagination.
