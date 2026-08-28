import { defineConfig } from '@vite-pwa/assets-generator/config'

// Mirrors the icon set the Vuetify/PWA Nuxt 2 modules used to generate from
// `static/icon.png`: the same transparent sizes, a maskable variant and an
// apple-touch-icon. `public/favicon.ico` is left alone deliberately.
export default defineConfig({
  headLinkOptions: {
    preset: '2023'
  },
  preset: {
    transparent: {
      sizes: [64, 120, 144, 152, 192, 384, 512],
      favicons: []
    },
    maskable: {
      sizes: [512],
      resizeOptions: { background: '#ffffff' }
    },
    apple: {
      sizes: [180],
      resizeOptions: { background: '#ffffff' }
    }
  },
  images: ['public/icon.png']
})
