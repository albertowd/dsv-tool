import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test } from 'vitest'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import HistoryPage from '~/pages/history/index.vue'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

/**
 * Builds a Dsv that counts as loaded.
 * @param name File name.
 * @returns the Dsv.
 */
function named (name: string): Dsv {
  const dsv = new Dsv()
  dsv.name = name
  dsv.size = 1024
  return dsv
}

describe('history page', () => {
  beforeEach(() => {
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('explains itself while the history is empty', async () => {
    const wrapper = await mountSuspended(HistoryPage)

    expect(wrapper.findAllComponents(CartridgeCard)).toHaveLength(0)
    expect(wrapper.text()).toContain('No saves loaded yet')
  })

  test('renders one card per stored save, indexed in order', async () => {
    const history = useHistoryStore()
    history.add(named('first.dsv'))
    history.add(named('second.dsv'))

    const wrapper = await mountSuspended(HistoryPage)
    const cards = wrapper.findAllComponents(CartridgeCard)

    expect(cards).toHaveLength(2)
    expect(cards.map((card): number => card.props('dsvIndex'))).toEqual([0, 1])
    expect(wrapper.text()).toContain('first.dsv')
    expect(wrapper.text()).toContain('second.dsv')
  })

  test('never renders the encoded payload', async () => {
    // A 512 KB save is ~700k base64 characters; putting that in the DOM would
    // lock the page up.
    const dsv = named('big.dsv')
    dsv.base64 = 'QUJDREVGR0hJSktMTU5PUA=='
    useHistoryStore().add(dsv)

    const wrapper = await mountSuspended(HistoryPage)

    expect(wrapper.text()).not.toContain(dsv.base64)
  })

  test('clear empties the history', async () => {
    const history = useHistoryStore()
    history.add(named('first.dsv'))

    const wrapper = await mountSuspended(HistoryPage)
    const clear = wrapper.findAll('button').find((b): boolean => b.text().includes('Clear'))
    await clear!.trigger('click')

    expect(history.dsvs).toEqual([])
  })

  test('disables clear while there is nothing to clear', async () => {
    const wrapper = await mountSuspended(HistoryPage)
    const clear = wrapper.findAll('button').find((b): boolean => b.text().includes('Clear'))

    expect(clear!.attributes('disabled')).toBeDefined()
  })
})
