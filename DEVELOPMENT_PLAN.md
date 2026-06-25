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

*Reconciled against [README.md](./README.md) as of the latest refresh.*

Delta is a **cross-platform (React Native + Web) prototype** for an AI-powered home remodeling assistant. Homeowners ("owners") take photos of spaces, reimagine them with AI, source materials from retailers, and generate realistic labor schedules. Workers can join jobs.

Today it is a **functional web-first demo**: the owner journey and worker dashboard are both demo-ready on `http://localhost:3000` (with optional backend on port 4000 for real AI).

### What's working today

| Area | Current behavior |
|------|------------------|
| **Onboarding** | Role selection (owner/worker) with full-screen before/after hero. |
| **Design Studio** | Camera/upload (native vision-camera + solid web picker with preview/demo fallback), prompt + AI reimagine (xAI Grok Imagine via backend, or static fallbacks), before/after sliders, multiple versions with **prominent ready-to-go cost pills** on every card, make-current summary, cost confirmation before handoff to Sourcing, dedicated Cost Summary panel when a version is approved. |
| **Owner chrome** | **Project switcher** (multi-project create/switch/rename/delete + optional backend cloud sync), **pipeline progress bar** (Design → Sourcing → Scoping → Scheduling), role switch in header. |
| **Sourcing** | Dynamic list from designs; approve items from Lowe's/Amazon/Home Depot; running total; generate labor tasks. |
| **Scoping** | Selected/approved design as hero; scope tree grouped by trade (Carpentry, Electrical, Painting, Flooring, Demolition, Plumbing, etc.) with story points on every subtask; interactive **SVG burndown chart** (ideal vs actual, trending to 0); **burndown progress persists per project**; complete subtasks live; sync scope from labor tasks when available. |
| **Scheduling** | 8-hour days, built-in breaks (lunch + short), largest-first packing, per-day breakdown with start/end times, half-day progress, **$25/hr guaranteed costing**; auto-generated when labor tasks exist. |
| **Worker dashboard** | Trade filters; cross-platform horizontal photo carousels; bullet task lists; **estimated total cost ("ready to go")** on each card; claim/assign → "My Assigned Jobs" (persisted); owner-sourced live cards; scheduling visibility for claimed jobs (shared scheduler logic); unclaim supported; claiming syncs tasks into labor state. |
| **State & persistence** | Zustand multi-project store (design → sourcing → labor per project); localStorage on web; optional `/api/projects` backend save/load; legacy single-project auto-migration. |
| **AI** | Client provider/key UI; backend image-reference edits when upload provides data URI or public URL; richer prompts for room structure/perspective; dynamic material suggestions and cost estimates from prompt + tweaks. |
| **Theming** | `src/shared/theme.ts` light/dark via `useTheme()`; applied across App shell, Design, Sourcing, Scoping, Scheduling, worker dashboard; shared `ReadyToGoCostPill`, `ProjectHero`, buttons. |
| **Navigation** | `src/navigation/AppNavigator.tsx` (root Native Stack + `NavigationContainer`), `TabNavigator.tsx` (bottom tabs: **Design** / Sourcing / Scoping / Scheduling + `OwnerHeader` + `ProjectPipelineBar`), `types.ts` (typed param lists), `MainTabNavigator` compat shim. react-navigation v6+/v7; web + mobile. |
| **Role context** | `src/context/AppRoleContext` — owner/worker role switch shared across header and `App`. |
| **Media** | `src/shared/media.ts` (`normalizeImageUri`, `getImageSource`) used consistently across Design, Scoping, worker carousels, onboarding, sliders. |
| **Backend** | Express (`backend/server.js`): `/api/analyze` (describeimages shell-out), `/api/reimagine` (xAI), `/api/health`, `/api/projects`, purchases routes. |
| **Quality** | `pnpm typecheck` clean; scheduler + scopeFromLabor unit tests (jest); playwrong e2e via `pnpm test:e2e` (see table below). |

### Owner flow (end-to-end)

Onboarding → **Design** tab (photo + prompt + AI + cost transparency) → Sourcing (approve, totals) → Scoping (hero + trade tree + burndown) → Scheduling (breaks + costing). Header shows project switcher and pipeline bar throughout.

### Worker flow (end-to-end)

Onboarding → dashboard with trade filter → browse jobs with photos and ready-to-go costs → claim → "My Assigned Jobs" with owner data and day-by-day schedule → unclaim if needed.

### Known limitations

These are honest gaps — not hidden behind historical checklists.

- **AI**: Image-reference path active when xAI key + upload ref available; text-only fallback otherwise. Estimates are rich but still model- and demo-data-limited.
- **Persistence**: Multi-project client + in-memory backend demo; AsyncStorage guidance for native; no real auth or multi-user.
- **Native camera**: Permissions + integration complete; simulator relies on demo/gallery fallbacks; device QA and LAN IP for backend calls still matter.
- **Production gaps**: No real auth, retailer APIs, or production deployment; some demo alerts and sample data remain for fast iteration.
- **Cross-platform**: Worker + Design Studio photos now consistent (RN ScrollView carousels; no web-only Flickity).

### Tech stack

*Reconciled from [README.md](./README.md) — not delegated.*

| Layer | Stack |
|-------|-------|
| **Client** | React Native 0.85 + react-native-web + Vite (web on :3000) |
| **Language & state** | TypeScript; Zustand (multi-project store) |
| **Styling** | Tailwind on web (PostCSS); StyleSheet on native; shared `theme.ts` |
| **Navigation** | react-navigation (native-stack + bottom-tabs + screens + safe-area) |
| **Camera** | react-native-vision-camera v4 (native); `.web.tsx` upload/preview on web |
| **Backend** | Express (simple AI proxy + projects + purchases) |
| **Persistence** | Zustand multi-project with history/save/load + names/metadata; localStorage on web; optional `/api/projects` cloud save |
| **Prerequisites** | Node >= 22.11; pnpm; Ruby + CocoaPods for iOS; optional `XAI_API_KEY` / `GEMINI_API_KEY` for AI |
| **Tooling** | `pnpm dev` (web + backend), `pnpm typecheck`, `pnpm test`, `pnpm test:e2e`, `pnpm describe:image` (Gemini caption via `~/bin/describeimages`), `pnpm build:web` |

### Project structure

```
src/
  features/
    design/          # CameraScreen.tsx + .web.tsx, AIProviderSelector, DesignStudioScreen, BeforeAfterSlider
    labor/           # LaborSchedulerScreen + scheduler.ts (core logic)
    sourcing/        # SourcingScreen + types
    scoping/         # ScopingScreen (hero + scope tree + burndown)
    worker/          # WorkerDashboardScreen (themed + getImageSource)
  onboarding/
  shared/            # theme.ts, media.ts, ReadyToGoCostPill, ProjectHero, OwnerHeader, ProjectSwitcher, etc.
  navigation/        # AppNavigator.tsx, TabNavigator.tsx, types.ts, MainTabNavigator shim
  context/           # AppRoleContext (owner/worker role switch)
  store/             # useDeltaStore.ts (design → sourcing → labor)
  web-shims/
backend/server.js    # Express, /api/analyze, /api/reimagine, /api/projects, purchases
public/              # demo images (ai-room-*.jpg, test-images/before-after/*)
e2e/                 # playwrong browser tests (vendored tools/playwrong submodule)
```

Desktop UI uses max-width containers (~720px) for readability. Cross-platform intent via web shims and `.web.tsx` splits.

### E2E test coverage (playwrong)

[playwrong](https://github.com/qpwo/playwrong) runs a real Chromium window in Xvfb. Key UI hooks use `testID` → `data-testid` on web.

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

Setup: `git submodule update --init tools/playwrong` → `pnpm setup:playwrong` → `pnpm test:e2e`. Vision captions: `/api/analyze` shells out to `~/bin/describeimages` when `imageUri` present; `pnpm describe:image <path>` for manual captioning.

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