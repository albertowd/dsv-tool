import { describe, expect, test } from 'vitest'

import DsvInfo from '~/models/DsvInfo'

describe('DsvInfo', () => {
  test('starts zeroed', () => {
    const info = new DsvInfo()

    expect(info.actuallyWrittenSize).toBe(0)
    expect(info.addressSize).toBe(0)
    expect(info.cookie).toBe('')
    expect(info.header).toBe('')
    expect(info.paddedSize).toBe(0)
    expect(info.saveSize).toBe(0)
    expect(info.saveType).toBe(0)
    expect(info.versionNumber).toBe(0)
  })

  test('round-trips every field independently', () => {
    const info = new DsvInfo()

    info.actuallyWrittenSize = 1
    info.addressSize = 2
    info.cookie = 'cookie'
    info.header = 'header'
    info.paddedSize = 3
    info.saveSize = 4
    info.saveType = 5
    info.versionNumber = 6

    expect(info.actuallyWrittenSize).toBe(1)
    expect(info.addressSize).toBe(2)
    expect(info.cookie).toBe('cookie')
    expect(info.header).toBe('header')
    expect(info.paddedSize).toBe(3)
    expect(info.saveSize).toBe(4)
    expect(info.saveType).toBe(5)
    expect(info.versionNumber).toBe(6)
  })
})
