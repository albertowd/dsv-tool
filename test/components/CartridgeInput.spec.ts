import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import CartridgeInput from '~/components/CartridgeInput/CartridgeInput.vue'
import Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer, toFile } from '../helpers/dsv'

interface CartridgeInputVm {
  cardType: string
  cartridgeImage: string
  changeCurrentDsv: (picked: File | File[] | null) => void
  gameIcon: string | null
  iconMissing: boolean
}

/**
 * Builds a Dsv that counts as loaded.
 * @param size Byte size to report.
 * @param name File name to report.
 * @returns the Dsv.
 */
function sized (size: number, name: string = '-'): Dsv {
  const dsv = new Dsv()
  dsv.size = size
  dsv.name = name
  return dsv
}

describe('CartridgeInput', () => {
  beforeEach(() => {
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('shows the grey cartridge while nothing is loaded', async () => {
    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    expect(vm.cardType).toBe('grey')
    expect(vm.cartridgeImage).toContain('grey')
  })

  test('switches to the gold cartridge once a save is loaded', async () => {
    useCurrentStore().update(sized(524_288))

    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    expect(vm.cardType).toBe('gold')
    expect(vm.cartridgeImage).toContain('gold')
  })

  test('reads from history when given an index', async () => {
    useHistoryStore().add(sized(524_288))

    const wrapper = await mountSuspended(CartridgeInput, { props: { dsvIndex: 0 } })

    expect((wrapper.vm as unknown as CartridgeInputVm).cardType).toBe('gold')
  })

  test('parsing a picked file updates the current store', async () => {
    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    vm.changeCurrentDsv(toFile(buildDsvBuffer({ saveType: 3 }), 'pokemon.dsv'))

    await vi.waitFor(() => {
      expect(useCurrentStore().dsv.name).toBe('pokemon.dsv')
    })
    expect(useCurrentStore().dsv.info.saveType).toBe(3)
  })

  test('takes the first file when the input yields a list', async () => {
    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    vm.changeCurrentDsv([toFile(buildDsvBuffer(), 'first.dsv'), toFile(buildDsvBuffer(), 'second.dsv')])

    await vi.waitFor(() => {
      expect(useCurrentStore().dsv.name).toBe('first.dsv')
    })
  })

  test('ignores an empty selection', async () => {
    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    vm.changeCurrentDsv(null)
    vm.changeCurrentDsv([])

    expect(useCurrentStore().dsv.name).toBe('-')
  })

  test('points the label at the game the save name names', async () => {
    useCurrentStore().update(sized(524_288, '4780 - Pokemon HeartGold Version (U).sav'))

    const wrapper = await mountSuspended(CartridgeInput)

    expect((wrapper.vm as unknown as CartridgeInputVm).gameIcon)
      .toContain('icons/pokemon-heartgold.webp')
  })

  test('leaves the label bare while nothing is loaded', async () => {
    const wrapper = await mountSuspended(CartridgeInput)

    expect((wrapper.vm as unknown as CartridgeInputVm).gameIcon).toBeNull()
  })

  test('leaves the label bare once the icon fails to load', async () => {
    useCurrentStore().update(sized(524_288, 'a save nobody named after a game.sav'))

    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm

    // The set cannot be consulted up front, so the miss only shows up as a
    // failed request; that is the signal the cartridge drops the icon on.
    vm.iconMissing = true
    await wrapper.vm.$nextTick()

    expect(vm.gameIcon).toBeNull()
  })

  test('gives a newly loaded save its own chance at an icon', async () => {
    useCurrentStore().update(sized(524_288, 'unknown.sav'))

    const wrapper = await mountSuspended(CartridgeInput)
    const vm = wrapper.vm as unknown as CartridgeInputVm
    vm.iconMissing = true
    await wrapper.vm.$nextTick()

    useCurrentStore().update(sized(524_288, 'Mario Kart DS.sav'))
    await vi.waitFor(() => {
      expect(vm.gameIcon).toContain('icons/mario-kart-ds.webp')
    })
  })
})
