import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import CartridgeInput from '~/components/CartridgeInput/CartridgeInput.vue'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer, toFile } from '../helpers/dsv'

/**
 * Dispatches a drop carrying the given files.
 * @param target Element to drop onto.
 * @param files Files the drag payload should expose.
 */
function drop (target: Element, files: File[]): void {
  const event = new Event('drop', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', { value: { files } })
  target.dispatchEvent(event)
}

describe('CartridgeInput drag and drop', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('loads a save dropped onto the cartridge', async () => {
    const wrapper = await mountSuspended(CartridgeInput)

    drop(wrapper.element, [toFile(buildDsvBuffer(), 'dropped.dsv')])

    await vi.waitFor(() => {
      expect(useCurrentStore().dsv.name).toBe('dropped.dsv')
    })
  })

  test('takes only the first of several dropped files', async () => {
    const wrapper = await mountSuspended(CartridgeInput)

    drop(wrapper.element, [
      toFile(buildDsvBuffer(), 'first.dsv'),
      toFile(buildDsvBuffer(), 'second.dsv')
    ])

    await vi.waitFor(() => {
      expect(useCurrentStore().dsv.name).toBe('first.dsv')
    })
  })

  test('ignores a drop carrying no file', async () => {
    const wrapper = await mountSuspended(CartridgeInput)

    drop(wrapper.element, [])

    expect(useCurrentStore().dsv.name).toBe('-')
  })

  test('highlights the cartridge while a file is dragged over it', async () => {
    const wrapper = await mountSuspended(CartridgeInput)

    await wrapper.trigger('dragenter')
    expect(wrapper.classes()).toContain('cartridge-dragging')

    await wrapper.trigger('dragleave')
    expect(wrapper.classes()).not.toContain('cartridge-dragging')
  })

  test('clears the highlight after a drop', async () => {
    const wrapper = await mountSuspended(CartridgeInput)
    await wrapper.trigger('dragenter')

    drop(wrapper.element, [toFile(buildDsvBuffer(), 'dropped.dsv')])
    await wrapper.vm.$nextTick()

    expect(wrapper.classes()).not.toContain('cartridge-dragging')
  })
})

