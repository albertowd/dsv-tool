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
}

/**
 * Builds a Dsv that counts as loaded.
 * @param size Byte size to report.
 * @returns the Dsv.
 */
function sized (size: number): Dsv {
  const dsv = new Dsv()
  dsv.size = size
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
})
