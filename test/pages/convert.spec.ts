import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test } from 'vitest'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import ConvertPage from '~/pages/convert/index.vue'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

describe('convert page', () => {
  beforeEach(() => {
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('shows a single cartridge bound to the current Dsv', async () => {
    const wrapper = await mountSuspended(ConvertPage)
    const cards = wrapper.findAllComponents(CartridgeCard)

    expect(cards).toHaveLength(1)
    expect(cards[0]!.props('dsvIndex')).toBe(-1)
  })

  test('surfaces the loaded save through the card', async () => {
    const dsv = new Dsv()
    dsv.name = 'pokemon.dsv'
    dsv.size = 524_288
    useCurrentStore().update(dsv)

    const wrapper = await mountSuspended(ConvertPage)

    expect(wrapper.text()).toContain('pokemon.dsv')
  })
})
