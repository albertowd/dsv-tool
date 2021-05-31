import colors from 'vuetify/es5/util/colors'

import pkg from './package.json'

export default {
  // Disable server-side rendering: https://go.nuxtjs.dev/ssr-mode
  ssr: false,

  // Target: https://go.nuxtjs.dev/config-target
  target: 'static',

  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    titleTemplate: '%s - DSV Tool',
    title: 'DSVTool',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'A DSV (DeSmuME/DraStic) converter from/to RAW DS save files.' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: 'favicon.ico' }
    ]
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: [
  ],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [
    '~/plugins/dsv-tools.client.ts'
  ],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    // https://go.nuxtjs.dev/vuetify
    '@nuxtjs/vuetify'
  ],

  // Modules: https://go.nuxtjs.dev/config-modules
  modules: [
    // https://go.nuxtjs.dev/pwa
    '@nuxtjs/pwa'
  ],

  // PWA module configuration: https://go.nuxtjs.dev/pwa
  pwa: {
    manifest: {
      description: 'A DSV (DeSmuME/DraStic) converter from/to RAW DS save files.',
      icons: [
        {
          src: 'dsv-tool/icons/icon_64x64.77d040.png',
          sizes: '64x64',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_120x120.77d040.png',
          sizes: '120x120',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_144x144.77d040.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_152x152.77d040.png',
          sizes: '152x152',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_192x192.77d040.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_384x384.77d040.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: 'dsv-tool/icons/icon_512x512.77d040.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      lang: 'en',
      name: 'DSV Tool',
      short_name: 'DSV Tool'
    }
  },

  // Vuetify module configuration: https://go.nuxtjs.dev/config-vuetify
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    theme: {
      dark: true,
      themes: {
        dark: {
          primary: colors.blue.darken2,
          accent: colors.grey.darken3,
          secondary: colors.amber.darken3,
          info: colors.teal.lighten1,
          warning: colors.amber.base,
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    cssSourceMap: false,
    publicPath: process.env.environment === 'development' ? '/' : '/dsv-tool/',
    quiet: true
  },

  router: {
    base: process.env.environment === 'development' ? '/' : '/dsv-tool/'
  },

  // https://nuxtjs.org/guide/runtime-config
  publicRuntimeConfig: {
    clientVersion: pkg.version
  }
}
