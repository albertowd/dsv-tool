import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'

// A site served from a subpath rather than the domain root needs that prefix on
// every absolute asset path. Whatever publishes the build sets
// NUXT_APP_BASE_URL; locally it stays `/`.
const baseURL: string = (process.env.NUXT_APP_BASE_URL || '/').replace(/\/?$/, '/')

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
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        // Equivalents of the tags the Nuxt 2 PWA meta module used to inject.
        { name: 'theme-color', content: '#1976d2' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-title', content: 'DSVTool' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: `${baseURL}favicon.ico` },
        { rel: 'apple-touch-icon', href: `${baseURL}apple-touch-icon-180x180.png`, sizes: '180x180' }
      ]
    }
  },

  // Self-hosted equivalents of the CDN assets the Vuetify 2 Nuxt module used to
  // inject: Roboto (the weights it requested) and the MDI icon font.
  css: [
    '@fontsource/roboto/100.css',
    '@fontsource/roboto/300.css',
    '@fontsource/roboto/400.css',
    '@fontsource/roboto/500.css',
    '@fontsource/roboto/700.css',
    '@fontsource/roboto/900.css',
    '@mdi/font/css/materialdesignicons.css'
  ],

  // Components pair a `.vue` template with a sibling `.ts` options file, so only
  // the `.vue` half may be auto-registered.
  components: [{ path: '~/components', pathPrefix: false, extensions: ['vue'] }],

  // Pages and components pair a `.vue` template with sibling `.ts`/`.css`
  // files. Those siblings are imported by the `.vue` half via `<script src>`;
  // Nuxt must not scan them as pages of their own, or they outrank the `.vue`
  // file and the route ends up with no render function.
  ignore: ['**/pages/**/*.ts'],

  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
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
