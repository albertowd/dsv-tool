import { mountSuspended } from '@nuxt/test-utils/runtime'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import ExportSaves from '~/components/ExportSaves/ExportSaves.vue'
import Dsv from '~/models/Dsv'
import { bufferToDsvInfo, isDsv } from '~/plugins/dsv-tools.client'
import type { OutgoingSave } from '~/plugins/save-folder.client'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer } from '../helpers/dsv'

interface ExportSavesVm {
  outgoing: (format: 'dsv' | 'sav') => OutgoingSave[]
  exportAll: (format: 'dsv' | 'sav') => Promise<void>
  empty: boolean
  outcome: unknown
  outcomeMessage: string
  outcomeType: string
}

/**
 * Stands a writable directory up, recording what lands in it.
 * @returns the handle and the files it collected.
 */
function writableDirectory (): { handle: object, written: Map<string, Uint8Array> } {
  const written = new Map<string, Uint8Array>()
  const handle = {
    kind: 'directory',
    name: 'destination',
    getFileHandle: (name: string) => Promise.resolve({
      kind: 'file',
      name,
      createWritable: () => Promise.resolve({
        getWriter: () => ({
          write: (bytes: Uint8Array) => {
            written.set(name, bytes)
            return Promise.resolve()
          },
          close: () => Promise.resolve()
        })
      })
    })
  }
  return { handle, written }
}

/**
 * Encodes bytes the way the model stores them.
 * @param bytes Bytes to hold.
 * @returns the base64.
 */
function toBase64 (bytes: Uint8Array): string {
  let binary: string = ''
  for (const byte of bytes) {
    binary += String.fromCodePoint(byte)
  }
  return btoa(binary)
}

/**
 * Stores a save in the history.
 * @param name File name.
 * @param bytes Contents.
 * @returns the stored model.
 */
function store (name: string, bytes: Uint8Array): Dsv {
  const dsv = new Dsv()
  dsv.name = name
  dsv.size = bytes.length
  dsv.base64 = toBase64(bytes)
  if (isDsv(bytes)) {
    dsv.info = bufferToDsvInfo(bytes)
  }
  useHistoryStore().add(dsv)
  return dsv
}

describe('ExportSaves', () => {
  beforeEach(() => {
    useHistoryStore().clear()
  })

  test('has nothing to offer while the list is empty', async () => {
    const wrapper = await mountSuspended(ExportSaves)

    expect((wrapper.vm as unknown as ExportSavesVm).empty).toBe(true)
    expect((wrapper.vm as unknown as ExportSavesVm).outgoing('dsv')).toEqual([])
  })

  test('gives every save a DSV footer and a .dsv name', async () => {
    store('raw.sav', new Uint8Array(512).fill(7))
    store('already.dsv', buildDsvBuffer())

    const wrapper = await mountSuspended(ExportSaves)
    const outgoing = (wrapper.vm as unknown as ExportSavesVm).outgoing('dsv')

    expect(outgoing.map(s => s.name)).toEqual(['raw.dsv', 'already.dsv'])
    for (const save of outgoing) {
      expect(isDsv(save.bytes)).toBe(true)
    }
  })

  test('strips the footer for a raw export and renames to .sav', async () => {
    store('already.dsv', buildDsvBuffer())

    const wrapper = await mountSuspended(ExportSaves)
    const outgoing = (wrapper.vm as unknown as ExportSavesVm).outgoing('sav')

    expect(outgoing.map(s => s.name)).toEqual(['already.sav'])
    expect(isDsv(outgoing[0]!.bytes)).toBe(false)
  })

  test('leaves a raw save untouched when exporting raw', async () => {
    const bytes = new Uint8Array(512).fill(7)
    store('raw.sav', bytes)

    const wrapper = await mountSuspended(ExportSaves)
    const outgoing = (wrapper.vm as unknown as ExportSavesVm).outgoing('sav')

    expect(outgoing[0]!.bytes).toEqual(bytes)
  })

  test('skips an entry that holds no bytes', async () => {
    // A failed load is recorded with an empty payload; there is nothing to write.
    useHistoryStore().add(new Dsv())
    store('raw.sav', new Uint8Array(512).fill(7))

    const wrapper = await mountSuspended(ExportSaves)

    expect((wrapper.vm as unknown as ExportSavesVm).outgoing('dsv').map(s => s.name))
      .toEqual(['raw.dsv'])
  })
})

describe('ExportSaves writing', () => {
  beforeEach(() => {
    useHistoryStore().clear()
  })

  afterEach(() => {
    Reflect.deleteProperty(window, 'showDirectoryPicker')
    vi.restoreAllMocks()
  })

  test('writes every save into the folder the user picks', async () => {
    store('raw.sav', new Uint8Array(512).fill(7))
    const { handle, written } = writableDirectory()
    Object.assign(window, { showDirectoryPicker: () => Promise.resolve(handle) })

    const wrapper = await mountSuspended(ExportSaves)
    const vm = wrapper.vm as unknown as ExportSavesVm
    await vm.exportAll('dsv')

    expect([...written.keys()]).toEqual(['raw.dsv'])
    expect(isDsv(written.get('raw.dsv')!)).toBe(true)
    expect(vm.outcomeMessage).toBe('Exported 1 save.')
    expect(vm.outcomeType).toBe('success')
  })

  test('writes nothing when the picker is dismissed', async () => {
    store('raw.sav', new Uint8Array(512).fill(7))
    Object.assign(window, { showDirectoryPicker: () => Promise.reject(new Error('AbortError')) })

    const wrapper = await mountSuspended(ExportSaves)
    const vm = wrapper.vm as unknown as ExportSavesVm
    await vm.exportAll('dsv')

    // Cancelling is not a fallback to downloading, and not a result to report.
    expect(vm.outcome).toBeNull()
  })

  test('falls back to downloads where there is no picker', async () => {
    store('one.sav', new Uint8Array(512).fill(7))
    store('two.sav', new Uint8Array(512).fill(9))

    // Same capture the cartridge's own download tests use: happy-dom rejects a
    // Blob built in another realm, so the object URL is stubbed out.
    const names: string[] = []
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stub')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation((): void => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement): void {
        names.push(this.download)
      })

    const wrapper = await mountSuspended(ExportSaves)
    const vm = wrapper.vm as unknown as ExportSavesVm
    await vm.exportAll('sav')

    expect(names).toEqual(['one.sav', 'two.sav'])
    expect(vm.outcomeMessage).toBe('Downloaded 2 saves.')
  })

  test('says so when a save could not be written', async () => {
    store('raw.sav', new Uint8Array(512).fill(7))
    Object.assign(window, {
      showDirectoryPicker: () => Promise.resolve({
        kind: 'directory',
        name: 'destination',
        getFileHandle: () => Promise.reject(new Error('read only'))
      })
    })

    const wrapper = await mountSuspended(ExportSaves)
    const vm = wrapper.vm as unknown as ExportSavesVm
    await vm.exportAll('dsv')

    expect(vm.outcomeMessage).toBe('Exported 0 saves - 1 could not be written.')
    expect(vm.outcomeType).toBe('error')
  })

  test('does not open a picker for an empty list', async () => {
    const picker = vi.fn(() => Promise.resolve(writableDirectory().handle))
    Object.assign(window, { showDirectoryPicker: picker })

    const wrapper = await mountSuspended(ExportSaves)
    await (wrapper.vm as unknown as ExportSavesVm).exportAll('dsv')

    expect(picker).not.toHaveBeenCalled()
  })
})
