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
      // Extensions spelled out: a bare `**` also matches the scaffold's
      // `README.md` in each of these directories, which the coverage provider
      // then tries to parse as JavaScript and complains about.
      include: [
        'app/components/**/*.{ts,vue}',
        'app/models/**/*.ts',
        'app/pages/**/*.{ts,vue}',
        'app/plugins/**/*.ts',
        'app/stores/**/*.ts'
      ]
    }
  }
})
