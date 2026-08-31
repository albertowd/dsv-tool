#!/usr/bin/env python3
"""
Rebuilds `public/icons`, the game icons drawn on the cartridge label.

The set comes from SixDigitCode's DS Icon Shortcut Creator, which packages the
icons ds-scene.com published - 6463 of them, one per DS scene release, 32x32
as the DS menu drew them. See `public/icons/README.md` for attribution.

Upstream files them under ds-scene release numbers. This script stores them
under the game name instead, so the app can build a URL straight from a save's
file name and let the browser miss when the game is not covered, rather than
shipping a lookup table. `app/plugins/game-icon.client.ts` explains at length
why the number in a save's file name cannot be used for this.

Several regions of one game collapse to a single slug; the first region present
in PREFERENCE wins. That drops about a quarter of the files, and the regional
variants that are lost are nearly always the same artwork anyway.

Requires Pillow. Usage: python3 scripts/build-game-icons.py
"""

import io
import json
import pathlib
import re
import shutil
import tarfile
import unicodedata
import urllib.request

from PIL import Image

PACK = ('https://github.com/SixDigitCode/DS-Icon-Shortcut-Creator'
        '/archive/refs/heads/main.tar.gz')
DATABASE = ('https://raw.githubusercontent.com/SixDigitCode/'
            'DS-Icon-Shortcut-Creator/main/index.html')
OUTPUT = pathlib.Path(__file__).resolve().parent.parent / 'public' / 'icons'

# Which region to keep when one game is present several times.
PREFERENCE = ['us', 'eu', 'ja']

SCENE_TAGS = re.compile(r'\*[^*]*\*')          # *MULTi5*, *READNFO*
# (U), (Europe), [!]. The classes exclude the opening bracket too, so a run
# of unclosed ones cannot be retried from each of them; kept identical to
# `BRACKETED` in app/plugins/game-icon.client.ts.
BRACKETED = re.compile(r'\([^()]*\)|\[[^[\]]*\]')
REVISION = re.compile(r'\bv\d+(?:\.\d+)*\b')   # v1.1
NOT_ALNUM = re.compile(r'[^a-z0-9]+')
NOISE = re.compile(r'\b(?:version|the|a|an)\b')


def slugify(name: str) -> str:
    """Reduces a game name to the slug its icon is stored under.

    Kept in step with `gameNameToSlug` in `app/plugins/game-icon.client.ts`,
    which rebuilds the same slug from a save's file name - the two have to
    agree or nothing ever matches.
    """
    decomposed = unicodedata.normalize('NFKD', name)
    ascii_only = ''.join(c for c in decomposed if not unicodedata.combining(c))
    s = ascii_only.lower()
    s = SCENE_TAGS.sub(' ', s)
    s = BRACKETED.sub(' ', s)
    s = REVISION.sub(' ', s)
    s = s.replace('&', ' and ')
    s = NOT_ALNUM.sub(' ', s)
    s = NOISE.sub(' ', s)
    return '-'.join(s.split())


def fetch_database() -> list[dict]:
    """Extracts the icon database from the upstream page's inline JS array."""
    with urllib.request.urlopen(DATABASE) as response:
        page = response.read().decode('utf-8', errors='replace')

    marker = page.find('"iconurl"')
    if marker < 0:
        raise SystemExit('no icon database found in the upstream page')

    start = page.rfind('[', 0, marker)
    depth = 0
    for i in range(start, len(page)):
        if page[i] == '[':
            depth += 1
        elif page[i] == ']':
            depth -= 1
            if depth == 0:
                return json.loads(page[start:i + 1])
    raise SystemExit('icon database array is unterminated')


def fetch_icons() -> dict[str, bytes]:
    """Downloads the pack, returning each icon's bytes by release number."""
    with urllib.request.urlopen(PACK) as response:
        archive = io.BytesIO(response.read())

    icons = {}
    with tarfile.open(fileobj=archive, mode='r:gz') as tar:
        for member in tar.getmembers():
            match = re.search(r'/images/(\d+)\.png$', member.name)
            if match and member.isfile():
                handle = tar.extractfile(member)
                if handle:
                    icons[match.group(1).lstrip('0') or '0'] = handle.read()
    return icons


def to_webp(png: bytes) -> bytes:
    """Re-encodes an icon as lossless WebP, which halves it.

    Verified rather than trusted: a wrong pixel here would be silently baked
    into the repository.
    """
    original = Image.open(io.BytesIO(png)).convert('RGBA')
    buffer = io.BytesIO()
    original.save(buffer, 'WEBP', lossless=True, quality=100, method=6, exact=True)
    encoded = buffer.getvalue()

    roundtrip = Image.open(io.BytesIO(encoded)).convert('RGBA')
    if roundtrip.tobytes() != original.tobytes():
        raise ValueError('WebP encode was not lossless')
    return encoded


def main() -> None:
    database = fetch_database()
    icons = fetch_icons()
    print(f'{len(database)} database entries, {len(icons)} icon files')

    def rank(entry: dict) -> tuple:
        region = entry['region']
        position = PREFERENCE.index(region) if region in PREFERENCE else len(PREFERENCE)
        return (position, region, int(entry['number']))

    games: dict[str, list[dict]] = {}
    for entry in database:
        slug = slugify(entry['name'])
        if slug:
            games.setdefault(slug, []).append(entry)

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)

    written = skipped = total = 0
    for slug, entries in sorted(games.items()):
        for entry in sorted(entries, key=rank):
            png = icons.get(str(int(entry['number'])))
            if png is None:
                continue
            encoded = to_webp(png)
            (OUTPUT / f'{slug}.webp').write_bytes(encoded)
            written += 1
            total += len(encoded)
            break
        else:
            skipped += 1

    print(f'{written} icons written to {OUTPUT} ({total / 1e6:.2f} MB)')
    if skipped:
        print(f'{skipped} games had no icon file in the pack')


if __name__ == '__main__':
    main()
