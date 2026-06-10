# Delta

**Remodel your space with AI.**

Delta is a cross-platform (React Native + Web) prototype for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

- **Web (easiest demo)**: http://localhost:3000 after `pnpm web`
- **Backend** (for real AI image gen): `cd backend && node server.js` (port 4000)
- Full owner flow: Onboarding → **Design** tab (Design Studio: camera/upload + prompt + AI + prominent ready-to-go cost estimates...) → Sourcing → Scoping (selected design hero + trade-broken scope tree with story points per subtask + live Scrum burndown SVG line chart trending to 0 remaining points; scope syncs from labor tasks when available) → Scheduling (auto day-by-day with breaks & $25/hr costing). Owner header includes **project switcher** (multi-project create/switch/rename/delete + backend cloud sync) and pipeline progress bar.

## Features (current prototype)

- **Design Studio**: Camera (solid web upload w/ preview+demo fallback via .web.tsx; native vision-camera live + capture + fallbacks + permissions via .tsx), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after comparison sliders, multiple versions with *prominent* direct project cost estimates (materials + labor "ready to go" in highlighted pills on every card), make-current now surfaces detailed cost summary in alert + dedicated owner Cost Summary panel (breakdown + total) appears when version approved, "Send to Sourcing" evolved to cost confirmation dialog showing/locking total upfront before handoff, improved pipeline status now always includes full est. project cost + breakdowns for transparency. Owner costs feel "ready to go" across the journey. (Native/cross-platform camera consistency advanced.)
- **Sourcing**: Dynamic list from designs, approve items from Lowe's/Amazon/Home Depot, running total, generate labor tasks.
- **Scoping**: For the selected/approved design (hero image shown first): full scope tree broken up by trade (Carpentry, Electrical, Painting, Flooring, Demolition, Plumbing etc.) with story points assigned to every subtask. Interactive Scrum burndown chart (SVG line chart) showing progress vs. ideal plan, trending to 0 points remaining. Complete subtasks to burn down live; sync scope items to labor tasks. Ties design → execution with Scrum project management visuals.
- **Scheduling** (formerly Labor): 8-hour days, built-in breaks (lunch + short), largest-first packing, per-day breakdown with start/end times, half-day progress, $25/hr guaranteed costing. Driven from scoped work.
- **Worker Experience**: Trade filters, cross-platform scrollable per-project photo carousels (iOS/Android/Web), direct est. costs shown as "ready to go". Full claim/assign flows that update Zustand state (jobs move to "My Assigned Jobs"), owner-sourced data integration (live cards pulling sourcingItems + laborTasks for relevant tasks/costs), scheduling visibility for claimed jobs (day schedules with breaks/costs using the shared scheduler logic). Unclaim supported; claiming also syncs tasks into labor state.
- **State**: Zustand store flows approved design → sourcing items → labor tasks. Worker claims augment the shared store (assignedJobs + laborTasks sync on claim).
- **AI**: Client provider/key UI (x/Gemini/OpenAI/Anthropic). Backend supports xAI (via env `XAI_API_KEY` or per-request key). Backend now leverages uploaded image via reference (data URI for web uploads or http) using xAI image edits endpoint (/images/edits) for real visual understanding + realistic transformations (not just text prompt); significantly richer image-aware prompts direct model to analyze/preserve exact room structure, perspective, lighting etc. Client-side: dynamic material suggestions and cost estimates now much more detailed/realistic based on the actual AI prompt output + tweaks (room inference, style-matched SKUs, luxury multipliers, scope scaling).
- Cross-platform intent with web shims and .web.tsx files.

## Tech Stack

- React Native 0.85 + react-native-web + Vite (web on :3000)
- TypeScript, Zustand, Tailwind (web via PostCSS), StyleSheet (native)
- Express backend (simple AI proxy)
- Native camera: react-native-vision-camera (v4; permissions + integration + fallbacks implemented for iOS/Android; .web.tsx for solid upload/preview; cross-platform consistency fixes in Design Studio + worker dashboard)
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
- Native camera (`react-native-vision-camera`): permissions implemented (Info.plist + AndroidManifest.xml). CameraScreen.tsx (native) provides live preview + capture with solid fallbacks ("Use Demo Photo"). Web CameraScreen.web.tsx has improved UX (styled picker, live preview before commit, demo fallback, hidden input for clean trigger).
  - **Full native camera prep (Phase 1 notes)**:
    - Dep is present in package.json (react-native-vision-camera ^4.6.0).
    - Permissions: iOS Info.plist already includes `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`. Android AndroidManifest.xml has CAMERA + external storage (maxSdk).
    - iOS: After changes or first native run: `cd ios && bundle install && bundle exec pod install`. Then clean build (Xcode: Product > Clean Build Folder or `xcodebuild clean`).
    - Android: Rebuild after manifest changes (`./gradlew clean` in android/ or via RN CLI). May need to request runtime perms (handled via vision-camera hook).
    - Simulator note: Camera often unavailable or limited — always "Use Demo Photo" (or gallery) fallback is provided and documented. On real device, live preview/capture works.
    - Vite/Metro: web excludes vision-camera (see vite.config.js + .web.tsx split); native uses the .tsx impl.
    - No reanimated required for basic photo capture (only for advanced frame-processors).
    - After pod/gradle or dep changes: restart Metro, re-run app. Test camera via Design Studio "New Project".
  - URI consistency (data:/file:/https:/public): See src/shared/media.ts (normalizeImageUri + getImageSource). All <Image> sites (Design, Scoping, worker dashboard carousels, onboarding, sliders) now use it. data: for web uploads, file:// for native capture, /public paths (ai-*.jpg + test-images) and https for remote all handled. Demo/gallery fallbacks documented there (DEMO_IMAGE_PATHS).
- Worker dashboard + Design Studio now use consistent cross-platform photo UIs (RN ScrollView horizontal + Image everywhere; removed web-only Flickity + Platform conditionals + div/img). Uses shared media util.
- Backend calls from device/emulator need to target your dev machine's LAN IP (not localhost) or use a tunnel.
- After native changes: re-run pod install if iOS, clean/rebuild for Android. Typecheck + web build verified.

### Other commands

```sh
pnpm dev           # web (:3000) + backend (:4000) together
pnpm lint
pnpm typecheck     # tsc --noEmit --skipLibCheck (should be clean)
pnpm test          # unit tests (scheduler, scopeFromLabor); RN App.test separate
pnpm build:web
```

## Theming / Dark Mode (Phase 1)

- Simple foundation: `src/shared/theme.ts` exports light/dark Theme (colors, spacing, typography) + `useTheme()` hook (wraps RN useColorScheme).
- Applied to: App shell (tabs, headers), worker dashboard (cards, filters, banners), DesignStudio, Scoping, Sourcing, Scheduling/Labor (headers, cards, inputs, pills).
- Extracted reusable theme-aware patterns into shared/: `ProjectHero`, `ReadyToGoCostPill` (used in Design + Scoping), basic `AppButton`.
- Consistent padding/typography via theme values. No prop warnings (StyleSheet + theme-driven inlines). Light remains dominant default; dark propagates where useColorScheme flips.
- See DEVELOPMENT_PLAN.md for context.

## Project Structure

```
src/
  features/
    design/          # CameraScreen.tsx + CameraScreen.web.tsx (vision-camera native + solid web upload w/ preview+fallbacks), AIProviderSelector, DesignStudioScreen, BeforeAfterSlider, realImageGen (stub)
    labor/           # LaborSchedulerScreen + scheduler.ts (core logic)
    sourcing/        # SourcingScreen + types
    scoping/         # ScopingScreen (hero + scope tree + burndown)
  onboarding/
  shared/            # theme.ts, media.ts (URI), ReadyToGoCostPill, ProjectHero, AppButton, index.ts (Phase 1)
  navigation/        # AppNavigator.tsx (root Stack + Container), TabNavigator.tsx (bottom tabs: Design/Sourcing/Scoping/Scheduling + OwnerHeader + ProjectPipelineBar), types.ts (Tab/Root param lists), MainTabNavigator (compat shim). Phase 1+: react-navigation (Stack + Tabs), web + mobile.
  context/           # AppRoleContext (owner/worker role switch shared across header + App)
  features/worker/   # WorkerDashboardScreen (extracted from App.tsx; themed + getImageSource)
  store/             # useDeltaStore.ts (design -> sourcing -> labor)
  web-shims/
backend/server.js    # Express, /api/reimagine (xAI)
public/              # demo images (ai-room-*.jpg, test-images/before-after/*)
```

## Current Status

This is a functional prototype focused on the web experience (easiest to demo and iterate).

**Owner flow**: Onboarding (role selection + full-screen before/after hero) → Design Studio (photo + prompt + AI variations with tweaks + *prominent* cost estimates + breakdowns surfaced directly on cards, make-current summary, confirm-before-send total, dedicated Cost Summary panel, and pipeline with full est. project cost — "ready to go" transparency; for the Example Project the selected/approved design is shown first as hero) → Sourcing (approve items, totals, retailer links) → Scoping (the selected design is the hero; scope tree grouped by trade with points on every subtask; interactive SVG burndown line chart — ideal vs actual — trending to 0 points remaining using Scrum; complete subtasks live to drive the chart; sync to labor) → Scheduling (realistic schedules with breaks and $25/hr costing, now fed from scoped work). Top owner tabs: Sourcing / Scoping / Scheduling.

**Worker flow**: Dedicated dashboard showing interesting jobs with working trade filter (Carpentry, Electrical, Painting, Flooring, etc. — "All" shows everything; specific trade filters the list + owner live card), project photos that can be flicked through (cross-platform horizontal scroll on iOS/Android/Web), bullet-point task lists, and **estimated total cost** displayed directly on each job card ("ready to go"). Claim/assign buttons move jobs to a "My Assigned Jobs" section (persisted via store), integrate with owner-sourced items + generated laborTasks (shows live "Owner Project" card pulling from current store data when owner has approved sourcing/labor), and provide actual scheduling visibility (per-claimed-job auto-generated day-by-day schedule with breaks/costs using the shared scheduler logic). Unclaim supported; claiming also syncs tasks into labor state.

- `tsc --noEmit --skipLibCheck` is clean.
- Enhanced persistence: multi-project support (createProject/switchProject/getProjects/rename/delete/saveCurrent + auto current sync), project names/metadata, legacy migration; full state (approvedDesign + sourcingItems + laborTasks) saved per project. Optional backend save/load via store methods + /api/projects (see backend/server.js). Survives refresh on web via localStorage; improved AsyncStorage guidance.
- Content is constrained for desktop readability (max-width containers).
- See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the historical roadmap, completed work, and current remaining gaps. The plan is being actively reconciled with the actual state.

## Known Limitations

- AI generation now uses image references (when data URI or public URL provided from upload) + detailed visual analysis prompts for true image understanding and realistic remodel transformations (via xAI /images/edits path when ref available); pure text fallback for non-data cases. Cost est + material suggestions now much richer and directly derived from the reimagination's prompt/tweaks for better accuracy. (Still limited by model capabilities and demo data.)
- Persistence now supports multi-project history: create/switch/rename/delete/save projects with full design/sourcing/labor state + metadata (names, timestamps); client-side via Zustand (localStorage web) + explicit backend /api/projects routes (in-memory demo on server). Legacy single-project data auto-migrates on load. (AsyncStorage note improved for future native.)
- Native mobile camera (vision-camera) has permissions + basic integration complete; demo fallbacks ensure usable experience on device/simulator. Full turnkey still benefits from re-build after pod/gradle, and reanimated for advanced features (not needed for photo capture).
- Some demo data, alerts, and flows remain (rapid iteration); owner-side cost estimates are prominent/direct with breakdowns, summary panels, and confirm flows; sourcing suggestions are dynamic based on design prompt + tweaks.
- No real auth, multi-user, or production retailer APIs.
- Worker + Design Studio photos now consistent cross-platform (RN ScrollView carousels; no platform-specific codepaths). URI handling audited + normalized via shared/media.

See DEVELOPMENT_PLAN.md for a more detailed gap analysis and historical context.

## Contributing / Next

The project has moved beyond the original early phases.

Recent changes (Phase 2 polish):
- **Owner navigation complete**: Design Studio is now the first tab (🎨 Design). Owner header with project switcher (multi-project UI + backend cloud save/load), pipeline progress bar (Design→Sourcing→Scoping→Scheduling), and role switch.
- **Worker dashboard extracted**: `WorkerDashboardScreen` with theme + `getImageSource` (App.tsx slimmed).
- **Backend**: `/api/health` endpoint; shared `apiUrl()` config; `pnpm dev` runs web+backend.
- **Scoping**: Live scope tree derived from `laborTasks` when present (falls back to demo tree).
- **Tests**: Scheduler + scopeFromLabor unit tests (jest unit project).

Recent changes (Phase 1):
- Camera + media: URI consistency (data:/file:/public paths) audited + enforced via shared/media + getImageSource across all Image usages (Design, Scoping, worker dashboard carousels, etc.). Gallery/demo fallbacks documented ("Use Demo" paths).
- Native camera prep: Expanded notes in README + DEVELOPMENT_PLAN with exact pod install, manifest, simulator, rebuild steps.
- Theming/Consistency: src/shared/ populated (theme.ts with useTheme + light/dark, media.ts, ReadyToGoCostPill, ProjectHero, AppButton). Dark mode propagated (App shell + worker, Design/Scoping/Sourcing/Scheduling headers/cards using theme colors/padding/typo). Extracted patterns reused in Design + Scoping. Consistent with existing carousels/heroes.
- Navigation: Proper react-navigation v6+/v7 (native + bottom-tabs + native-stack + screens + safe-area). Clean structure per Phase 1 request: src/navigation/AppNavigator.tsx (root Native Stack + NavigationContainer), TabNavigator.tsx (typed Bottom Tabs: 🛒 Sourcing / 📐 Scoping default / 📅 Scheduling), types.ts (TabParamList + RootStackParamList). All crude button/tabBar + selectedTab state/conditionals removed from App.tsx (owner now <AppNavigator />). Worker dashboard + filters untouched. Web (Vite/RNW) + mobile seamless; vite.config tuned (optimize/externals); pnpm typecheck clean. Servers verified post-edit.
- Docs updated; pnpm typecheck clean; commit per spec.

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for the full historical roadmap, completed work, and current priorities (reconciled against this README).

PRs welcome. When making changes, please help keep both README.md and DEVELOPMENT_PLAN.md in sync.

## License

TBD (prototype).

---

Built with React Native, Vite, and a bit of imagination.
