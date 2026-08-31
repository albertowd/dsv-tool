# Game icons

The 4844 icons in this directory are the ones Nintendo DS games showed in the
console's menu, 32x32 as the hardware drew them. The cartridge on the converter
paints one onto its label when it can work out which game a save belongs to.

## Where they came from

They were collected and published by [ds-scene.com][ds-scene], and packaged in
that form by [SixDigitCode/DS-Icon-Shortcut-Creator][pack], which is where this
copy was taken from. Neither states a licence.

The icons are artwork from the games themselves, so each one belongs to that
game's publisher. They are reproduced here only to label a save with the game it
came from, at the size the console displayed them. Nothing here is affiliated
with or endorsed by Nintendo or any publisher.

[ds-scene]: http://www.ds-scene.net
[pack]: https://github.com/SixDigitCode/DS-Icon-Shortcut-Creator

## How they are stored

Upstream files each icon under its ds-scene release number. This copy renames
them after the game instead - `pokemon-heartgold.webp` - so the app can build a
URL straight from a save's file name and let the request miss when the game is
not covered, instead of shipping a lookup table to consult first.

Do not be tempted back to the numbers. A save's file name usually carries one,
but it is Advanscene/No-Intro numbering while the icons were filed under
ds-scene release numbers, and the two disagree. Pokemon HeartGold (US) is 4780
in the first and 4787 in the second, where 4780 is Animal World: Dinosaurs, so
the request would succeed and paint the wrong game - a failure no fallback can
catch. `app/plugins/game-icon.client.ts` builds the slug the app looks up.

Where one game shipped in several regions the first of `us`, `eu`, `ja` wins,
which is why there are fewer files here than upstream releases. Each is lossless
WebP, about half the size of the PNG it came from and pixel for pixel identical.

## Rebuilding

`python3 scripts/build-game-icons.py` refetches the pack and regenerates this
directory. It needs Pillow.
