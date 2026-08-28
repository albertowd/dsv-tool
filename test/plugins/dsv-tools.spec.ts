import { beforeEach, describe, expect, test, vi } from 'vitest'

import { bufferToDsvInfo, fileToDsv } from '~/plugins/dsv-tools.client'
import { DESMUME_COOKIE, buildDsvBuffer, toFile } from '../helpers/dsv'

describe('bufferToDsvInfo', () => {
  test('reads every footer field from its own offset', () => {
    const info = bufferToDsvInfo(buildDsvBuffer({
      actuallyWrittenSize: 1024,
      addressSize: 24,
      header: 'HEADER',
      paddedSize: 64,
      saveSize: 512,
      saveType: 3,
      versionNumber: 1
    }))

    expect(info.actuallyWrittenSize).toBe(1024)
    expect(info.addressSize).toBe(24)
    expect(info.cookie).toBe(DESMUME_COOKIE)
    expect(info.header).toBe('HEADER')
    expect(info.paddedSize).toBe(64)
    expect(info.saveSize).toBe(512)
    expect(info.saveType).toBe(3)
    expect(info.versionNumber).toBe(1)
  })

  test('reads the header from paddedSize up to the footer', () => {
    const info = bufferToDsvInfo(buildDsvBuffer({ header: 'DSV-HEADER-TEXT', paddedSize: 128 }))

    expect(info.header).toBe('DSV-HEADER-TEXT')
  })

  test('decodes the cookie with the high bit masked off', () => {
    // 0xC1 masks down to 0x41 ('A'), the way Buffer.toString('ascii') behaves.
    const bytes = buildDsvBuffer({})
    bytes[bytes.length - 16] = 0xc1

    expect(bufferToDsvInfo(bytes).cookie.charAt(0)).toBe('A')
  })

  test('rejects a buffer too small to hold a footer', () => {
    expect(() => bufferToDsvInfo(new Uint8Array(16)))
      .toThrow(/too small/)
  })

  test('rejects a buffer whose paddedSize leaves no room for a header', () => {
    // paddedSize claims the whole buffer, so header/footer would overlap.
    const bytes = buildDsvBuffer({ header: 'H', paddedSize: 32 })
    new DataView(bytes.buffer).setUint32(bytes.length - 40 + 4, 4096, true)

    expect(() => bufferToDsvInfo(bytes)).toThrow(/Corrupted DSV buffer information/)
  })

  test('respects byteOffset when the buffer is a subarray', () => {
    const bytes = buildDsvBuffer({ saveSize: 512 })
    const padded = new Uint8Array(bytes.length + 8)
    padded.set(bytes, 8)

    expect(bufferToDsvInfo(padded.subarray(8)).saveSize).toBe(512)
  })
})

describe('fileToDsv', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('carries the file metadata onto the Dsv', async () => {
    const file = toFile(buildDsvBuffer(), 'pokemon.dsv', 1_700_000_000_000)
    const dsv = await fileToDsv(file)

    expect(dsv.name).toBe('pokemon.dsv')
    expect(dsv.lastModified).toBe(1_700_000_000_000)
    expect(dsv.size).toBe(file.size)
    expect(dsv.error).toBeNull()
  })

  test('encodes the content as base64 that decodes back to the bytes', async () => {
    const bytes = buildDsvBuffer()
    const dsv = await fileToDsv(toFile(bytes))

    const decoded = Uint8Array.from(atob(dsv.base64), (c: string): number => c.charCodeAt(0))
    expect(decoded).toEqual(bytes)
  })

  test('encodes content larger than one base64 chunk', async () => {
    // The encoder chunks at 0x8000 bytes; go past that boundary.
    const bytes = buildDsvBuffer({ paddedSize: 0x8000 * 2 + 5 })
    const dsv = await fileToDsv(toFile(bytes))

    expect(atob(dsv.base64)).toHaveLength(bytes.length)
  })

  test('parses the footer into info', async () => {
    const dsv = await fileToDsv(toFile(buildDsvBuffer({ saveType: 3, versionNumber: 1 })))

    expect(dsv.info.saveType).toBe(3)
    expect(dsv.info.versionNumber).toBe(1)
    expect(dsv.info.cookie).toBe(DESMUME_COOKIE)
  })

  test('records the failure on the Dsv instead of throwing', async () => {
    const dsv = await fileToDsv(toFile(new Uint8Array(8), 'broken.dsv'))

    expect(dsv.error).toBeInstanceOf(Error)
    expect(dsv.error?.message).toMatch(/too small/)
    expect(dsv.name).toBe('broken.dsv')
  })
})
