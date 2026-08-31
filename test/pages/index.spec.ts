import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, test } from 'vitest'
import { VBtn, VImg } from 'vuetify/components'

import HomePage from '~/pages/index.vue'

describe('home page', () => {
  test('names the tool and describes what it does', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(wrapper.find('h1').text()).toBe('DSV Tool')
    expect(wrapper.text()).toContain('DeSmuME/DraStic')
  })

  test('routes into the converter and the history', async () => {
    const wrapper = await mountSuspended(HomePage)
    const targets = wrapper.findAllComponents(VBtn).map((button): unknown => button.props('to'))

    expect(targets).toContain('/convert')
    expect(targets).toContain('/history')
  })

  test('lists what the tool offers', async () => {
    const wrapper = await mountSuspended(HomePage)
    const text = wrapper.text()

    expect(text).toContain('Stays on your device')
    expect(text).toContain('Import and export')
    expect(text).toContain('Keep a history')
  })

  test('leads with the cartridge icon, marked decorative', async () => {
    const wrapper = await mountSuspended(HomePage)
    const image = wrapper.findComponent(VImg)

    expect(image.exists()).toBe(true)
    expect(image.props('src')).toBe('/hero.webp')
    // The heading carries the name, so the artwork must not repeat it.
    expect(image.props('alt')).toBe('')
  })

  test('keeps the name as a heading for assistive tech', async () => {
    const wrapper = await mountSuspended(HomePage)

    expect(wrapper.find('h1').classes()).toContain('d-sr-only')
  })
})
