<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon
        aria-label="Toggle navigation"
        @click.stop="drawer = !drawer"
      />
      <v-toolbar-title>{{ title }}</v-toolbar-title>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list nav>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          exact
        />
      </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-container class="page">
        <div class="page-content">
          <slot />
        </div>
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
      <span class="text-medium-emphasis ms-2">v{{ version }}</span>
      <v-spacer />
      <v-btn
        href="https://albertowd.dev"
        target="_blank"
        rel="noopener"
        variant="text"
        title="albertowd.dev"
        aria-label="albertowd.dev"
        class="px-2"
      >
        <!-- A wordmark, not a glyph, so it is sized by height and left to
             take whatever width its aspect ratio needs. -->
        <v-img
          :src="awdIcon"
          alt="albertowd.dev"
          height="18"
          width="46"
        />
      </v-btn>
      <v-btn
        href="https://github.com/albertowd"
        target="_blank"
        rel="noopener"
        variant="text"
        :icon="mdiGithub"
        title="GitHub"
        aria-label="GitHub"
      />
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
import { mdiContentSave, mdiContentSaveAll, mdiGithub, mdiNintendoGameBoy } from '@mdi/js'

const config = useRuntimeConfig()

// Images live in `public/` so the bundler never inlines them; that means
// carrying the base path by hand, the way `nuxt.config.ts` does for the icons.
const awdIcon = `${config.app.baseURL}awd.webp`
const version = config.public.version

const drawer = ref(false)
const title = 'DSV Tool'
const items = [
  {
    icon: mdiNintendoGameBoy,
    title: 'Home',
    to: '/'
  },
  {
    icon: mdiContentSave,
    title: 'Convert',
    to: '/convert'
  },
  {
    icon: mdiContentSaveAll,
    title: 'History',
    to: '/history'
  }
]
</script>

<style scoped>
/* `v-main` already fills the window, but the page inside it sat at the top, so
   any screen taller than the content left a band of dead space above the
   footer. */
.page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

/* Auto margins centre the page in whatever room is left over. Unlike
   `justify-content: center` they simply collapse when the content is taller
   than the screen, rather than overflowing past the top where it cannot be
   scrolled back to. */
.page-content {
  margin-block: auto;
  width: 100%;
}
</style>
