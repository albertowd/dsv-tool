import { mountSuspended } from '@nuxt/test-utils/runtime'
import { beforeEach, describe, expect, test } from 'vitest'

import CartridgeInfo from '~/components/CartridgeInfo/CartridgeInfo.vue'
import Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'
import { buildDsvBuffer } from '../helpers/dsv'
import { bufferToDsvInfo } from '~/plugins/dsv-tools.client'

/**
 * Builds a fully populated Dsv, as a parsed file would produce.
 * @returns the Dsv.
 */
function loadedDsv (): Dsv {
  const dsv = new Dsv()
  dsv.name = 'pokemon.dsv'
  dsv.size = 524_288
  dsv.lastModified = 1_700_000_000_000
  dsv.info = bufferToDsvInfo(buildDsvBuffer({
    actuallyWrittenSize: 2048,
    addressSize: 24,
    header: 'HEADER',
    paddedSize: 1024,
    saveSize: 4096,
    saveType: 3,
    versionNumber: 1
  }))
  return dsv
}

describe('CartridgeInfo', () => {
  beforeEach(() => {
    // `@pinia/nuxt` owns the active Pinia inside the Nuxt test app, so reset the
    // stores it hands out rather than installing a fresh instance.
    useCurrentStore().clear()
    useHistoryStore().clear()
  })

  test('shows the current Dsv by default', async () => {
    useCurrentStore().update(loadedDsv())

    const wrapper = await mountSuspended(CartridgeInfo)

    expect(wrapper.text()).toContain('pokemon.dsv')
  })

  test('renders the footer fields, converting byte counts to kb', async () => {
    useCurrentStore().update(loadedDsv())

    const text = (await mountSuspended(CartridgeInfo)).text()

    expect(text).toContain('2 kb')   // actuallyWrittenSize 2048
    expect(text).toContain('1 kb')   // paddedSize 1024
    expect(text).toContain('4 kb')   // saveSize 4096
    expect(text).toContain('HEADER')
    expect(text).toContain('|-DESMUME SAVE-|')
  })

  test('reads from history when given an index', async () => {
    const dsv = loadedDsv()
    dsv.name = 'from-history.dsv'
    useHistoryStore().add(dsv)

    const wrapper = await mountSuspended(CartridgeInfo, { props: { dsvIndex: 0 } })

    expect(wrapper.text()).toContain('from-history.dsv')
  })

  test('renders nothing when the history index is empty', async () => {
    const wrapper = await mountSuspended(CartridgeInfo, { props: { dsvIndex: 5 } })

    expect(wrapper.text()).toBe('')
  })
})
