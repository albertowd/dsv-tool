<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <template v-if="item.icon.startsWith('mdi')">
              <v-icon>{{ item.icon }}</v-icon>
            </template>
            <template v-else>
              <v-img contain width="24" :lazy-src="item.icon.replace('.png', '-thumb.png')" :src="item.icon" />
            </template>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title v-text="title" />
    </v-app-bar>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
    <v-footer
      :absolute="!fixed"
      app
    >
      <span>&copy; {{ new Date().getFullYear() }}</span>
      <v-spacer />
      {{ $config.clientVersion }}
      <v-spacer />
      <v-btn href="https://github.com/albertowd" target="_blank" text>
        github
      </v-btn>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data () {
    return {
      clipped: true,
      drawer: false,
      fixed: true,
      items: [
        {
          icon: 'img/nintendo-ds-icon.png',
          title: 'Home',
          to: '/'
        },
        {
          icon: 'img/cartridge/ds-cartridge-icon.png',
          title: 'Convert',
          to: '/convert'
        },
        {
          icon: 'mdi-content-save-all',
          title: 'History',
          to: '/history'
        }
      ],
      title: 'DSV Tool'
    }
  }
}
</script>
