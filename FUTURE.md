# Delta Future / Advanced Ideas (Phase 5+)

See [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) for current priorities and [historical context](./DEVELOPMENT_PLAN.md#historical-context).

## Computer Vision + LLM
- Auto-analyze uploaded photo for room type, issues (peeling paint, water damage), suggest materials list.
- Use vision model first to caption/describe image, then feed rich description + user prompt to image gen.

## Real Integrations
- Retailer APIs or scraping/affiliates for live pricing + availability.
- Contractor matching marketplace.

## AR / 3D
- ARKit/ARCore preview of designs overlaid in room (needs depth, 3D models).
- Simple three.js web preview.

## Collaboration & Payments
- Multi-user projects (owner + workers).
- Stripe for material deposits, labor milestones.

## White Label / Scale
- Multi-tenant for contractors to brand their own "Delta".
- Analytics, A/B on prompts.

## Other
- Offline first (sync when back online).
- Voice prompts for design.
- Before/after gallery sharing, social.
- Cost estimator ML model.

Stubs and experiments can live under src/experiments/ or feature flags.

Contributions welcome!
