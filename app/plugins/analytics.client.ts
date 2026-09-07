/**
 * Reports page views to Google Analytics.
 *
 * Two things make this more than pasting Google's snippet into the head.
 *
 * The app renders on the client and routes there too, so the document is
 * loaded once and never again: gtag.js would count a single page view for a
 * visit that walked every route. GA4's enhanced measurement can watch the
 * history API for that, but it fires the moment the URL changes - before Vue
 * has swapped the page or applied its head - so the view arrives labelled with
 * the previous page's title. The automatic view is turned off here
 * (`send_page_view: false`) and one is sent per navigation instead, on the
 * tick after the route settles, when the title belongs to the page that is
 * actually on screen.
 *
 * And a development machine must not report at all, or local runs of the same
 * build would inflate the published site's numbers. That is decided from the
 * hostname rather than a build flag, because `npm run generate` produces the
 * same bundle that gets published and it is regularly served locally with
 * `npx serve` to check the real thing.
 */

/** The gtag.js loader, which takes the measurement ID as its query. */
const GTAG_SRC: string = 'https://www.googletagmanager.com/gtag/js?id='

/** Names a browser resolves to the machine the page is being served from. */
const LOCAL_HOSTNAMES: ReadonlySet<string> = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]'])

/** A hostname that is a literal IPv4 address rather than a name. */
const IPV4: RegExp = /^\d{1,3}(?:\.\d{1,3}){3}$/

/**
 * Addresses that only exist inside one network: loopback, the three private
 * IPv4 ranges, and the link-local block a machine gives itself with no DHCP.
 * A dev server bound to the LAN so a phone can reach it lands here. Only ever
 * asked of an `IPV4` host, so a domain that happens to start with digits -
 * `10.example.com` - is not caught by it.
 */
const PRIVATE_IPV4: RegExp = /^(?:10\.|127\.|169\.254\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/

/** Suffixes for a host that is only nameable on the local network. */
const LOCAL_SUFFIXES: readonly string[] = ['.localhost', '.local', '.test', '.internal']

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

/**
 * Tells whether a hostname is the published site rather than a local one.
 * @param hostname Hostname the page is served from, as `location.hostname`.
 * @returns whether page views from it should be reported.
 */
export function isTrackedHost (hostname: string): boolean {
  const host: string = hostname.toLowerCase()

  // A file:// document has no hostname, and neither does an about:blank frame.
  if (!host) {
    return false
  }
  if (LOCAL_HOSTNAMES.has(host) || (IPV4.test(host) && PRIVATE_IPV4.test(host))) {
    return false
  }
  return !LOCAL_SUFFIXES.some((suffix: string): boolean => host.endsWith(suffix))
}

/**
 * Loads gtag.js and configures the property, once per document.
 *
 * The queue is seeded before the script arrives, which is the point of the
 * shape Google's snippet uses: commands pushed now are replayed in order as
 * soon as the library loads, so nothing has to wait for the network.
 * @param id Measurement ID of the GA4 property.
 */
export function installGtag (id: string): void {
  const queue: unknown[] = window.dataLayer ?? (window.dataLayer = [])

  if (!window.gtag) {
    window.gtag = function gtag (): void {
      // gtag.js reads each command as the `arguments` object the snippet
      // pushes; a rest array is not the same thing to it.
      // eslint-disable-next-line prefer-rest-params
      queue.push(arguments)
    }
  }

  window.gtag('js', new Date())
  // Page views are sent by hand, once the route and its head have settled.
  window.gtag('config', id, { send_page_view: false })

  const script: HTMLScriptElement = document.createElement('script')
  script.async = true
  script.src = `${GTAG_SRC}${encodeURIComponent(id)}`
  document.head.appendChild(script)
}

/**
 * Reports the page currently on screen.
 *
 * Read from `location` rather than from the route, so the path carries the
 * base URL the site is served under and matches what a server log would show.
 */
export function sendPageView (): void {
  window.gtag?.('event', 'page_view', {
    // The fragment identifies a place within a page, not a page of its own.
    page_path: `${window.location.pathname}${window.location.search}`,
    page_location: window.location.href,
    page_title: document.title
  })
}

/**
 * Builds the per-navigation reporter.
 *
 * It is handed the same route twice at startup - once by mounting, once by the
 * router - and remembering the last one reported is what keeps a visit's first
 * page from being counted twice.
 * @returns a function to call with the route just navigated to.
 */
export function createPageViewReporter (): (fullPath: string) => void {
  let reported: string | null = null

  return (fullPath: string): void => {
    if (fullPath === reported) {
      return
    }
    reported = fullPath
    // `useHead` applies on the tick after a navigation resolves, so until then
    // the title is still the previous page's.
    void nextTick(sendPageView)
  }
}

export default defineNuxtPlugin((nuxtApp) => {
  const id: string = String(nuxtApp.$config.public.gtagId ?? '')
  if (!id || !isTrackedHost(window.location.hostname)) {
    return
  }

  installGtag(id)

  const router = useRouter()
  const report: (fullPath: string) => void = createPageViewReporter()

  // The initial navigation is over before user plugins run, so `afterEach`
  // only ever sees the ones after it; mounting covers the page landed on.
  router.afterEach((to): void => report(to.fullPath))
  nuxtApp.hook('app:mounted', (): void => report(router.currentRoute.value.fullPath))
})
