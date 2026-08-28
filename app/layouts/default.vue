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
      <v-btn href="https://github.com/albertowd" target="_blank" variant="text">
        github
      </v-btn>
    </v-footer>
  </v-app>
</template>

<script setup lang="ts">
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
