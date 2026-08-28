import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, test } from 'vitest'

import {
  DESMUME_COOKIE,
  bufferToDsvInfo,
  dsvToSav,
  fromBase64,
  isDsv,
  renameExtension,
  savToDsv
} from '~/plugins/dsv-tools.client'
import DsvInfo from '~/models/DsvInfo'
import { buildDsvBuffer } from '../helpers/dsv'

describe('dsvToSav', () => {
  test('drops the footer and any header', () => {
    const sav = dsvToSav(buildDsvBuffer({ header: 'HEADER', paddedSize: 256 }))

    expect(sav).toHaveLength(256)
    expect(isDsv(sav)).toBe(false)
  })

  test('keeps the save bytes untouched', () => {
    const original = new Uint8Array(512).map((_, i) => i % 251)
    const sav = dsvToSav(savToDsv(original))

    expect(sav).toEqual(original)
  })
})

describe('savToDsv', () => {
  test('appends a 40 byte footer', () => {
    const dsv = savToDsv(new Uint8Array(512))

    expect(dsv).toHaveLength(512 + 40)
    expect(isDsv(dsv)).toBe(true)
  })

  test('writes a footer the parser reads back', () => {
    const info = bufferToDsvInfo(savToDsv(new Uint8Array(1024)))

    expect(info.paddedSize).toBe(1024)
    expect(info.saveSize).toBe(1024)
    expect(info.actuallyWrittenSize).toBe(1024)
    expect(info.cookie).toBe(DESMUME_COOKIE)
  })

  test('preserves the emulator fields when they are supplied', () => {
    const source = bufferToDsvInfo(buildDsvBuffer({
      addressSize: 24, paddedSize: 512, saveType: 3, versionNumber: 1
    }))
    const info = bufferToDsvInfo(savToDsv(new Uint8Array(512), source))

    expect(info.saveType).toBe(3)
    expect(info.addressSize).toBe(24)
    expect(info.versionNumber).toBe(1)
  })

  test('sets paddedSize from the payload, not the donated info', () => {
    // Otherwise a re-wrapped save would tell the reader to slice at the wrong
    // offset and silently truncate.
    const source = bufferToDsvInfo(buildDsvBuffer({ paddedSize: 4096 }))
    const info = bufferToDsvInfo(savToDsv(new Uint8Array(512), source))

    expect(info.paddedSize).toBe(512)
  })
})

describe('round trips', () => {
  test('sav -> dsv -> sav returns the original bytes', () => {
    const original = new Uint8Array(2048).map((_, i) => (i * 7) % 256)

    expect(dsvToSav(savToDsv(original))).toEqual(original)
  })

  test('dsv -> sav -> dsv keeps the save data and the cookie', () => {
    const dsv = buildDsvBuffer({ header: '', paddedSize: 1024 })
    const roundTripped = savToDsv(dsvToSav(dsv), bufferToDsvInfo(dsv))

    expect(dsvToSav(roundTripped)).toEqual(dsv.slice(0, 1024))
    expect(isDsv(roundTripped)).toBe(true)
  })

  test('converts the real Pokemon HeartGold save in the repo', () => {
    const path = resolve(process.cwd(), 'app/assets/4780 - Pokemon HeartGold Version (U).sav')
    const sav = new Uint8Array(readFileSync(path))

    expect(isDsv(sav)).toBe(false)
    expect(sav).toHaveLength(524_288)

    const dsv = savToDsv(sav)
    expect(isDsv(dsv)).toBe(true)
    expect(bufferToDsvInfo(dsv).paddedSize).toBe(524_288)
    expect(dsvToSav(dsv)).toEqual(sav)
  })
})

describe('helpers', () => {
  test('fromBase64 undoes the encoder', () => {
    const bytes = buildDsvBuffer()
    const base64 = btoa(String.fromCodePoint(...bytes))

    expect(fromBase64(base64)).toEqual(bytes)
  })

  test('renameExtension swaps the extension', () => {
    expect(renameExtension('pokemon.dsv', 'sav')).toBe('pokemon.sav')
    expect(renameExtension('pokemon.sav', 'dsv')).toBe('pokemon.dsv')
  })

  test('renameExtension keeps dots inside the name', () => {
    expect(renameExtension('my.save.file.dsv', 'sav')).toBe('my.save.file.sav')
  })

  test('renameExtension appends when there is no extension', () => {
    expect(renameExtension('pokemon', 'dsv')).toBe('pokemon.dsv')
  })
})

describe('savToDsv size fallbacks', () => {
  test('derives the sizes when handed an empty info', () => {
    // A raw save is modelled with an all-zero DsvInfo rather than no info, so
    // a `??` fallback would not fire and the footer would claim zero bytes.
    const info = bufferToDsvInfo(savToDsv(new Uint8Array(2048), new DsvInfo()))

    expect(info.actuallyWrittenSize).toBe(2048)
    expect(info.saveSize).toBe(2048)
    expect(info.paddedSize).toBe(2048)
  })
})
