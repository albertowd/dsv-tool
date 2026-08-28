import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'

import Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'

describe('current store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('starts holding an empty Dsv', () => {
    const current = useCurrentStore()

    expect(current.dsv).toBeInstanceOf(Dsv)
    expect(current.dsv.name).toBe('-')
    expect(current.dsv.size).toBe(0)
  })

  test('update swaps in the given Dsv', () => {
    const current = useCurrentStore()
    const dsv = new Dsv()
    dsv.name = 'pokemon.dsv'

    current.update(dsv)

    expect(current.dsv.name).toBe('pokemon.dsv')
    expect(current.dsv.id).toBe(dsv.id)
  })

  test('clear replaces the held Dsv with a fresh empty one', () => {
    const current = useCurrentStore()
    const dsv = new Dsv()
    dsv.name = 'pokemon.dsv'
    current.update(dsv)

    current.clear()

    expect(current.dsv.name).toBe('-')
    expect(current.dsv.id).not.toBe(dsv.id)
  })
})
