#!/usr/bin/env python3
'''Delta guided owner flow e2e — welcome through photo step.'''

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
        await click_testid(app, 'onboarding-owner')
        await wait_for_text(app, 'What should we call this project?', timeout_s=20)

        await app.type('[data-testid="guided-project-name"]', 'E2E Kitchen')

        await click_testid(app, 'guided-continue-btn')
        await wait_for_text(app, 'Show us the space you want to transform.', timeout_s=15)

        await click_testid(app, 'guided-progress-link')
        await wait_for_text(app, 'Project overview', timeout_s=15)

        print('PASS guided process: welcome → capture photo → progress overview')
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