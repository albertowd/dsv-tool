import { createVuetify } from 'vuetify'
// Vuetify's global layer (typography, resets, layout). vite-plugin-vuetify
// rewrites this through `assets/variables.scss`.
import 'vuetify/styles'
import colors from 'vuetify/util/colors'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
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
