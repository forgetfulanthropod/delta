# Delta Development Plan

**Project**: Delta — AI-powered home remodeling assistant  
**Tagline**: "Remodel your space with AI."  
**Platforms**: React Native (iOS/Android) + Web (react-native-web + Vite)

> **Note**: This document is largely historical. It was used as a living working document during early development. Many original gaps have been addressed. For the most accurate current state, see [README.md](./README.md).

**Current Status (reconciled with README)**:
- Functional web prototype with a complete owner flow (Design → Sourcing → Labor) and a significantly improved worker experience.
- Key recent improvements: Worker dashboard with trade-based filtering, project photos that can be flicked through (Flickity on web), and **estimated total cost shown directly on job cards** ("ready to go") instead of routing through "send to sourcing".
- Desktop UI uses content-width constraints (max ~720px) for better readability.
- Basic persistence via Zustand (localStorage on web).
- `pnpm typecheck` is clean.
- See README.md "Known Limitations" and the "Remaining Work" section below for what is still outstanding.

**Servers**:
- Web: http://localhost:3000 (`pnpm web`)
- Backend: http://localhost:4000 (`cd backend && node server.js`)

**Tested flows**: Owner full path and Worker job browsing + interest/cost claiming on web.

---

## Historical Note: Original README Gaps (as of early development)

**This section is historical.** The README.md has since been fully rewritten with project-specific content, run instructions, features, limitations, and links to this plan. The original gaps listed below have largely been addressed.

(Original text from early audit preserved for context — many items are now complete or evolved.)

### (Historical) Critical missing content at the time:
... [content summarized as already resolved in current README] ...

See the current README.md for the accurate project description.

---

## Remaining Work & Priorities (Current)

Pulled from the README "Known Limitations" and recent development:

- **AI**: Still largely prompt-driven. Improve image understanding / vision model usage for better material suggestions and more accurate reimaginings.
- **Persistence & Data**: Basic web persistence exists. Add proper project history, backend storage, and multi-project support.
- **Native**: Vision-camera and full mobile experience still need significant work (permissions, builds, testing).
- **Worker Experience**: Recently enhanced with trade filter, Flickity photo carousels, and direct estimated costs ("ready to go"). Continue polishing (e.g., actual claiming flow, integration with owner-sourced data).
- **Owner Flow Polish**: Estimated costs in worker side are good; consider surfacing similar ready-to-go cost views on owner side instead of (or in addition to) "Send to Sourcing".
- **Other**: Real auth, retailer integrations, better empty/error states, full native camera, production deployment.

See the historical audit below for the original long list of issues (many of which have been resolved).

---

## Historical: Current State Analysis & Gaps (from early code audit + `tsc --noEmit`)

### Working / Implemented
- Onboarding role selection (owner/worker) — gates the tabs.
- Basic tab navigation (crude Buttons in App.tsx).
- Design Studio: photo capture/upload (web file input works; native vision-camera declared but broken), prompt input, reimagine button (calls backend or falls back to 3 static ai-room jpgs), versions list, before/after demo sliders (nice PanResponder + auto-animate, 3 examples), "Send to Sourcing" (populates store + hardcoded 3 items + extra backend call).
- Sourcing: renders store items, toggle approve (visual), total calc, "Submit" (just alert), "Generate Labor Schedule" (derives tasks from approved, calls store).
- Labor: demo/manual task input or from store, calls scheduler, renders day cards with times, productive/break split, half-day progress, costs.
- Scheduler logic (`labor/scheduler.ts`): solid largest-first packing, 8h days, 1h total breaks (45m lunch + 2x15m), $200/day default ($25/hr guaranteed), summary.
- Backend: simple Express + CORS, /api/reimagine that calls x.ai (grok-imagine-image-quality) if env key present, else echoes + message. Tested working.
- Zustand store: basic approvedDesign + sourcingItems + laborTasks wiring.
- Web entry (index.web.js + vite alias to react-native-web), some shims.
- Assets and some polished UI bits (colors #FF385C accent, nice typography).

### Major Gaps & Bugs (TS + runtime)
- **Many TypeScript errors** (run `npx tsc --noEmit --skipLibCheck`):
  - `className` prop used on RN `<View>`/`<Text>`/`<TouchableOpacity>` in `SourcingScreen.tsx` and `LaborSchedulerScreen.tsx` (no NativeWind or equivalent; RN types reject it).
  - Missing imports: `TouchableOpacity` (Sourcing + Labor), `Button` (DesignStudioScreen), `alert` (treated as global but strict TS fails in several places).
  - Web-only DOM: `<select>` + onChange in AIProviderSelector (not RN), `event.target.files` and `marginVertical` style in CameraScreen.web (lib "dom" not included).
  - `NodeJS` namespace for timer ref in BeforeAfterSlider.
  - `react-native-vision-camera` module not found (no dep, no types).
- **Missing dependency**: `react-native-vision-camera` (and likely its peer/setup). Native CameraScreen will fail to import/run on device/emulator. Vite config already tries to external/exclude it.
- **Styling inconsistency & broken on web**:
  - No `postcss.config.js` (or equivalent in vite.config). `@tailwind` directives in src/index.css are likely not processed → utility classes do nothing.
  - Sourcing/Labor will look broken/unstyled on web; Design is mostly StyleSheet so ok.
  - Mixed className + StyleSheet + inline.
- **AI integration incomplete / misleading**:
  - AIProviderSelector saves provider + key in local component state and calls onProviderChange, but:
    - Backend (`server.js`) destructures **only** `{imageUri, prompt}` — ignores provider and apiKey entirely.
    - Backend always uses `process.env.XAI_API_KEY` or fallback. No multi-provider support, no passthrough of client key.
    - Client reimagine always POSTs provider+key, but they are unused.
    - sendToSourcing also calls the endpoint (unnecessarily).
  - Generation is **text prompt only** — uploaded image URI is sent but not used for vision/img2img (backend prompt ignores the image content).
  - realImageGen.ts is an unused stub.
  - No error states, loading beyond basic isGenerating, rate limits, or quota handling.
- **UI/UX incomplete**:
  - "Use this version" button inside versions list: `/* TODO: set as current */` — no-op.
  - Tweaks UI (style/color/layout) is static state, never fed into prompt or saved meaningfully.
  - No selected "current" design highlight.
  - Alerts everywhere instead of toasts/modals/snackbars.
  - No loading skeletons, empty states, error boundaries.
  - Crude top button tabs (no icons, no persistence of tab on role change, no back nav).
  - src/navigation/ and src/shared/ are empty directories.
  - Worker role: onboarding only; no actual UI or jobs list.
- **Web shims incomplete**:
  - `src/web-shims/react-native-safe-area-context.js` imports non-existent `./useSafeAreaInsets`.
  - SafeAreaProvider is used in App but may not behave correctly on web.
- **No persistence**: Full refresh loses everything (store is in-memory). No localStorage, no backend save/load.
- **Hardcoded / sample data**: Sourcing items always the same 3 when sending design. Labor demo text. No dynamic pricing, catalogs, or retailer deep links.
- **Mobile / native readiness low**:
  - Camera requires vision-camera install + native config (Info.plist, AndroidManifest, pod, gradle, permissions at runtime).
  - No Metro issues tested here; iOS/Android builds would surface more (e.g. new arch? RN 0.85 is recent).
  - Gemfile + Podfile present but un-run in this env.
- **Other DX / code quality**:
  - App.tsx has old sample comment header.
  - Inconsistent formatting (some tailwind-like classes even in comments).
  - No real error handling around fetch.
  - Backend has no validation, no image upload handling (relies on client URI which can be data: or file: — xAI call doesn't send image bytes).
  - Tests: only default App.test.
  - No .env.example, no scripts for "dev:all" (both servers).
  - Vite port 3000, backend 4000 — mobile would need LAN IP or tunnel for localhost fetch.
- **Security / prod**:
  - API keys in client (even if not wired) is bad pattern.
  - No auth, no user/project model.
  - No rate limiting on backend.

**Overall**: ~40-50% of a v0.1 demo. Web "owner" flow can be clicked through with fallbacks and some visual breakage. Native not runnable without fixes.

---

## Development Roadmap

Prioritize making the **web experience solid first** (fast feedback, no native setup). Then layer native, real AI, persistence, and polish. Use GitHub issues/PRs for tracking.

### Phase 0: Make It Usable (Stabilize Prototype) — Highest Priority
Goal: `pnpm web` + backend = clean, working end-to-end demo on web with no console/TS errors for the main owner flow. Update docs.

- [ ] Replace README.md with project-specific content (see "missing" section above). Add badges, quickstart for web+backend, screenshots from public/test-images.
- [ ] Create this DEVELOPMENT_PLAN.md (done) + link it.
- [ ] Fix all TypeScript errors:
  - Add proper imports (Button, TouchableOpacity, Alert from react-native; use `Alert.alert`).
  - Remove or conditionally render className (or adopt a solution — see Phase 1).
  - Fix web DOM types (either `/// <reference lib="dom" />` in .web.tsx or "types": ["react", "react-native-web"] strategy, or separate tsconfig for web).
  - Fix BeforeAfterSlider NodeJS.Timer.
  - Add `@types` or declare for missing.
- [ ] Add missing `react-native-vision-camera`? (or stub for now — see below).
- [ ] Fix web shims (create the missing useSafeAreaInsets or simplify).
- [ ] Add postcss.config.js (or inline in vite.config) so Tailwind processes:
  ```js
  // postcss.config.js
  module.exports = {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```
  Then verify classes render on Sourcing/Labor.
- [ ] Make AIProviderSelector RN-compatible (replace <select> with Touchable segments or a modal list; keep web ok via Platform).
- [ ] Wire (or stub) the client provider/key to backend. For v0, either:
  - Make backend accept + use a provided key (for xAI), or
  - Focus only on xAI for now and hide other providers, or
  - Document "keys are client-only for future".
- [ ] Implement the TODO "Use this version" (set as current in local state or store; highlight it; perhaps re-send or edit prompt from it).
- [ ] Quick wins: replace raw `alert()` with a cross-platform Alert or custom modal. Add basic isGenerating / disabled states. Better empty states ("No items yet — send a design from Design tab").
- [ ] Add a root "dev" script or package.json "dev": "concurrently ..." (need concurrently dep or just docs for two terminals).
- [ ] Test full flow in browser after fixes. Add a simple e2e note or playwright later.
- [ ] Run `pnpm lint` / fix formatting. Ensure `pnpm test` still passes.

**Exit criteria**: `tsc --noEmit` clean (or only expected web/native differences), no runtime errors in console for owner flow on web, README accurate, app looks decent (Tailwind working).

**Effort estimate**: 1-3 days (mostly fixes + doc).

### Phase 1: Consistent Cross-Platform & UX Foundation
- Decide on styling strategy (critical):
  - Option A (recommended for speed): Standardize on React Native StyleSheet + a few shared constants. Remove all className from RN components. Keep Tailwind only for pure web parts if desired (or drop).
  - Option B: Add NativeWind (or @tailwindcss/react-native, or react-native-tailwindcss) + configure for both RN and web. Update all screens. More powerful long-term but adds deps/config.
- Replace crude tabs with real navigation:
  - Option: `@react-navigation/native` + bottom tabs (or material). Works on web too with react-native-web.
  - Keep simple stack + tab for now.
  - Populate src/navigation/.
- Make Camera work on web (already decent) + prepare for native:
  - Add `react-native-vision-camera` to package.json + peer deps (react-native-reanimated, etc. often required).
  - Document or script the native steps (Info.plist NSPhotoLibraryUsage etc., pod install, gradle).
  - Add fallback "pick from gallery" using react-native-image-picker or expo-image-picker (lighter?).
  - Handle file:// vs https vs data: URIs consistently (perhaps upload to backend or convert).
- Improve Design Studio:
  - Feed tweaks into the prompt sent to AI (e.g. append "in ${style} style with ${colors} palette, ${layout} layout").
  - Allow editing a version's prompt/tweaks and re-generate.
  - Persist versions per "project" in store (or simple localStorage hook).
- Make Sourcing & Labor use consistent components (extract shared cards, buttons, lists into src/shared/).
- Add basic theming / dark mode support (currently light only; RN has useColorScheme).
- Worker role placeholder screens (list of jobs, claim task, schedule view).

**Exit**: One consistent UI that looks good on web + renders without prop warnings on native. Navigation feels native.

**Effort**: 3-7 days.

**Phase 1 Status (this slice)**: 
- Camera/Media: URI handling audited + made consistent via new `src/shared/media.ts` (normalizeImageUri, getImageSource, DEMO paths documented). All Image sites (DesignStudio, Scoping, worker dashboard in App, Onboarding, BeforeAfter, Camera.web preview) updated. data: (web uploads), file: (native capture), /public paths, https supported without breakage to RN ScrollView carousels/heroes.
- Gallery fallback: Enhanced via shared DEMO_IMAGE_PATHS; "Use Demo Photo" paths now referenced from shared in Camera*.tsx/.web.tsx + comments. Documented in media.ts.
- Native camera prep: Expanded clear steps in README.md ("Mobile notes") + here (see below) + DEVELOPMENT_PLAN. Info.plist/AndroidManifest already good; no new shims needed beyond existing web-shims (vision-camera excluded in vite for web). Added comments in CameraScreen.tsx.
- Theming + Consistency: 
  - Created `src/shared/theme.ts`: useColorScheme + full Theme (colors for light/dark, spacing, typography) + useTheme() + createThemedStyles helper.
  - Populated `src/shared/`: index.ts, theme.ts, media.ts, ReadyToGoCostPill.tsx (extracted), ProjectHero.tsx (extracted), AppButton.tsx (theme-aware). 
  - Propagated: App shell (tabBar, headers, worker view), DesignStudioScreen, ScopingScreen, SourcingScreen, LaborSchedulerScreen (headers, cards, inputs, lists, cost areas use t.colors + consistent padding/typo). Worker cards/filters/banners themed. No className/prop warnings.
  - Extracted & reused: ReadyToGoCostPill + ProjectHero in **Design + Scoping** (and cost pill bonus in Scoping). Builds on good state.
- Docs: README + this file updated with Phase 1 details, native notes, theming section.
- Verified: pnpm typecheck clean post changes. Commit: "feat(phase1): camera URI consistency + native notes + theming/dark mode foundation + shared patterns".
- No breakage to existing photo carousels (RN ScrollView horizontal), selected design hero, burndown, constrained layouts.

**Native camera prep details (for Phase 1 / future native runs)**:
- `react-native-vision-camera` already in package.json + node_modules.
- iOS: `cd ios && bundle install && bundle exec pod install`. Permissions pre-added (NSCameraUsageDescription, NSPhotoLibraryUsageDescription in Info.plist; NSAllowsLocalNetworking for backend).
- Android: Permissions in AndroidManifest.xml (CAMERA + READ/WRITE_EXTERNAL limited). Rebuild with gradle clean if needed.
- Simulator: Expect fallback to "Demo" (camera device often missing). useCameraPermission + useCameraDevice hooks in CameraScreen.tsx.
- Rebuild/restart Metro after pod/gradle or adding vision-camera peers if using advanced features.
- Web: .web.tsx + vite optimizeDeps/build external handles split (no native camera on web).
- Test: Use Design Studio "New Project" or "Example"; "Demo" always available.

### Phase 2: Real AI, Backend Hardening, Image Understanding
- Backend upgrades:
  - Support multiple providers (at minimum xAI + one other, e.g. OpenAI DALL-E or Replicate, or Gemini). Accept apiKey from body when provided (but warn it's for demo only; recommend env).
  - Actually use the source image: many image models support image references / inpainting / img2img. Update prompt construction or pass image in the request to the model API if supported. (Current grok-imagine call is text-only.)
  - Add proper error responses, logging, simple caching of results (by hash of image+prompt?).
  - Optional: store generations temporarily, return metadata.
  - Add health check / version endpoint.
  - Consider moving to a real framework or serverless later (but keep simple Express for now).
- Client: 

... (rest of historical plan preserved; see original for full Phase 2+)

**Exit**: Real AI images (with key) that meaningfully transform the uploaded photo (not just random room). Multi-provider at least partially works.

**Effort**: 4-8 days (depends on how many providers + whether models support image input).

### Phase 3: Data, Persistence, Full Features
... (historical; see prior for details)

### Phase 4: Native Polish, Production Readiness, Scale
... (historical)

### Phase 5: Growth / Advanced (Future)
... (historical)

---

## Immediate Next Steps (Recommended Order)

1. Open http://localhost:3000 and click through the full owner flow. Note every visual/functional broken thing (screenshots help).
2. Run `npx tsc --noEmit --skipLibCheck` and fix the errors one file at a time (start with imports + className).
3. Add postcss.config.js + verify Tailwind.
4. Update/fix AI wiring or simplify provider UI to xAI-only for v0.
5. Implement the one TODO button.
6. Write new README + keep this PLAN updated.
7. Decide styling approach (quick: nuke className; ambitious: integrate NativeWind).
8. Install vision-camera (or comment out native camera and always use web upload shim for now).
9. Add basic persistence (zustand persist).
10. Add "dev" convenience (concurrently or just docs + two terminals).

After Phase 0, reassess and slice the rest into GitHub issues.

---

## Non-Functional / Process
- **Branching**: main, feature/ branches. PRs required.
- **Commits**: conventional or clear.
- **Reviews**: at least one.
- **Tracking**: Use this plan + issues. Update plan when realities change.
- **Metrics for success**: Time to first "I remodeled my living room in the demo" happy path < 2 min. Zero console errors on web demo. Clear README for a new dev to run in <5 min.
- **Risks**: Native camera is notoriously fiddly (permissions, builds, new arch compatibility). De-risk by keeping strong web path + file upload always available. AI costs (image gen) — use fallbacks + user-provided keys.
- **Dependencies to evaluate**: react-navigation, date libs for labor, image libs, form libs, etc. Add sparingly.

---

**Status**: This plan created after firing up the servers, full code read, tsc audit, backend test, and feature walkthrough.

### Historical Phase Status Notes

The sections below were written as work progressed against the *original* plan. Many items (TS fixes, styling consistency, basic persistence, README rewrite, worker dashboard foundations, AI prompt improvements, etc.) have been addressed.

**However**, the blanket "COMPLETED" framing is now outdated. The project has evolved, and significant work remains (see the "Remaining Work & Priorities" section near the top of this document and the "Known Limitations" in README.md).

**Phase 1 (Camera + cross-platform media + Theming/Consistency) completed in this slice** (see details above + README updates). 
- All Phase 1 task items for this combined subagent addressed: inspections first, URI audit + media util + Images updated across screens, fallbacks documented, native prep docs + comments, shared populated, theme + useColorScheme propagated to App/Design/Scoping/Sourcing/Scheduling + worker, extracts (CostPill + ProjectHero) reused in Design+Scoping, consistent padding/typo/no warnings, docs updated, typecheck + commit done.

Next agents/priorities: continue with other Phase slices (e.g. navigation, AI wiring, full tests).
