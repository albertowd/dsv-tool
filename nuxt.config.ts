import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

import { version } from './package.json'

// A site served from a subpath rather than the domain root needs that prefix on
// every absolute asset path. Whatever publishes the build sets
// NUXT_APP_BASE_URL; locally it stays `/`.
const baseURL: string = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/?$/, '/')

// Vercel Analytics reports only from a Vercel deployment: the script it loads
// is served by the platform, so anywhere else that request 404s and the tag
// logs a console error for nothing. Vercel sets `VERCEL` on its build
// machines, so the module ships only in the builds it can work in.
const onVercel: boolean = process.env.VERCEL === '1'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-08-28',

  // Client-side only, pre-rendered to static files via `nuxt generate`.
  ssr: false,

  app: {
    baseURL,

    head: {
      titleTemplate: '%s - DSV Tool',
      title: 'DSVTool',
      // Without this the document has no language, which assistive tech and
      // search engines both need.
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'Convert Nintendo DS emulator saves between DSV (DeSmuME, DraStic) '
            + 'and raw .sav, and inspect the DSV footer. Runs entirely in your browser - '
            + 'nothing is uploaded.'
        },
        // Equivalents of the tags the Nuxt 2 PWA meta module used to inject.
        { name: 'theme-color', content: '#1976d2' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'DSVTool' }
      ],
      link: [
        // The home page's hero is its largest element, and with no server
        // render the browser cannot discover it until the bundle has booted.
        // Preloading starts it in parallel instead. Routing is client side, so
        // a visitor pays for this once, on the page that uses it.
        { rel: 'preload', as: 'image', type: 'image/webp', fetchpriority: 'high', href: `${baseURL}hero.webp` },
        { rel: 'icon', type: 'image/x-icon', href: `${baseURL}favicon.ico` },
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon-180x180.png`, sizes: '180x180' }
      ]
    }
  },

  // Self-hosted Roboto, in the weights the Vuetify 2 Nuxt module used to
  // request from a CDN. The MDI icon font is deliberately absent: icons come
  // from `@mdi/js` as SVG paths instead, so only the ones actually drawn are
  // shipped. See `app/plugins/vuetify.ts`.
  css: [
    '@fontsource/roboto/100.css',
    '@fontsource/roboto/300.css',
    '@fontsource/roboto/400.css',
    '@fontsource/roboto/500.css',
    '@fontsource/roboto/700.css',
    '@fontsource/roboto/900.css'
  ],

  // Components pair a `.vue` template with a sibling `.ts` options file, so only
  // the `.vue` half may be auto-registered.
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],

  // Pages and components pair a `.vue` template with sibling `.ts`/`.css`
  // files. Those siblings are imported by the `.vue` half via `<script src>`;
  // Nuxt must not scan them as pages of their own, or they outrank the `.vue`
  // file and the route ends up with no render function.
  ignore: ['**/pages/**/*.ts'],

  runtimeConfig: {
    public: {
      // GA4 property the deployed site reports to. Empty switches analytics
      // off altogether, and `NUXT_PUBLIC_GTAG_ID` overrides it at build time;
      // a local run reports nothing either way. See
      // `app/plugins/analytics.client.ts`.
      gtagId: 'G-Y6X6QW0VFB',

      // Read from `package.json` so the footer cannot drift from the release.
      version
    }
  },

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    // Nuxt drops a falsy entry, so this is simply absent off Vercel.
    onVercel && '@vercel/analytics',
    '@vite-pwa/nuxt',
    // Vuetify ships as a Vite plugin; this hook wires in its treeshaking and
    // SASS variable handling.
    (_options, nuxt) => {
      nuxt.hooks.hook('vite:extendConfig', (config) => {
        config.plugins?.push(vuetify({
          autoImport: true,
          styles: { configFile: 'assets/variables.scss' }
        }))
      })
    }
  ],

  pwa: {
    registerType: 'autoUpdate',

    workbox: {
      // The Nuxt PWA module seeds `globPatterns` with the app manifest's JSON
      // and nothing else, which replaces vite-plugin-pwa's defaults instead of
      // adding to them. The shell then never reaches the precache, while the
      // SPA `navigateFallback` still points at `/`, so the service worker
      // threw `non-precached-url` on every navigation. Spelling the patterns
      // out puts the shell back.
      globPatterns: ['**/*.{js,css,html,webmanifest,woff2,webp}'],
      // Except the game icons: at most one is wanted per save, and precaching
      // 4844 of them would pull the whole set down before the first one is
      // needed.
      globIgnores: ['**/icons/**'],
      navigateFallback: '/'
    },

    // Generates the icon set from `public/icon.png` (see pwa-assets.config.ts)
    // and injects the matching head links.
    pwaAssets: {
      config: true,
      injectThemeColor: true
    },
    manifest: {
      name: 'DSV Tool',
      short_name: 'DSVTool',
      description: 'A DSV (DeSmuME/DraStic) converter from/to RAW DS save files.',
      lang: 'en',
      theme_color: '#1976d2'
    }
  },

  vite: {
    vue: { template: { transformAssetUrls } }
  },

  typescript: {
    strict: true
  }
})
