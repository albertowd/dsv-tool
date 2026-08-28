import { describe, expect, test } from 'vitest'

import Dsv from '~/models/Dsv'
import DsvInfo from '~/models/DsvInfo'

describe('Dsv', () => {
  test('starts empty, with a placeholder name and no error', () => {
    const dsv = new Dsv()

    expect(dsv.base64).toBe('')
    expect(dsv.error).toBeNull()
    expect(dsv.name).toBe('-')
    expect(dsv.size).toBe(0)
    expect(dsv.info).toBeInstanceOf(DsvInfo)
  })

  test('hands out a distinct id per instance', () => {
    const ids = [new Dsv().id, new Dsv().id, new Dsv().id]

    expect(new Set(ids).size).toBe(3)
  })

  test('defaults lastModified to roughly now', () => {
    const before = Date.now()
    const dsv = new Dsv()

    expect(dsv.lastModified).toBeGreaterThanOrEqual(before)
    expect(dsv.lastModified).toBeLessThanOrEqual(Date.now())
  })

  test('round-trips every writable field', () => {
    const dsv = new Dsv()
    const error = new Error('bad save')

    dsv.base64 = 'QUJD'
    dsv.error = error
    dsv.lastModified = 1_700_000_000_000
    dsv.name = 'pokemon.dsv'
    dsv.size = 524_288

    expect(dsv.base64).toBe('QUJD')
    expect(dsv.error).toBe(error)
    expect(dsv.lastModified).toBe(1_700_000_000_000)
    expect(dsv.name).toBe('pokemon.dsv')
    expect(dsv.size).toBe(524_288)
  })

  test('copies info field by field rather than adopting the instance', () => {
    const dsv = new Dsv()
    const original = dsv.info
    const incoming = new DsvInfo()

    incoming.actuallyWrittenSize = 1024
    incoming.addressSize = 24
    incoming.cookie = '|-DESMUME SAVE-|'
    incoming.header = 'HEADER'
    incoming.paddedSize = 64
    incoming.saveSize = 512
    incoming.saveType = 3
    incoming.versionNumber = 1

    dsv.info = incoming

    // The Dsv keeps its own DsvInfo, so later edits to `incoming` do not leak in.
    expect(dsv.info).toBe(original)
    expect(dsv.info).not.toBe(incoming)
    expect(dsv.info.actuallyWrittenSize).toBe(1024)
    expect(dsv.info.cookie).toBe('|-DESMUME SAVE-|')
    expect(dsv.info.header).toBe('HEADER')
    expect(dsv.info.versionNumber).toBe(1)

    incoming.saveType = 99
    expect(dsv.info.saveType).toBe(3)
  })
})
