<div align="center">

<img src="public/icon.png" alt="" width="140">

# DSV Tool

**A DSV (DeSmuME/DraStic) converter from/to RAW DS save files.**

Inspect and convert Nintendo DS emulator saves entirely in your browser —
nothing is uploaded anywhere.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxtdotjs&logoColor=white)](https://nuxt.com)
[![Vuetify](https://img.shields.io/badge/Vuetify-4-1867C0?logo=vuetify&logoColor=white)](https://vuetifyjs.com)

**[→ Open the app](https://albertowd.github.io/dsv-tool/)**

<img src="docs/screenshot-home.webp" alt="DSV Tool home screen" width="820">

</div>

---

## What is a DSV file?

DeSmuME and DraStic append a **40-byte footer** to the raw save data a DS
cartridge would hold. That footer records how the emulator sized the save, and
ends with a 16-byte cookie — `|-DESMUME SAVE-|`:

| Offset | Size | Field                  |
| -----: | ---: | ---------------------- |
|    `0` |    4 | Actually written size  |
|    `4` |    4 | Padded size            |
|    `8` |    4 | Save type              |
|   `12` |    4 | Address bus size       |
|   `16` |    4 | Save size              |
|   `20` |    4 | Version number         |
|   `24` |   16 | Cookie                 |

A `.sav` from real hardware or another emulator is that same save data without
the footer, which is why the two formats are so close and yet refuse to load in
each other's emulator.

## Features

- **Converts both ways.** Export a `.dsv` as a raw `.sav` with the footer
  stripped, or a `.sav` as a `.dsv` with a DeSmuME footer appended. Converting
  a save and converting it back returns the original bytes.
- **Runs entirely in your browser.** Saves are read with the File API and never
  leave your machine — there is no server to upload them to.
- **Reads the DSV footer.** Save type, address bus size, padding, written size
  and cookie, decoded from the bytes.
- **Drop a save on the cartridge**, or click it to pick a `.dsv` / `.sav`.
- **Session history** of everything loaded, each entry re-exportable.
- **Installable.** Ships a web app manifest and service worker, so it works
  offline once loaded.

> [!NOTE]
> History lives in memory for the session — reloading the page clears it.
> Conversion is byte-exact and covered by tests, including a round trip of the
> 512 KB sample save in `app/assets`, but the generated footer has not been
> checked against DeSmuME itself. When a save came from a `.dsv`, its original
> save type and bus width are carried across; for a raw `.sav` those fields are
> derived from the file length.

## Getting started

Requires **Node 24** (see `.nvmrc`).

```bash
npm install
npm run dev          # http://localhost:3000
```

### Everyday commands

| Command                 | What it does                                     |
| ----------------------- | ------------------------------------------------ |
| `npm run dev`           | Dev server with hot reload                        |
| `npm run build`         | Production build                                  |
| `npm run generate`      | Static site into `.output/public`                 |
| `npm start`             | Preview a production build                        |
| `npm test`              | Run the test suite                                |
| `npm run test:coverage` | Tests with a coverage report                      |
| `npm run lint`          | ESLint (`lint:fix` to autofix)                    |
| `npm run typecheck`     | `vue-tsc` over the project                        |

## Testing

85 tests across the models, Pinia stores, the DSV parser and converter, and
the components, run with [Vitest](https://vitest.dev) in a Nuxt environment.

```bash
npm test
npm run test:coverage
```

The parser tests build synthetic DSV buffers, giving every footer field a
distinct value so a mis-indexed read fails loudly instead of quietly matching a
neighbouring field. The converter is checked by round trip — `sav -> dsv -> sav`
must return the original bytes, including for the real save in `app/assets`.

## Code quality

A local [SonarQube](https://www.sonarsource.com/products/sonarqube/) instance
is included for static analysis. It needs Docker, and runs on SonarQube's
embedded database — no external database to set up.

```bash
npm run sonar        # start it, scan, and open the results
```

That brings the container up, waits for it to be ready, collects coverage,
scans, and prints the dashboard URL and login.

| Command                  | What it does                          |
| ------------------------ | ------------------------------------- |
| `npm run sonar`          | Full analysis, start to finish        |
| `npm run sonar:up`       | Start SonarQube only                  |
| `npm run sonar:down`     | Stop it                               |
| `npm run sonar:reset`    | Stop it and wipe its data             |
| `npm run sonar:logs`     | Follow the server log                 |
| `npm run sonar:credentials` | Print and verify the login         |

## Deployment

`npm run generate` writes the whole static site to `.output/public`. Deployment
is handled outside this repository, by an external tool that publishes that
directory; there is no deploy workflow here.

If the site is served from a subpath rather than a domain root, the build takes
its base path from `NUXT_APP_BASE_URL`. Locally it stays `/`, so nothing special
is needed for development.

```bash
NUXT_APP_BASE_URL=/dsv-tool/ npm run generate
```

## Performance and indexing

Lighthouse scores 100 for accessibility, best practices and SEO on every route,
100 for performance on desktop and about 94 on mobile.

Two things carry most of that. Icons are SVG paths from `@mdi/js` rather than
the MDI webfont, which was 418 kb of stylesheet and a 403 kb woff2 to draw the
sixteen icons this app uses. And because the app renders on the client, the
document would otherwise paint nothing until Vue had booted - 87% of the mobile
LCP was that wait - so `app/spa-loading-template.html` paints the same artwork,
at the same size and place, straight from the HTML.

What remains on mobile is HTTP cache headers, which the local `npx serve` does
not send. Everything under `_nuxt/` is content hashed and safe to serve
`immutable`, so a real host should score higher than the numbers above.

`public/robots.txt` allows crawling but disallows `/icons/`: those 4844 files
are 99% of the site's URLs and are decoration the app fetches, not pages.

## Project layout

```
app/
  assets/        Vuetify SASS variables
  components/    CartridgeCard, CartridgeInfo, CartridgeInput,
                 ImportSaves, ExportSaves
  layouts/       App shell: nav drawer, app bar, footer
  models/        Dsv and DsvInfo
  pages/         /, /convert, /history
  plugins/       DSV parsing, game icon lookup, folder access, Vuetify setup
  stores/        Pinia: current save, session history
public/          Images, favicon, PWA icon source, game icons
  icons/         Per-game cartridge icons, named after the game
scripts/         SonarQube helpers, game icon rebuild
test/            Vitest suite, mirroring app/
  fixtures/      A real 512 kb save the conversion tests round trip
```

Components pair a `.vue` template with sibling `.ts` and `.css` files, which the
template pulls in via `<script src>` and `<style src>`.

Images all live in `public/`, so the bundler serves them as files rather than
packing them into the JavaScript - which matters most for `public/icons`, where
there are several thousand. The cost is that anything referencing them carries
the base path by hand.

## Importing and exporting saves

**History** carries both ends of a card's round trip.

*Import* scans a folder, memory card or drive and adds every `.dsv` and `.sav`
it finds, at any depth. Re-scanning the same card does not duplicate anything:
a save already in the list is counted and skipped.

*Export* writes every save in the list back out, as `.DSV` (with a DeSmuME
footer) or `.SAV` (raw, as a cartridge holds it). A save already in the format
asked for is copied untouched rather than converted and back again.

Both use the File System Access API's directory picker, not WebUSB - WebUSB
talks to a USB device as a device, with no notion of partitions or files, so it
cannot read a mounted card. That picker is desktop Chromium only. Elsewhere,
importing falls back to a directory `<input>` and exporting to ordinary
downloads; neither can address a folder directly, but a card can still be read
and written.

A scan stops after 20,000 entries or 500 saves and says so, so that pointing it
at a home directory or a system drive cannot spin forever or exhaust the tab's
memory. A save that cannot be read, or written, is counted and skipped rather
than abandoning the rest.

## Game icons

The cartridge shows the icon its game had in the DS menu. A save says nothing
about which game it belongs to - not in its bytes, not in the DSV footer - so
the only clue is the file name, and the match is made on the game name in it.
Saves named the usual way are recognised, including the scene form
`4780 - Pokemon HeartGold Version (U).sav`; a save renamed to something like
`my save.sav` simply leaves the label blank.

The icons come from a set published by ds-scene.com. See
[`public/icons/README.md`](public/icons/README.md) for attribution, how they are
stored, and how to rebuild them.

## Built with

[Nuxt 4](https://nuxt.com) · [Vue 3](https://vuejs.org) ·
[Vuetify 4](https://vuetifyjs.com) · [Pinia](https://pinia.vuejs.org) ·
[Vite PWA](https://vite-pwa-org.netlify.app) · [Vitest](https://vitest.dev) ·
[TypeScript](https://www.typescriptlang.org)

## License

[GPL-3.0](LICENSE)
