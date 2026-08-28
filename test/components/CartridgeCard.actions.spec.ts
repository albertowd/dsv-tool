import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import { bufferToDsvInfo, isDsv } from '~/plugins/dsv-tools.client'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer } from '../helpers/dsv'

interface Download { name: string, blob: Blob }

/**
 * Captures whatever the component hands to the browser as a download.
 * @returns the captured download, filled in once a button is clicked.
 */
function captureDownload (): Partial<Download> {
  const captured: Partial<Download> = {}
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob: Blob | MediaSource): string => {
    captured.blob = blob as Blob
    return 'blob:stub'
  })
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation((): void => {})
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement): void {
    captured.name = this.download
  })
  return captured
}

/**
 * Builds a loaded Dsv from raw bytes.
 * @param bytes Content of the file.
 * @param name File name.
 * @returns the Dsv.
 */
function loaded (bytes: Uint8Array, name: string): Dsv {
  const dsv = new Dsv()
  dsv.name = name
  dsv.size = bytes.length
  dsv.base64 = btoa(String.fromCodePoint(...bytes))
  if (isDsv(bytes)) {
    dsv.info = bufferToDsvInfo(bytes)
  }
  return dsv
}

describe('CartridgeCard actions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('disables every action while nothing is loaded', async () => {
    const wrapper = await mountSuspended(CartridgeCard)
    const disabled = wrapper.findAll('button').map((b): boolean => b.attributes('disabled') !== undefined)

    expect(disabled).toEqual([true, true, true])
  })

  test('enables the actions once a save is loaded', async () => {
    useCurrentStore().update(loaded(buildDsvBuffer(), 'pokemon.dsv'))

    const wrapper = await mountSuspended(CartridgeCard)
    const disabled = wrapper.findAll('button').map((b): boolean => b.attributes('disabled') !== undefined)

    expect(disabled).toEqual([false, false, false])
  })

  test('exports a loaded DSV as a raw save, footer stripped', async () => {
    useCurrentStore().update(loaded(buildDsvBuffer({ header: '', paddedSize: 1024 }), 'pokemon.dsv'))
    const captured = captureDownload()

    const wrapper = await mountSuspended(CartridgeCard)
    await wrapper.findAll('button')[2]!.trigger('click')

    expect(captured.name).toBe('pokemon.sav')
    const bytes = new Uint8Array(await captured.blob!.arrayBuffer())
    expect(bytes).toHaveLength(1024)
    expect(isDsv(bytes)).toBe(false)
  })

  test('exports a loaded raw save as a DSV, footer added', async () => {
    useCurrentStore().update(loaded(new Uint8Array(512).fill(7), 'pokemon.sav'))
    const captured = captureDownload()

    const wrapper = await mountSuspended(CartridgeCard)
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(captured.name).toBe('pokemon.dsv')
    const bytes = new Uint8Array(await captured.blob!.arrayBuffer())
    expect(isDsv(bytes)).toBe(true)
    expect(bufferToDsvInfo(bytes).paddedSize).toBe(512)
  })

  test('exporting a DSV as a DSV hands back the original bytes', async () => {
    const original = buildDsvBuffer({ header: '', paddedSize: 256 })
    useCurrentStore().update(loaded(original, 'pokemon.dsv'))
    const captured = captureDownload()

    const wrapper = await mountSuspended(CartridgeCard)
    await wrapper.findAll('button')[1]!.trigger('click')

    expect(new Uint8Array(await captured.blob!.arrayBuffer())).toEqual(original)
  })

  test('delete clears the converter', async () => {
    useCurrentStore().update(loaded(buildDsvBuffer(), 'pokemon.dsv'))

    const wrapper = await mountSuspended(CartridgeCard)
    await wrapper.findAll('button')[0]!.trigger('click')

    expect(useCurrentStore().dsv.name).toBe('-')
  })

  test('delete drops just that entry from the history', async () => {
    const history = useHistoryStore()
    history.add(loaded(buildDsvBuffer(), 'first.dsv'))
    history.add(loaded(buildDsvBuffer(), 'second.dsv'))

    const wrapper = await mountSuspended(CartridgeCard, { props: { dsvIndex: 0 } })
    await wrapper.findAll('button')[0]!.trigger('click')

    expect(history.dsvs.map((d: Dsv): string => d.name)).toEqual(['second.dsv'])
  })
})
