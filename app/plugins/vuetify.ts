import { createVuetify } from 'vuetify'
// Vuetify's global layer (typography, resets, layout). vite-plugin-vuetify
// rewrites this through `assets/variables.scss`.
import 'vuetify/styles'
// Icons as SVG paths rather than the webfont. The font ships one CSS rule per
// icon - 418 KB of the stylesheet for the sixteen this app draws - and a
// 403 KB woff2 that has to arrive before any of them render. The paths are
// imported individually, so only what is used is bundled.
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg'
import colors from 'vuetify/util/colors'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    icons: {
      defaultSet: 'mdi',
      aliases,
      sets: { mdi }
    },
    theme: {
      defaultTheme: 'dark',
      themes: {
        dark: {
          dark: true,
          colors: {
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
    }
  })

  nuxtApp.vueApp.use(vuetify)
})
