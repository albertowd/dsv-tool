/**
 * Matches a save file to the icon its game showed in the DS menu.
 *
 * A save carries nothing that names the game it belongs to - not in the raw
 * bytes, not in the DSV footer - so the file name is all there is to go on.
 * Names in the wild are usually the scene form,
 * `4780 - Pokemon HeartGold Version (U).sav`.
 *
 * The tempting shortcut is to load `icons/4780.webp` and show a placeholder
 * when it 404s. It does not work: that number is Advanscene/No-Intro
 * numbering, while the icon set was filed under ds-scene release numbers, and
 * the two disagree. Pokemon HeartGold (US) is 4780 in the first scheme and
 * 4787 in the second, where 4780 is Animal World: Dinosaurs. The request would
 * succeed and paint a dinosaur on a Pokemon cartridge - a wrong answer no
 * fallback can catch, because nothing failed.
 *
 * So the icons are stored under the game name instead, normalised to a slug
 * (`icons/pokemon-heartgold.webp`). That keeps the shortcut's shape - build a
 * URL, let the browser try it, fall back when it misses - with a key that
 * actually identifies the game, and needs no lookup table shipped alongside.
 */

/** Scene release markup: `*MULTi5*`, `*READNFO*`. */
const SCENE_TAGS: RegExp = /\*[^*]*\*/g

/**
 * Region and dump tags: `(U)`, `(Europe)`, `(Rev 1)`, `[!]`.
 *
 * The inner classes exclude the opening bracket as well as the closing one.
 * Allowing `(` inside `\(...\)` lets a run of unclosed brackets be retried
 * from every one of them, which is quadratic; it also matches across a
 * mismatched pair rather than stopping at the nearest one.
 */
const BRACKETED: RegExp = /\([^()]*\)|\[[^[\]]*\]/g

/** Revision markers: `v1.1`. */
const REVISION: RegExp = /\bv\d+(?:\.\d+)*\b/g

/** Words one side of the match spells out and the other leaves off. */
const NOISE: RegExp = /\b(?:version|the|a|an)\b/g

/** A save's extension, including the `.nds.sav` some emulators write. */
const EXTENSION: RegExp = /\.(?:nds\.)?[^.]*$/i

/** The scene release number, which the icons are deliberately not filed under. */
const LEADING_NUMBER: RegExp = /^\s*\d+\s*-\s*/

/**
 * Reduces a game name to the slug its icon is stored under.
 *
 * Kept in step with `slugify` in `scripts/build-game-icons.py`, which names
 * the files - the two have to agree or nothing ever matches.
 * @param name Game name, from either side of the match.
 * @returns the slug, or an empty string if nothing usable is left.
 */
export function gameNameToSlug (name: string): string {
  return name
    // Strip accents, so `Pokémon` and `Pokemon` reach the same slug.
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(SCENE_TAGS, ' ')
    .replace(BRACKETED, ' ')
    .replace(REVISION, ' ')
    .replaceAll('&', ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(NOISE, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

/**
 * Builds the icon URL for a save file name.
 *
 * The game may not be in the set at all, and the name may not be a game name
 * in the first place, so the URL is a guess. Whatever renders it has to treat
 * a failed load as "no icon" rather than an error.
 * @param fileName Name of the loaded file.
 * @param baseUrl Base path the site is served from.
 * @returns the icon URL, or null when the name yields no slug.
 */
export function gameIconUrl (fileName: string, baseUrl: string): string | null {
  const slug: string = gameNameToSlug(fileName.replace(EXTENSION, '').replace(LEADING_NUMBER, ''))
  return slug ? `${baseUrl}icons/${slug}.webp` : null
}

export default defineNuxtPlugin((nuxtApp) => {
  const baseUrl: string = nuxtApp.$config.app.baseURL

  return {
    provide: {
      gameIconUrl: (fileName: string): string | null => gameIconUrl(fileName, baseUrl)
    }
  }
})
