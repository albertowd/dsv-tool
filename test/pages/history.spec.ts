import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test } from 'vitest'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import HistoryPage from '~/pages/history/index.vue'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

interface HistoryPageVm {
  addFile: () => void
  dsvs: Dsv[]
}

describe('history page', () => {
  beforeEach(() => {
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('renders no cards while the history is empty', async () => {
    const wrapper = await mountSuspended(HistoryPage)

    expect(wrapper.findAllComponents(CartridgeCard)).toHaveLength(0)
  })

  test('renders one card per stored Dsv, indexed in order', async () => {
    const history = useHistoryStore()
    const first = new Dsv()
    first.name = 'first.dsv'
    const second = new Dsv()
    second.name = 'second.dsv'
    history.add(first)
    history.add(second)

    const wrapper = await mountSuspended(HistoryPage)
    const cards = wrapper.findAllComponents(CartridgeCard)

    expect(cards).toHaveLength(2)
    expect(cards.map((card): number => card.props('dsvIndex'))).toEqual([0, 1])
    expect(wrapper.text()).toContain('first.dsv')
    expect(wrapper.text()).toContain('second.dsv')
  })

  test('addFile stores the Dsv it just named', async () => {
    const wrapper = await mountSuspended(HistoryPage)

    ;(wrapper.vm as unknown as HistoryPageVm).addFile()

    expect(useHistoryStore().dsvs.map((dsv: Dsv): string => dsv.name)).toEqual(['added dsv 0'])
  })

  test('addFile numbers each new entry from the current length', async () => {
    const wrapper = await mountSuspended(HistoryPage)
    const vm = wrapper.vm as unknown as HistoryPageVm

    vm.addFile()
    vm.addFile()
    vm.addFile()

    expect(useHistoryStore().dsvs.map((dsv: Dsv): string => dsv.name))
      .toEqual(['added dsv 0', 'added dsv 1', 'added dsv 2'])
  })
})
