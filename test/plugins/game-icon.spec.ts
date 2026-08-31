import { describe, expect, test } from 'vitest'

import { gameIconUrl, gameNameToSlug } from '~/plugins/game-icon.client'

const BASE = '/'

describe('gameNameToSlug', () => {
  test('reduces a name to a url safe slug', () => {
    expect(gameNameToSlug('Mario Kart DS')).toBe('mario-kart-ds')
  })

  test('strips accents, so Pokemon and Pokémon agree', () => {
    expect(gameNameToSlug('Pokémon HeartGold')).toBe(gameNameToSlug('Pokemon HeartGold'))
  })

  test('drops the words only one side of the match spells out', () => {
    expect(gameNameToSlug('Pokemon HeartGold Version')).toBe('pokemon-heartgold')
    expect(gameNameToSlug('The Legend of Zelda')).toBe('legend-of-zelda')
  })

  test('drops scene and dump markup', () => {
    expect(gameNameToSlug('Harvest Moon DS v1.1 *MULTi5*')).toBe('harvest-moon-ds')
    expect(gameNameToSlug('Mario Kart DS (USA) (Rev 1) [!]')).toBe('mario-kart-ds')
  })

  test('collapses punctuation rather than carrying it into the url', () => {
    expect(gameNameToSlug('Pokemon - HeartGold')).toBe('pokemon-heartgold')
    expect(gameNameToSlug('POKEMON_HEARTGOLD')).toBe('pokemon-heartgold')
    expect(gameNameToSlug('Chibi-Robo!: Park Patrol')).toBe('chibi-robo-park-patrol')
  })

  test('spells out an ampersand instead of escaping it', () => {
    expect(gameNameToSlug('Chip & Dale')).toBe('chip-and-dale')
  })

  test('never emits a character that would need url escaping', () => {
    const awkward: string[] = [
      'Pokémon: HeartGold',
      'Dragon Quest IV - Chapters of the Chosen',
      '007: Quantum of Solace',
      'Cooking Mama 2: Dinner with Friends!',
      '½ Hour & More'
    ]
    for (const name of awkward) {
      expect(gameNameToSlug(name)).toMatch(/^[a-z0-9-]*$/)
    }
  })

  test('has nothing to say about a name with no letters or digits', () => {
    expect(gameNameToSlug('---')).toBe('')
  })
})

describe('gameIconUrl', () => {
  test('builds the icon url for a scene named save', () => {
    expect(gameIconUrl('4780 - Pokemon HeartGold Version (U).sav', BASE))
      .toBe('/icons/pokemon-heartgold.webp')
  })

  test('ignores the number in the file name', () => {
    // It is Advanscene numbering, while the icons were filed under ds-scene
    // release numbers; 4780 there is Animal World: Dinosaurs.
    expect(gameIconUrl('4780 - Pokemon HeartGold Version (U).sav', BASE))
      .toBe(gameIconUrl('Pokemon HeartGold.sav', BASE))
  })

  test('reads through the extensions a save is written with', () => {
    for (const name of ['Mario Kart DS.sav', 'Mario Kart DS.dsv', 'Mario Kart DS.nds.sav']) {
      expect(gameIconUrl(name, BASE)).toBe('/icons/mario-kart-ds.webp')
    }
  })

  test('carries the base path the site is served from', () => {
    expect(gameIconUrl('Mario Kart DS.sav', '/dsv-tool/'))
      .toBe('/dsv-tool/icons/mario-kart-ds.webp')
  })

  test('still points somewhere for a name no game answers to', () => {
    // The set cannot be consulted up front, so an unknown name resolves to a
    // url that 404s; the cartridge treats that as "no icon".
    expect(gameIconUrl('my save.sav', BASE)).toBe('/icons/my-save.webp')
  })

  test('gives up when the name leaves no slug behind', () => {
    expect(gameIconUrl('-.sav', BASE)).toBeNull()
    expect(gameIconUrl('.sav', BASE)).toBeNull()
  })
})
