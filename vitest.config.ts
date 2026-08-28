import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    setupFiles: ['./test/setup.ts'],
    // Vuetify ships components with side-effect `.css` imports; they have to go
    // through Vite's transform rather than Node's ESM loader.
    server: {
      deps: {
        inline: ['vuetify']
      }
    },
    coverage: {
      // `lcov` is what the SonarQube scanner reads; see sonar-project.properties.
      reporter: ['text', 'lcov'],
      include: [
        'app/components/**',
        'app/models/**',
        'app/pages/**',
        'app/plugins/**',
        'app/stores/**'
      ]
    }
  }
})
