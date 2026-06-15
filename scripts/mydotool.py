#!/usr/bin/env python3
'''Python fallback for playwrong mydotool when gcc is unavailable.'''

from __future__ import annotations

import sys
import time


def die(msg: str) -> None:
    print(msg, file=sys.stderr)
    raise SystemExit(1)


def parse_button(args: list[str], i: int) -> tuple[int, int]:
    if i + 1 < len(args) and args[i + 1][0].isdigit():
        return int(args[i + 1]), 2
    return 1, 1


def main(argv: list[str]) -> int:
    if len(argv) < 2:
        die(
            'usage: mydotool move x y | down [btn] | up [btn] | click [btn] | '
            'key keyname | downkey keyname | upkey keyname | type text | paste text | sleep ms'
        )

    try:
        import pyautogui
    except ImportError as exc:
        die(f'pyautogui required for Python mydotool fallback: {exc}')

    pyautogui.FAILSAFE = False
    pyautogui.PAUSE = 0

    key_map = {
        'Return': 'enter',
        'BackSpace': 'backspace',
        'Control_L': 'ctrl',
        'Shift_L': 'shift',
        'Tab': 'tab',
        'Escape': 'esc',
        'Left': 'left',
        'Right': 'right',
        'Up': 'up',
        'Down': 'down',
    }

    i = 1
    while i < len(argv):
        cmd = argv[i]
        if cmd == 'move':
            if i + 2 >= len(argv):
                die('usage: mydotool move x y')
            pyautogui.moveTo(int(argv[i + 1]), int(argv[i + 2]), _pause=False)
            i += 3
        elif cmd == 'down':
            btn, step = parse_button(argv, i)
            pyautogui.mouseDown(button='left' if btn == 1 else 'right', _pause=False)
            i += step
        elif cmd == 'up':
            btn, step = parse_button(argv, i)
            pyautogui.mouseUp(button='left' if btn == 1 else 'right', _pause=False)
            i += step
        elif cmd == 'click':
            btn, step = parse_button(argv, i)
            button = 'left' if btn == 1 else 'right'
            pyautogui.click(button=button, _pause=False)
            i += step
        elif cmd == 'key':
            if i + 1 >= len(argv):
                die('usage: mydotool key keyname')
            pyautogui.press(key_map.get(argv[i + 1], argv[i + 1].lower()), _pause=False)
            i += 2
        elif cmd == 'downkey':
            if i + 1 >= len(argv):
                die('usage: mydotool downkey keyname')
            pyautogui.keyDown(key_map.get(argv[i + 1], argv[i + 1].lower()), _pause=False)
            i += 2
        elif cmd == 'upkey':
            if i + 1 >= len(argv):
                die('usage: mydotool upkey keyname')
            pyautogui.keyUp(key_map.get(argv[i + 1], argv[i + 1].lower()), _pause=False)
            i += 2
        elif cmd == 'type':
            if i + 1 >= len(argv):
                die('usage: mydotool type text')
            pyautogui.write(argv[i + 1], interval=0.003, _pause=False)
            i += 2
        elif cmd == 'paste':
            if i + 1 >= len(argv):
                die('usage: mydotool paste text')
            import pyperclip

            pyperclip.copy(argv[i + 1])
            pyautogui.hotkey('ctrl', 'v', _pause=False)
            i += 2
        elif cmd == 'sleep':
            if i + 1 >= len(argv):
                die('usage: mydotool sleep ms')
            time.sleep(int(argv[i + 1]) / 1000.0)
            i += 2
        else:
            die('bad cmd')

    time.sleep(0.002)
    return 0


if __name__ == '__main__':
    raise SystemExit(main(sys.argv))