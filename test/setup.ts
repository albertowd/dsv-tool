import { vi } from 'vitest'

// happy-dom implements neither of these, and Vuetify's overlay/layout
// composables reach for them as soon as a `v-overlay` or `v-img` renders.
if (!('visualViewport' in window) || window.visualViewport === null) {
  Object.defineProperty(window, 'visualViewport', {
    configurable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
      height: 768,
      width: 1024,
      offsetLeft: 0,
      offsetTop: 0,
      pageLeft: 0,
      pageTop: 0,
      scale: 1
    },
    writable: true
  })
}

if (!('ResizeObserver' in window)) {
  window.ResizeObserver = class {
    observe (): void {}
    unobserve (): void {}
    disconnect (): void {}
  } as unknown as typeof ResizeObserver
}

// happy-dom omits the drag and drop reflected properties, so the capability
// probe in `FileDrop` would decide a real browser cannot drag and drop.
for (const [property, value] of [['draggable', false], ['ondragstart', null], ['ondrop', null]] as const) {
  if (!(property in HTMLElement.prototype)) {
    Object.defineProperty(HTMLElement.prototype, property, {
      configurable: true,
      value,
      writable: true
    })
  }
}

// Vuetify's `v-img` renders through the `v-intersect` directive, which is a
// no-op without an IntersectionObserver; happy-dom does not ship one.
if (!('IntersectionObserver' in window)) {
  window.IntersectionObserver = class {
    observe (): void {}
    unobserve (): void {}
    disconnect (): void {}
    takeRecords (): IntersectionObserverEntry[] {
      return []
    }
  } as unknown as typeof IntersectionObserver
}

// happy-dom has no object-URL support, and the download path builds one.
// Defined rather than mocked so tests can spy on it.
if (typeof URL.createObjectURL !== 'function') {
  URL.createObjectURL = (): string => 'blob:stub'
  URL.revokeObjectURL = (): void => {}
}
