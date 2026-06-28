#!/usr/bin/env python3
'''Delta guided owner flow e2e — full pipeline welcome through project_complete.'''

from __future__ import annotations

import asyncio
import sys

from helpers import (
    BASE_URL,
    auto_accept_dialogs,
    click_testid,
    fill_testid,
    playwrong_on_path,
    wait_for_testid_actionable,
    wait_for_text,
)

playwrong_on_path()
from playwrong import launch  # noqa: E402


async def amain() -> None:
    app = await launch(width=1280, height=900)
    try:
        await app.goto(BASE_URL)
        await auto_accept_dialogs(app)
        await wait_for_text(app, 'Transform the built environment')
        await click_testid(app, 'onboarding-owner')
        await wait_for_text(app, 'What should we call this project?', timeout_s=20)

        await fill_testid(app, 'guided-project-name', 'E2E Kitchen')
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Show us the space you want to transform.', timeout_s=15)

        await click_testid(app, 'guided-use-example')
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Describe your best hope', timeout_s=15)

        await fill_testid(
            app,
            'guided-prompt',
            'Open modern kitchen with warm light and better flow for family gatherings',
        )
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Does this direction feel right?', timeout_s=15)

        await click_testid(app, 'guided-generate-directions')
        await wait_for_text(app, 'Regenerate both', timeout_s=90)
        await wait_for_text(app, 'DIRECTION A', timeout_s=15)
        await asyncio.sleep(0.5)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Ready to go', timeout_s=20)
        await wait_for_text(app, 'YOUR DIRECTION', timeout_s=10)

        await click_testid(app, 'guided-approve-design-btn')
        await wait_for_testid_actionable(app, 'guided-continue-btn', timeout_s=45)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'items from', timeout_s=15)
        await wait_for_text(app, 'lowes.com/search', timeout_s=10)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_testid_actionable(app, 'guided-approve-material', timeout_s=15)

        # Approve each material (one-at-a-time step)
        for _ in range(12):
            if not await app.evaluate(
                "!!document.querySelector('[data-testid=\"guided-approve-material\"]')"
            ):
                break
            await click_testid(app, 'guided-approve-material')
            await asyncio.sleep(0.3)

        await wait_for_text(app, 'All materials approved', timeout_s=15)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Confirm scope', timeout_s=15)

        await click_testid(app, 'guided-generate-scope')
        await wait_for_text(app, 'story points scoped', timeout_s=15)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Build your crew schedule', timeout_s=15)

        await click_testid(app, 'guided-build-schedule')
        await wait_for_text(app, 'Day 1', timeout_s=15)
        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Your project is ready', timeout_s=15)

        body = await app.evaluate('document.body.innerText')
        assert 'Ready to go' in body, 'completion should show cost pill'
        assert 'Day 1' in body or 'schedule' in body.lower(), 'schedule preview retained'

        print('PASS guided process: full pipeline with costs, links, scope, schedule, complete')
    finally:
        await app.close()


def main() -> int:
    try:
        asyncio.run(amain())
        return 0
    except Exception as exc:
        print(f'FAIL guided process: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())