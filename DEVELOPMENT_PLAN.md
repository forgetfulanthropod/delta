# Delta Development Plan

**Project**: Delta — AI-powered home remodeling assistant  
**Tagline**: *Remodel your space with AI.*  
**Platforms**: React Native (iOS/Android) + Web (react-native-web + Vite)

> **How to read this document**  
> This plan is the living product publication for Delta. [README.md](./README.md) is the source of truth for the current prototype state — features, tech stack, run instructions, and known limitations. We keep both files in sync. Contributions welcome; when you change the product, please update both.

**Quick links**: [Run the demo](./README.md#getting-started) · [Current status](#current-state) · [Key initiatives](#current-priorities--key-initiatives) · [Non-goals](#non-goals--assumptions)

---

## Mission

Help homeowners see, cost, and plan a remodel before anyone swings a hammer — and give skilled workers a clear path to the jobs that fit their trade.

## Vision

A remodeling experience that feels as approachable as browsing inspiration, as transparent as a written estimate, and as organized as a well-run job site — on any device.

## Goal

Ship a credible end-to-end prototype: owners move from photo → AI design → sourced materials → scoped work → scheduled labor with **ready-to-go** cost visibility at every step; workers discover, filter, claim, and schedule real jobs from that same data.

## Strategy

1. **Web-first iteration** — fastest feedback loop for demos, design review, and e2e tests.
2. **One shared data spine** — Zustand flows approved design → sourcing items → labor tasks; worker claims augment the same store.
3. **Transparency by default** — cost estimates, breakdowns, and pipeline progress surface early, not after commitment.
4. **Cross-platform without forks** — shared theme, media utilities, and RN components; `.web.tsx` only where the platform truly differs (camera, file upload).

## Strategic Pillars

These are the bets that define Delta. Every initiative below should trace back to at least one pillar.

| Pillar | What it means in Delta |
|--------|------------------------|
| **Design with confidence** | AI reimagination grounded in the owner's actual room; variations with prominent, actionable cost estimates. |
| **Source to scope** | Approved designs become retailer-linked sourcing lists, then trade-broken scope trees with Scrum-style burndown. |
| **Schedule realistically** | Day-by-day labor plans with breaks, half-day progress, and guaranteed $25/hr costing. |
| **Worker-ready handoff** | Trade filters, claim/unclaim, owner-sourced live cards, and scheduling visibility on claimed jobs. |
| **Multi-project persistence** | Create, switch, rename, delete, and cloud-save projects without losing design → sourcing → labor state. |

---

## Current State

*Verbatim sections below are copied from [README.md](./README.md) and reconciled on each plan refresh. Narrative sections above (Mission through Strategic Pillars) interpret this state for planning — they do not replace it.*

Delta is a cross-platform (React Native + Web) prototype for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

- **Web (easiest demo)**: http://localhost:3000 after `pnpm web`
- **Backend** (for real AI image gen): `cd backend && node server.js` (port 4000)
- Full owner flow: Onboarding → **Design** tab (Design Studio: camera/upload + prompt + AI + prominent ready-to-go cost estimates...) → Sourcing → Scoping (selected design hero + trade-broken scope tree with story points per subtask + live Scrum burndown SVG line chart trending to 0 remaining points; scope syncs from labor tasks when available) → Scheduling (auto day-by-day with breaks & $25/hr costing). Owner header includes **project switcher** (multi-project create/switch/rename/delete + backend cloud sync) and pipeline progress bar.

### Features (current prototype)

- **Design Studio**: Camera (solid web upload w/ preview+demo fallback via .web.tsx; native vision-camera live + capture + fallbacks + permissions via .tsx), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after comparison sliders, multiple versions with *prominent* direct project cost estimates (materials + labor "ready to go" in highlighted pills on every card), make-current now surfaces detailed cost summary in alert + dedicated owner Cost Summary panel (breakdown + total) appears when version approved, "Send to Sourcing" evolved to cost confirmation dialog showing/locking total upfront before handoff, improved pipeline status now always includes full est. project cost + breakdowns for transparency. Owner costs feel "ready to go" across the journey. (Native/cross-platform camera consistency advanced.)
- **Sourcing**: Dynamic list from designs, approve items from Lowe's/Amazon/Home Depot, running total, generate labor tasks.
- **Scoping**: For the selected/approved design (hero image shown first): full scope tree broken up by trade (Carpentry, Electrical, Painting, Flooring, Demolition, Plumbing etc.) with story points assigned to every subtask. Interactive Scrum burndown chart (SVG line chart) showing progress vs. ideal plan, trending to 0 points remaining. Complete subtasks to burn down live; sync scope items to labor tasks. Ties design → execution with Scrum project management visuals.
- **Scheduling** (formerly Labor): 8-hour days, built-in breaks (lunch + short), largest-first packing, per-day breakdown with start/end times, half-day progress, $25/hr guaranteed costing. Driven from scoped work.
- **Worker Experience**: Trade filters, cross-platform scrollable per-project photo carousels (iOS/Android/Web), direct est. costs shown as "ready to go". Full claim/assign flows that update Zustand state (jobs move to "My Assigned Jobs"), owner-sourced data integration (live cards pulling sourcingItems + laborTasks for relevant tasks/costs), scheduling visibility for claimed jobs (day schedules with breaks/costs using the shared scheduler logic). Unclaim supported; claiming also syncs tasks into labor state.
- **State**: Zustand store flows approved design → sourcing items → labor tasks. Worker claims augment the shared store (assignedJobs + laborTasks sync on claim).
- **AI**: Client provider/key UI (x/Gemini/OpenAI/Anthropic). Backend supports xAI (via env `XAI_API_KEY` or per-request key). Backend now leverages uploaded image via reference (data URI for web uploads or http) using xAI image edits endpoint (/images/edits) for real visual understanding + realistic transformations (not just text prompt); significantly richer image-aware prompts direct model to analyze/preserve exact room structure, perspective, lighting etc. Client-side: dynamic material suggestions and cost estimates now much more detailed/realistic based on the actual AI prompt output + tweaks (room inference, style-matched SKUs, luxury multipliers, scope scaling).
- Cross-platform intent with web shims and .web.tsx files.

### Tech Stack

- React Native 0.85 + react-native-web + Vite (web on :3000)
- TypeScript, Zustand, Tailwind (web via PostCSS), StyleSheet (native)
- Express backend (simple AI proxy)
- Native camera: react-native-vision-camera (v4; permissions + integration + fallbacks implemented for iOS/Android; .web.tsx for solid upload/preview; cross-platform consistency fixes in Design Studio + worker dashboard)
- Enhanced persistence (Zustand multi-project with history/save/load + names/metadata; still uses localStorage on web for designs/sourcing/labor state; optional backend routes for cross-session/demo cloud save)

### Project Structure

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
backend/server.js    # Express, /api/analyze (describeimages), /api/reimagine (xAI)
public/              # demo images (ai-room-*.jpg, test-images/before-after/*)
```

### Current Status

This is a functional prototype focused on the web experience (easiest to demo and iterate).

**Owner flow**: Onboarding (role selection + full-screen before/after hero) → **Design** tab (Design Studio: photo + prompt + AI variations with tweaks + *prominent* cost estimates + breakdowns surfaced directly on cards, make-current summary, confirm-before-send total, dedicated Cost Summary panel, and pipeline with full est. project cost — "ready to go" transparency; for the Example Project the selected/approved design is shown first as hero) → Sourcing (approve items, totals, retailer links) → Scoping (the selected design is the hero; scope tree grouped by trade with points on every subtask; interactive SVG burndown line chart — ideal vs actual — trending to 0 points remaining using Scrum; complete subtasks live to drive the chart; **burndown progress persists per project**; sync to labor) → Scheduling (realistic schedules with breaks and $25/hr costing, **auto-generated when labor tasks exist**). Top owner tabs: **Design** / Sourcing / Scoping / Scheduling (+ project switcher header).

**Worker flow**: Dedicated dashboard showing interesting jobs with working trade filter (Carpentry, Electrical, Painting, Flooring, etc. — "All" shows everything; specific trade filters the list + owner live card), project photos that can be flicked through (cross-platform horizontal scroll on iOS/Android/Web), bullet-point task lists, and **estimated total cost** displayed directly on each job card ("ready to go"). Claim/assign buttons move jobs to a "My Assigned Jobs" section (persisted via store), integrate with owner-sourced items + generated laborTasks (shows live "Owner Project" card pulling from current store data when owner has approved sourcing/labor), and provide actual scheduling visibility (per-claimed-job auto-generated day-by-day schedule with breaks/costs using the shared scheduler logic). Unclaim supported; claiming also syncs tasks into labor state.

- `tsc --noEmit --skipLibCheck` is clean.
- Enhanced persistence: multi-project support (createProject/switchProject/getProjects/rename/delete/saveCurrent + auto current sync), project names/metadata, legacy migration; full state (approvedDesign + sourcingItems + laborTasks) saved per project. Optional backend save/load via store methods + /api/projects (see backend/server.js). Survives refresh on web via localStorage; improved AsyncStorage guidance.
- Content is constrained for desktop readability (max-width containers).

### Known Limitations

- AI generation now uses image references (when data URI or public URL provided from upload) + detailed visual analysis prompts for true image understanding and realistic remodel transformations (via xAI /images/edits path when ref available); pure text fallback for non-data cases. Cost est + material suggestions now much richer and directly derived from the reimagination's prompt/tweaks for better accuracy. (Still limited by model capabilities and demo data.)
- Persistence now supports multi-project history: create/switch/rename/delete/save projects with full design/sourcing/labor state + metadata (names, timestamps); client-side via Zustand (localStorage web) + explicit backend /api/projects routes (in-memory demo on server). Legacy single-project data auto-migrates on load. (AsyncStorage note improved for future native.)
- Native mobile camera (vision-camera) has permissions + basic integration complete; demo fallbacks ensure usable experience on device/simulator. Full turnkey still benefits from re-build after pod/gradle, and reanimated for advanced features (not needed for photo capture).
- Some demo data, alerts, and flows remain (rapid iteration); owner-side cost estimates are prominent/direct with breakdowns, summary panels, and confirm flows; sourcing suggestions are dynamic based on design prompt + tweaks.
- No real auth, multi-user, or production retailer APIs.
- Worker + Design Studio photos now consistent cross-platform (RN ScrollView carousels; no platform-specific codepaths). URI handling audited + normalized via shared/media.

### E2E testing (playwrong)

[playwrong](https://github.com/qpwo/playwrong.git) is vendored as `tools/playwrong` (git submodule). It runs a real Chromium window in Xvfb and only passes clicks a user could actually make (visible, uncovered, enabled targets).

```sh
git submodule update --init tools/playwrong
pnpm setup:playwrong   # builds native mydotool (gcc) or Python fallback; installs e2e venv deps
pnpm test:e2e          # builds web, starts preview + backend :4000, runs e2e/
pnpm describe:image public/test-images/before-after/before-1.jpg  # Gemini caption via ~/bin/describeimages
```

Tests live in `e2e/`:

| Test | Coverage |
|------|----------|
| `test_backend_health.py` | `/api/health` routes (analyze, reimagine, projects, purchases) |
| `test_onboarding.py` | Landing hero, owner/worker CTAs, owner → Design Studio |
| `test_owner_example.py` | Oak Street House example load + cost pills |
| `test_owner_pipeline.py` | Full owner flow: pipeline tabs, sourcing submit purchases, scoping burndown, scheduling |
| `test_owner_role_switch.py` | Owner/worker "Switch role" returns to onboarding |
| `test_project_switcher.py` | Create project + save to cloud backend |
| `test_owner_worker_integration.py` | Owner example data visible on worker dashboard |
| `test_worker_dashboard.py` | Worker onboarding, trade filter, claim job → assigned |

Key UI hooks use `testID` → `data-testid` on web. Clicks use playwrong's visible-target query; CI sets `PLAYWRONG_PHYSICAL_CLICK=1` for real pointer input when native `mydotool` is built.

**Vision captions:** `/api/analyze` shells out to `~/bin/describeimages` (Gemini via `GEMINI_API_KEY` in `~/.halp.env`) when an `imageUri` is present. Override with `DESCRIBE_IMAGES_BIN`. `/api/health` reports `hasDescribeImages`.

For full run commands and mobile setup notes, see [README.md](./README.md#getting-started).

### Servers

| Service | URL | Command |
|---------|-----|---------|
| Web | http://localhost:3000 | `pnpm web` |
| Backend | http://localhost:4000 | `cd backend && node server.js` or `pnpm dev:backend` |
| Both | — | `pnpm dev` |

---

## Owners & Workers

Delta serves two primary audiences. We design and prioritize for both — not as an afterthought.

### Owners (homeowners)

**Jobs to be done**: "I want to see what my room could look like, understand what it costs, and know what happens next."

- Upload or capture a room photo.
- Reimagine with AI; compare versions; pick a direction.
- See **ready-to-go** cost estimates on cards, in summaries, and in the pipeline — materials + labor, with breakdowns.
- Approve sourcing items and watch totals update.
- Break work into trades, burn down scope with Scrum visuals, sync to labor.
- Get a realistic schedule with breaks and hourly costing.
- Manage **multiple projects** (switch, rename, save to cloud).

### Workers (skilled trades)

**Jobs to be done**: "I want to find jobs that match my trade, understand the scope and pay, and claim work I can schedule."

- Filter by trade (Carpentry, Electrical, Painting, Flooring, etc.) or browse all.
- Scroll project photos on any platform.
- Read task lists and **ready-to-go** total cost on each card.
- Claim jobs → assigned section with owner-sourced items and labor tasks.
- View auto-generated day schedules (breaks + costs) for claimed work.
- Unclaim when needed; claims sync back into shared labor state.

---

## Current Priorities & Key Initiatives

These are the **focused bets** for what comes next. Each initiative follows the W-framework: problem/opportunity, hypothesis, strategy, projects, timeline/impact, resources, and risks.

### Initiative 1: Production-grade persistence & identity

**Problem & opportunity**  
Today, persistence is demo-grade: localStorage on web and an in-memory backend. Owners who switch devices or refresh during a long remodel session risk losing work — blocking any credible beta.

**Hypothesis**  
If we add durable backend storage, native AsyncStorage, and lightweight auth, then users will complete multi-session remodel flows without data loss, because project state survives refresh, device switch, and cloud save.

**Strategy**  
Move from demo persistence to something a real user could trust across sessions and devices.

**Projects**
- Native AsyncStorage integration with the existing multi-project Zustand store.
- Harden `/api/projects` beyond in-memory demo (durable storage, error handling).
- Introduce basic auth (even email magic-link or simple token) before multi-user features.

**Timeline & impact**  
Medium horizon (weeks). Unlocks reliable mobile use and shared project state — prerequisite for any beta.

**Resources**  
Backend storage choice (SQLite, Postgres, or managed KV); auth provider evaluation; migration path from localStorage.

**Risks**  
Scope creep into full account management; mitigate by shipping read/write persistence first, auth second.

---

### Initiative 2: AI depth — room understanding & estimate accuracy

**Problem & opportunity**  
Ready-to-go cost pills are prominent, but estimates can still feel disconnected from the owner's actual room when vision analysis is shallow. That erodes trust right when owners decide to source materials.

**Hypothesis**  
If we add room-type vision analysis (`/api/analyze`) and richer SKU matching from prompt + tweaks, then owners will trust ready-to-go estimates enough to proceed to sourcing, because numbers tie to visible room features and selected materials.

**Strategy**  
Close the gap between "impressive demo" and "I trust this number" by grounding generation and costing in the actual room.

**Projects**
- Room-type vision analysis via `/api/analyze` (describeimages / Gemini path when available).
- Richer material SKU matching from prompt + tweaks output.
- Clearer error/loading states when keys or models are unavailable.

**Timeline & impact**  
Near term (days–weeks). Directly strengthens the **Design with confidence** pillar and owner conversion in demos.

**Resources**  
xAI key for image edits; optional `GEMINI_API_KEY` for captions; backend prompt engineering time.

**Risks**  
Model cost and latency; mitigate with fallbacks (bundled demo images) already in place.

---

### Initiative 3: Native mobile polish & device QA

**Problem & opportunity**  
Web demos prove the flow, but remodel work happens on-site. Without device QA, we cannot claim parity for camera capture, carousels, or LAN backend calls on iOS/Android.

**Hypothesis**  
If we pass device QA on vision-camera capture and LAN backend connectivity, then field demos on iOS/Android will match web fidelity, because native capture and shared RN components work on real hardware.

**Strategy**  
Web proves the flow; native proves the product travels to the job site.

**Projects**
- Device QA for vision-camera capture on iOS/Android (permissions, rebuild, LAN backend URL).
- Document and automate the pod/gradle + Metro restart checklist.
- Verify worker dashboard carousels and Design Studio upload/capture parity on real hardware.

**Timeline & impact**  
Parallel track (ongoing). Required before any App Store–style demo or field test.

**Resources**  
Physical devices or reliable simulators; developer machine LAN IP or tunnel for backend.

**Risks**  
Camera and build tooling friction; mitigated by demo/gallery fallbacks and README native prep notes.

---

### Initiative 4: Retailer & commerce integration

**Problem & opportunity**  
Sourcing today shows retailer names and running totals, but owners cannot act on approved lines without leaving the prototype mindset. Procurement remains a dead end.

**Hypothesis**  
If we integrate one retailer (deep links or API) and harden purchase-order submission, then owners will treat sourcing as actionable, because approved items lead to real purchase flows.

**Strategy**  
Turn approved sourcing lines into real actions — not just labels.

**Projects**
- Deep links or API integrations for Lowe's, Home Depot, Amazon (start with one retailer).
- Purchase-order submission flow hardening (backend purchases routes + owner confirm UX).
- Inventory/price freshness strategy (even if manual refresh at first).

**Timeline & impact**  
Longer horizon. Moves Sourcing from prototype list to credible procurement step.

**Resources**  
Retailer API access (often gated); legal/commerce review for prototypes.

**Risks**  
API availability and ToS; mitigate with link-out MVP before full cart integration.

---

### Initiative 5: CI, e2e expansion & contributor ergonomics

**Problem & opportunity**  
Rapid iteration on owner and worker flows lacks automated guardrails. A refactor can break the demo path (pipeline, burndown, claiming) without anyone noticing until manual QA.

**Hypothesis**  
If we expand playwrong e2e coverage and add CI running typecheck + unit + e2e, then regressions in the owner → worker story will be caught before merge, because visible-target browser tests exercise the real shipped UI on every change.

**Strategy**  
Protect the flows we demo most often so refactors do not silently break the owner → worker story.

**Projects**
- Expand playwrong e2e coverage for edge cases (multi-project rename/delete, scoping burndown persistence, scheduling auto-gen).
- CI job running `typecheck`, unit tests, and e2e on Linux + Chrome.
- `.env.example` and single-command `pnpm dev` documentation kept current.

**Timeline & impact**  
Near term. Lowers regression risk as initiatives 1–4 land.

**Resources**  
playwrong submodule + `pnpm setup:playwrong`; Xvfb in CI.

**Risks**  
Flaky UI tests; mitigate with `testID` hooks and visible-target clicking (already adopted).

---

## Non-goals & Assumptions

### Non-goals (for this plan cycle)

- Production deployment, billing, or marketplace features.
- Full multi-tenant contractor CRM.
- Replacing human estimates for permitted structural work without review.
- Native reanimated frame processors (not required for basic photo capture).
- Rewriting historical phase checklists — they live in [Historical context](#historical-context) only.

### Assumptions

- **README.md remains authoritative** for feature lists, commands, and limitations; this plan interprets and prioritizes, not invents.
- Web is the default demo surface until native QA passes on target devices.
- Cost figures are **estimates for planning**, labeled ready-to-go for UX clarity, not binding quotes.
- Backend runs locally or on a dev machine LAN IP; no cloud hosting assumed yet.
- Contributors read both README and this plan before large changes.

---

## Historical Context

*The sections below summarize earlier development — useful for archaeology, not for day-to-day status.*

### How we got here

Delta began as a ~40–50% v0.1 demo: crude tab buttons in `App.tsx`, TypeScript errors, broken Tailwind on some screens, no persistence, text-only AI, and a worker role with no real UI. **Most of that is resolved.**

**Phase 0 (stabilize)** — README rewrite, TS clean, Tailwind/PostCSS, AI wiring, basic dev scripts.  
**Phase 1 (foundation)** — Shared theme + components, react-navigation tabs, vision-camera prep + `media.ts`, multi-project store, dark mode, worker dashboard extraction.  
**Phase 2 (polish)** — Design as first tab, project switcher, pipeline bar, scoping burndown persistence, backend health, e2e tests, ready-to-go cost UX end-to-end.

### Resolved historical gaps (do not re-open without cause)

- TypeScript: `tsc --noEmit --skipLibCheck` is clean.
- Styling: StyleSheet + shared theme; no `className` on RN components.
- Navigation: Proper bottom tabs + stack; not crude header buttons.
- Persistence: Multi-project Zustand + localStorage + optional backend.
- Worker: Full dashboard with filters, claim, schedule — not onboarding-only.
- Photos: RN ScrollView carousels everywhere; Flickity removed.
- AI: Image-reference edits when ref available; not text-only only.

### Original roadmap phases (archived)

Phases 3–5 (data hardening, native polish, growth) are largely absorbed into the **Key Initiatives** above. Detailed phase checklists from early audits are intentionally not duplicated here — see git history if needed.

---

## Process & Contributing

We recommend this workflow:

1. **Read** [README.md](./README.md) for current behavior and [this plan](#current-priorities--key-initiatives) for priorities.
2. **Run** `pnpm dev` or `pnpm web` + backend; click through owner and worker flows.
3. **Change** code in focused PRs; keep README and DEVELOPMENT_PLAN in sync when behavior shifts.
4. **Verify** with `pnpm typecheck`, `pnpm test`, and `pnpm test:e2e` when touching shared flows.

**Branching**: `main` + feature branches; PRs welcome.  
**Success metrics**: New contributor runs web demo in under 5 minutes; owner happy path under 2 minutes; zero console errors on default web flow.

---

## Design principles for this document

This plan follows publication practices inspired by Airbnb's product and design writing:

| Principle | How we apply it here |
|-----------|----------------------|
| **Unified** | One narrative arc: pillars → current state → users → initiatives → history. No orphaned feature islands. |
| **Universal** | Plain language; terms like *burndown*, *Zustand*, and *ready-to-go* explained in context; tables for scanability. |
| **Iconic** | Strategic pillars and initiative titles are the memorable anchors; bold priorities, not noise. |
| **Conversational** | Direct voice ("we keep both files in sync", "contributions welcome") — an invitation to build together. |

---

*Last reconciled with [README.md](./README.md). When in doubt, trust the README for facts; trust this plan for priorities.*