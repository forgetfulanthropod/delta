#!/usr/bin/env python3
'''Delta onboarding e2e — playwrong (real pointer actions, visible-only clicks).'''

from __future__ import annotations

import asyncio
import sys

from helpers import BASE_URL, click_testid, playwrong_on_path, wait_for_text

playwrong_on_path()
from playwrong import launch  # noqa: E402


async def amain() -> None:
    app = await launch(width=1280, height=900)
    try:
        await app.goto(BASE_URL)
        await wait_for_text(app, 'Transform the built environment')

        owners = await app.visible('[data-testid="onboarding-owner"]')
        workers = await app.visible('[data-testid="onboarding-worker"]')
        assert len(owners) >= 1, 'owner CTA must be visible and actionable'
        assert len(workers) >= 1, 'worker CTA must be visible and actionable'

        hidden = await app.visible('[data-testid="should-not-exist"]')
        assert hidden == [], 'missing testids should not match'

        await click_testid(app, 'onboarding-owner')
        await wait_for_text(app, 'Design Studio', timeout_s=25)

        print('PASS onboarding: landing UI visible, owner flow opens Design Studio')
    finally:
        await app.close()


def main() -> int:
    try:
        asyncio.run(amain())
        return 0
    except Exception as exc:
        print(f'FAIL onboarding: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())