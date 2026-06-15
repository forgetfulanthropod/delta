'''Shared helpers for Delta playwrong e2e tests.'''

from __future__ import annotations

import asyncio
import json
import os
import signal
import subprocess
import time
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PLAYWRONG_DIR = ROOT / 'tools' / 'playwrong'
BASE_URL = os.environ.get('DELTA_E2E_URL', 'http://127.0.0.1:3000')


def playwrong_on_path() -> None:
    import sys

    pw = str(PLAYWRONG_DIR)
    if pw not in sys.path:
        sys.path.insert(0, pw)


def wait_http(url: str, timeout_s: float = 60.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=1.0) as resp:
                if resp.status == 200:
                    return
        except Exception:
            time.sleep(0.1)
    raise RuntimeError(f'HTTP not ready: {url}')


def start_process(cmd: list[str], cwd: Path | None = None) -> subprocess.Popen:
    return subprocess.Popen(
        cmd,
        cwd=cwd or ROOT,
        stdin=subprocess.DEVNULL,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        start_new_session=True,
    )


def stop_process(proc: subprocess.Popen | None) -> None:
    if not proc:
        return
    try:
        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
        proc.wait(timeout=5)
    except Exception:
        try:
            os.killpg(os.getpgid(proc.pid), signal.SIGKILL)
        except Exception:
            pass


async def page_contains_text(app, text: str) -> bool:
    expr = f"document.body && (document.body.innerText || '').includes({json.dumps(text)})"
    result = await app.evaluate(expr)
    return bool(result)


async def wait_for_text(app, text: str, timeout_s: float = 20.0) -> None:
    deadline = time.time() + timeout_s
    while time.time() < deadline:
        if await page_contains_text(app, text):
            return
        await asyncio.sleep(0.25)
    raise RuntimeError(f'timed out waiting for text: {text!r}')


async def click_visible(app, selector: str) -> None:
    '''Click a playwrong-visible target (strict visibility query, then activate).'''
    await app.one(selector)
    if os.environ.get('PLAYWRONG_PHYSICAL_CLICK', '0') == '1':
        await app.click(selector)
        return
    expr = f"""
(() => {{
  const node = document.querySelector({json.dumps(selector)});
  if (!node) throw new Error('not found: ' + {json.dumps(selector)});
  node.click();
}})()
"""
    await app.evaluate(expr)


async def click_testid(app, testid: str) -> None:
    await click_visible(app, f'[data-testid="{testid}"]')