import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test } from 'vitest'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import CartridgeInfo from '~/components/CartridgeInfo/CartridgeInfo.vue'
import CartridgeInput from '~/components/CartridgeInput/CartridgeInput.vue'
import Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

describe('CartridgeCard', () => {
  beforeEach(() => {
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('pairs the cartridge input with its info panel', async () => {
    const wrapper = await mountSuspended(CartridgeCard)

    expect(wrapper.findComponent(CartridgeInput).exists()).toBe(true)
    expect(wrapper.findComponent(CartridgeInfo).exists()).toBe(true)
  })

  test('defaults to the current Dsv', async () => {
    const wrapper = await mountSuspended(CartridgeCard)

    expect(wrapper.findComponent(CartridgeInput).props('dsvIndex')).toBe(-1)
    expect(wrapper.findComponent(CartridgeInfo).props('dsvIndex')).toBe(-1)
  })

  test('passes its history index down to both children', async () => {
    const dsv = new Dsv()
    dsv.name = 'from-history.dsv'
    useHistoryStore().add(dsv)

    const wrapper = await mountSuspended(CartridgeCard, { props: { dsvIndex: 0 } })

    expect(wrapper.findComponent(CartridgeInput).props('dsvIndex')).toBe(0)
    expect(wrapper.findComponent(CartridgeInfo).props('dsvIndex')).toBe(0)
    expect(wrapper.text()).toContain('from-history.dsv')
  })

  test('offers a delete action and both export formats', async () => {
    const wrapper = await mountSuspended(CartridgeCard)
    const text = wrapper.text()

    expect(text).toContain('.DSV')
    expect(text).toContain('.SAV')
    expect(wrapper.find('.mdi-delete').exists()).toBe(true)
  })
})
