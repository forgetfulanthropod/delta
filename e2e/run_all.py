#!/usr/bin/env python3
'''Run all Delta playwrong e2e tests.'''

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TESTS = [
    ROOT / 'e2e' / 'test_onboarding.py',
    ROOT / 'e2e' / 'test_guided_process.py',
]


def main() -> int:
    failed = 0
    for test in TESTS:
        print(f'\n==> {test.name}')
        code = subprocess.call([sys.executable, str(test)], cwd=ROOT)
        if code != 0:
            failed += 1
    if failed:
        print(f'\n{failed} e2e test(s) failed')
        return 1
    print('\nAll playwrong e2e tests passed')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())