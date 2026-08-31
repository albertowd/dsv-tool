import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import ImportSaves from '~/components/ImportSaves/ImportSaves.vue'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer, toFile } from '../helpers/dsv'

interface ImportSavesVm {
  importSaves: (scan: { files: File[], truncated: boolean }) => Promise<void>
  scanFolder: () => Promise<void>
  pickFiles: (event: Event) => Promise<void>
  browse: () => void
  canPickFolder: boolean
  outcome: unknown
  outcomeMessage: string
  outcomeType: string
  showOutcome: boolean
}

/**
 * Stands a directory tree up as the File System Access API hands one over.
 * @param names Save names the directory holds.
 * @returns the handle.
 */
function directoryOf (names: string[]): object {
  return {
    kind: 'directory',
    name: 'card',
    values: async function * () {
      for (const name of names) {
        yield {
          kind: 'file',
          name,
          getFile: () => Promise.resolve(save(name))
        }
      }
    }
  }
}

/**
 * Builds a save file of the given name.
 * @param name File name to carry.
 * @returns the file.
 */
function save (name: string): File {
  return toFile(buildDsvBuffer(), name)
}

describe('ImportSaves', () => {
  beforeEach(() => {
    useHistoryStore().clear()
  })

  test('files every save it is handed into the history', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    await vm.importSaves({ files: [save('one.dsv'), save('two.sav')], truncated: false })

    expect(useHistoryStore().dsvs.map(d => d.name)).toEqual(['one.dsv', 'two.sav'])
    expect(vm.outcomeMessage).toBe('Imported 2 saves.')
    expect(vm.outcomeType).toBe('success')
  })

  test('counts a save the history already holds instead of doubling it', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    // Rescanning the same card should not stack up copies.
    await vm.importSaves({ files: [save('one.dsv')], truncated: false })
    await vm.importSaves({ files: [save('one.dsv')], truncated: false })

    expect(useHistoryStore().dsvs).toHaveLength(1)
    expect(vm.outcomeMessage).toBe('Imported 0 saves - 1 already in the list.')
  })

  test('says so when a folder holds no saves at all', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    await vm.importSaves({ files: [], truncated: false })

    expect(useHistoryStore().dsvs).toHaveLength(0)
    expect(vm.outcomeMessage).toBe('No .dsv or .sav files there.')
    expect(vm.outcomeType).toBe('info')
  })

  test('owns up to having stopped short of the end', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    await vm.importSaves({ files: [save('one.dsv')], truncated: true })

    expect(vm.outcomeMessage).toBe('Imported 1 save - stopped early, there were more.')
  })

  test('dismissing the result drops it rather than leaving it stale', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    await vm.importSaves({ files: [save('one.dsv')], truncated: false })
    expect(vm.showOutcome).toBe(true)

    vm.showOutcome = false
    await wrapper.vm.$nextTick()

    expect(vm.showOutcome).toBe(false)
  })
})

describe('ImportSaves through the directory picker', () => {
  beforeEach(() => {
    useHistoryStore().clear()
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'showDirectoryPicker')
  })

  test('scans the folder the user picks and files what it finds', async () => {
    Object.assign(window, {
      showDirectoryPicker: () => Promise.resolve(directoryOf(['one.dsv', 'rom.nds', 'two.sav']))
    })

    const wrapper = await mountSuspended(ImportSaves)
    await (wrapper.vm as unknown as ImportSavesVm).scanFolder()

    expect(useHistoryStore().dsvs.map(d => d.name)).toEqual(['one.dsv', 'two.sav'])
  })

  test('does nothing at all when the picker is dismissed', async () => {
    Object.assign(window, { showDirectoryPicker: () => Promise.reject(new Error('AbortError')) })

    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm
    await vm.scanFolder()

    expect(useHistoryStore().dsvs).toHaveLength(0)
    // No result message either: nothing was attempted.
    expect(vm.outcome).toBeNull()
  })

  test('takes the folder input where there is no picker', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm
    expect(vm.canPickFolder).toBe(false)

    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', {
      configurable: true,
      value: [save('one.dsv'), save('notes.txt')]
    })
    await vm.pickFiles({ target: input } as unknown as Event)

    expect(useHistoryStore().dsvs.map(d => d.name)).toEqual(['one.dsv'])
  })

  test('ignores an empty selection from the folder input', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const vm = wrapper.vm as unknown as ImportSavesVm

    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    Object.defineProperty(input, 'files', { configurable: true, value: [] })
    await vm.pickFiles({ target: input } as unknown as Event)

    expect(useHistoryStore().dsvs).toHaveLength(0)
    expect(vm.outcome).toBeNull()
  })

  test('opens the folder input when there is nothing else to open', async () => {
    const wrapper = await mountSuspended(ImportSaves)
    const input = wrapper.find('input[type="file"]').element as HTMLInputElement
    const click = vi.spyOn(input, 'click').mockImplementation(() => {})

    ;(wrapper.vm as unknown as ImportSavesVm).browse()

    expect(click).toHaveBeenCalled()
  })
})
