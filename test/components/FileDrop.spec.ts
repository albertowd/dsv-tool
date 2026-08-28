import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import FileDrop from '~/components/FileDrop/index.vue'
import { buildDsvBuffer, toFile } from '../helpers/dsv'

interface FileDropVm {
  dragAndDropCapable: boolean
  uploadedFile: File | null
}

/**
 * Dispatches a drop event carrying the given files.
 * @param target Element to drop onto.
 * @param files Files the drag payload should expose.
 */
function drop (target: Element, files: File[]): void {
  const event = new Event('drop', { bubbles: true, cancelable: true })
  Object.defineProperty(event, 'dataTransfer', { value: { files } })
  target.dispatchEvent(event)
}

describe('FileDrop', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('detects drag and drop support on mount', async () => {
    const wrapper = await mountSuspended(FileDrop)

    expect((wrapper.vm as unknown as FileDropVm).dragAndDropCapable).toBe(true)
  })

  test('accepts only DSV and SAV files', async () => {
    const wrapper = await mountSuspended(FileDrop)

    expect(wrapper.find('input[type="file"]').attributes('accept')).toBe('.dsv,.sav')
  })

  test('starts with no file picked', async () => {
    const wrapper = await mountSuspended(FileDrop)

    expect((wrapper.vm as unknown as FileDropVm).uploadedFile).toBeNull()
  })

  test('takes the first dropped file', async () => {
    const wrapper = await mountSuspended(FileDrop)
    const first = toFile(buildDsvBuffer(), 'first.dsv')

    drop(wrapper.element, [first, toFile(buildDsvBuffer(), 'second.dsv')])

    expect((wrapper.vm as unknown as FileDropVm).uploadedFile?.name).toBe('first.dsv')
  })

  test('ignores a drop that carries no file', async () => {
    const wrapper = await mountSuspended(FileDrop)

    drop(wrapper.element, [])

    expect((wrapper.vm as unknown as FileDropVm).uploadedFile).toBeNull()
  })

  test('suppresses the browser default for drag events', async () => {
    const wrapper = await mountSuspended(FileDrop)
    const event = new Event('dragover', { bubbles: true, cancelable: true })

    wrapper.element.dispatchEvent(event)

    expect(event.defaultPrevented).toBe(true)
  })
})
