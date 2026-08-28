import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, test } from 'vitest'

import Dsv from '~/models/Dsv'
import { useHistoryStore } from '~/stores/history'

/**
 * Builds a named Dsv.
 * @param name Name to give the Dsv.
 * @returns the Dsv.
 */
function named (name: string): Dsv {
  const dsv = new Dsv()
  dsv.name = name
  return dsv
}

describe('history store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  test('starts empty', () => {
    expect(useHistoryStore().dsvs).toEqual([])
  })

  test('add appends in order', () => {
    const history = useHistoryStore()
    history.add(named('first'))
    history.add(named('second'))

    expect(history.dsvs.map((dsv: Dsv): string => dsv.name)).toEqual(['first', 'second'])
  })

  test('clear empties the list', () => {
    const history = useHistoryStore()
    history.add(named('first'))

    history.clear()

    expect(history.dsvs).toEqual([])
  })

  test('remove drops the matching Dsv and keeps the rest', () => {
    const history = useHistoryStore()
    const first = named('first')
    const second = named('second')
    const third = named('third')
    history.add(first)
    history.add(second)
    history.add(third)

    history.remove(second)

    expect(history.dsvs.map((dsv: Dsv): string => dsv.name)).toEqual(['first', 'third'])
  })

  test('remove leaves the list untouched when the Dsv is absent', () => {
    const history = useHistoryStore()
    history.add(named('first'))

    history.remove(named('never added'))

    expect(history.dsvs.map((dsv: Dsv): string => dsv.name)).toEqual(['first'])
  })
})
