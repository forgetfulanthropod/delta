#!/usr/bin/env python3
'''Delta owner example-project e2e via playwrong.'''

from __future__ import annotations

import asyncio
import sys

from helpers import BASE_URL, click_testid, playwrong_on_path, wait_for_text

playwrong_on_path()
from playwrong import launch  # noqa: E402


async def amain() -> None:
    app = await launch(width=1440, height=1000)
    try:
        await app.goto(BASE_URL)
        await wait_for_text(app, 'Transform the built environment')
        await click_testid(app, 'onboarding-owner')
        await wait_for_text(app, 'Design Studio')

        await click_testid(app, 'design-load-example')
        await wait_for_text(app, 'The Oak Street House', timeout_s=20)
        await wait_for_text(app, 'AI Variations for', timeout_s=15)
        await wait_for_text(app, 'Ready to go', timeout_s=10)

        print('PASS owner example: Oak Street House loaded with design variations')
    finally:
        await app.close()


def main() -> int:
    try:
        asyncio.run(amain())
        return 0
    except Exception as exc:
        print(f'FAIL owner example: {exc}', file=sys.stderr)
        return 1


if __name__ == '__main__':
    raise SystemExit(main())