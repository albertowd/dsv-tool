// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    rules: {}
  },
  {
    // Single-word names carried over from the Nuxt/Vuetify starter template.
    files: ['app/components/Logo.vue'],
    rules: {
      'vue/multi-word-component-names': 'off'
    }
  }
)
