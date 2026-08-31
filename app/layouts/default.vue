<template>
  <v-app>
    <v-app-bar app>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
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
      <v-container>
        <slot />
      </v-container>
    </v-main>
    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
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
        icon="mdi-github"
        title="GitHub"
        aria-label="GitHub"
      />
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
// Images live in `public/` so the bundler never inlines them; that means
// carrying the base path by hand, the way `nuxt.config.ts` does for the icons.
const awdIcon = `${useRuntimeConfig().app.baseURL}awd.webp`

const drawer = ref(false)
const title = 'DSV Tool'
const items = [
  {
    icon: 'mdi-nintendo-game-boy',
    title: 'Home',
    to: '/'
  },
  {
    icon: 'mdi-content-save',
    title: 'Convert',
    to: '/convert'
  },
  {
    icon: 'mdi-content-save-all',
    title: 'History',
    to: '/history'
  }
]
</script>
