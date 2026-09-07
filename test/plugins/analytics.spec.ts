import { afterEach, beforeEach, describe, expect, test } from 'vitest'

import { createPageViewReporter, installGtag, isTrackedHost, sendPageView } from '~/plugins/analytics.client'

/**
 * Points the document at a URL, since happy-dom's `location` is read only in
 * the parts the page view reads.
 * @param href URL the page should look like it was served from.
 */
function serveFrom (href: string): void {
  window.happyDOM?.setURL?.(href)
}

/**
 * Every command gtag.js was handed, as plain arrays.
 * @returns the queued commands, oldest first.
 */
function commands (): unknown[][] {
  return (window.dataLayer ?? []).map((entry: unknown): unknown[] => Array.from(entry as ArrayLike<unknown>))
}

beforeEach(() => {
  delete window.dataLayer
  delete window.gtag
  for (const script of document.head.querySelectorAll('script')) {
    script.remove()
  }
})

afterEach(() => {
  serveFrom('http://localhost:3000/')
})

describe('isTrackedHost', () => {
  test('reports from the published site', () => {
    expect(isTrackedHost('dsv.albertowd.dev')).toBe(true)
    expect(isTrackedHost('albertowd.github.io')).toBe(true)
  })

  test('stays quiet on the development machine', () => {
    expect(isTrackedHost('localhost')).toBe(false)
    expect(isTrackedHost('LOCALHOST')).toBe(false)
    expect(isTrackedHost('127.0.0.1')).toBe(false)
    expect(isTrackedHost('0.0.0.0')).toBe(false)
    expect(isTrackedHost('[::1]')).toBe(false)
    expect(isTrackedHost('::1')).toBe(false)
  })

  test('stays quiet on a dev server reached over the LAN', () => {
    expect(isTrackedHost('192.168.1.42')).toBe(false)
    expect(isTrackedHost('10.0.0.7')).toBe(false)
    expect(isTrackedHost('172.16.4.1')).toBe(false)
    expect(isTrackedHost('172.31.255.254')).toBe(false)
    expect(isTrackedHost('169.254.10.1')).toBe(false)
  })

  test('keeps public addresses the private ranges sit next to', () => {
    expect(isTrackedHost('172.15.0.1')).toBe(true)
    expect(isTrackedHost('172.32.0.1')).toBe(true)
    expect(isTrackedHost('9.10.0.1')).toBe(true)
  })

  test('keeps a domain that merely starts like a private address', () => {
    expect(isTrackedHost('10.example.com')).toBe(true)
    expect(isTrackedHost('192.168.dsv.example')).toBe(true)
  })

  test('stays quiet on names that only resolve locally', () => {
    expect(isTrackedHost('dsv.localhost')).toBe(false)
    expect(isTrackedHost('macbook.local')).toBe(false)
    expect(isTrackedHost('dsv.test')).toBe(false)
  })

  test('stays quiet with no hostname at all, as a file:// document has', () => {
    expect(isTrackedHost('')).toBe(false)
  })
})

describe('installGtag', () => {
  test('loads the library for the given property', () => {
    installGtag('G-TEST123')

    const script = document.head.querySelector('script')
    expect(script?.src).toBe('https://www.googletagmanager.com/gtag/js?id=G-TEST123')
    expect(script?.async).toBe(true)
  })

  test('configures the property with the automatic page view off', () => {
    installGtag('G-TEST123')

    expect(commands()[0]?.[0]).toBe('js')
    expect(commands()[1]).toEqual(['config', 'G-TEST123', { send_page_view: false }])
  })

  test('queues commands before the library has loaded', () => {
    installGtag('G-TEST123')
    window.gtag?.('event', 'anything')

    expect(commands().at(-1)).toEqual(['event', 'anything'])
  })

  test('keeps a queue another tag already started', () => {
    window.dataLayer = [['event', 'earlier']]
    installGtag('G-TEST123')

    expect(commands()[0]).toEqual(['event', 'earlier'])
    expect(commands()).toHaveLength(3)
  })
})

describe('sendPageView', () => {
  test('reports the page on screen', () => {
    installGtag('G-TEST123')
    serveFrom('https://dsv.albertowd.dev/convert?from=dsv')
    document.title = 'DSVTool - DSV Tool'

    sendPageView()

    expect(commands().at(-1)).toEqual(['event', 'page_view', {
      page_path: '/convert?from=dsv',
      page_location: 'https://dsv.albertowd.dev/convert?from=dsv',
      page_title: 'DSVTool - DSV Tool'
    }])
  })

  test('keeps the base path a subpath deployment is served under', () => {
    installGtag('G-TEST123')
    serveFrom('https://albertowd.github.io/dsv-tool/history')

    sendPageView()

    expect((commands().at(-1)?.[2] as { page_path: string }).page_path).toBe('/dsv-tool/history')
  })

  test('leaves out the fragment, which names a place within a page', () => {
    installGtag('G-TEST123')
    serveFrom('https://dsv.albertowd.dev/convert#footer')

    sendPageView()

    expect((commands().at(-1)?.[2] as { page_path: string }).page_path).toBe('/convert')
  })

  test('does nothing when the library was never installed', () => {
    serveFrom('https://dsv.albertowd.dev/')

    expect(() => sendPageView()).not.toThrow()
    expect(window.dataLayer).toBeUndefined()
  })
})

describe('createPageViewReporter', () => {
  /**
   * The page views reported so far.
   * @returns each view's path, in the order they were sent.
   */
  function reportedPaths (): string[] {
    return commands()
      .filter((command: unknown[]): boolean => command[1] === 'page_view')
      .map((command: unknown[]): string => (command[2] as { page_path: string }).page_path)
  }

  test('reports each route the visit walks', async () => {
    installGtag('G-TEST123')
    const report = createPageViewReporter()

    for (const path of ['/', '/convert', '/history']) {
      serveFrom(`https://dsv.albertowd.dev${path}`)
      report(path)
      await nextTick()
    }

    expect(reportedPaths()).toEqual(['/', '/convert', '/history'])
  })

  test('counts the route landed on once, though it arrives twice', async () => {
    installGtag('G-TEST123')
    const report = createPageViewReporter()
    serveFrom('https://dsv.albertowd.dev/convert')

    // Mounting and the router both hand over the page the visit started on.
    report('/convert')
    report('/convert')
    await nextTick()

    expect(reportedPaths()).toEqual(['/convert'])
  })

  test('reports a return to a route visited earlier', async () => {
    installGtag('G-TEST123')
    const report = createPageViewReporter()

    for (const path of ['/', '/convert', '/']) {
      serveFrom(`https://dsv.albertowd.dev${path}`)
      report(path)
      await nextTick()
    }

    expect(reportedPaths()).toEqual(['/', '/convert', '/'])
  })

  test('waits a tick, so the title is the incoming page\'s', async () => {
    installGtag('G-TEST123')
    const report = createPageViewReporter()
    serveFrom('https://dsv.albertowd.dev/history')
    document.title = 'Previous page'

    report('/history')
    // Where `useHead` applies the incoming page's title.
    document.title = 'History - DSV Tool'
    await nextTick()

    expect((commands().at(-1)?.[2] as { page_title: string }).page_title).toBe('History - DSV Tool')
  })
})
