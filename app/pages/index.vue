<template>
  <v-row justify="center">
    <v-col
      cols="12"
      sm="10"
      md="8"
    >
      <div class="text-center">
        <!-- The icon carries the wordmark, so the heading is for assistive
             tech only and the image is decorative. -->
        <!-- Largest element on the page, so it is served at the size it is
             drawn rather than as the 512px PWA source, and its box is given
             both dimensions so the page does not shift once it lands. -->
        <v-img
          alt=""
          class="mx-auto mb-6"
          :aspect-ratio="1"
          :height="180"
          :src="iconSrc"
          :width="180"
        />
        <h1 class="d-sr-only">
          DSV Tool
        </h1>
        <p class="text-h6 text-medium-emphasis mb-8">
          A DSV (DeSmuME/DraStic) converter from/to RAW DS save files.
        </p>
      </div>

      <v-row class="mb-4">
        <v-col
          v-for="feature in features"
          :key="feature.title"
          cols="12"
          md="4"
        >
          <v-card
            class="fill-height text-center"
            variant="tonal"
          >
            <v-card-item>
              <v-icon
                class="mb-2"
                :icon="feature.icon"
                size="32"
              />
              <v-card-title class="feature-title text-subtitle-1">
                {{ feature.title }}
              </v-card-title>
            </v-card-item>
            <v-card-text>{{ feature.text }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <div class="text-center">
        <v-btn
          class="ma-2"
          color="primary"
          :prepend-icon="mdiContentSave"
          size="large"
          to="/convert"
        >
          Convert a save
        </v-btn>
        <v-btn
          class="ma-2"
          :prepend-icon="mdiContentSaveAll"
          size="large"
          to="/history"
          variant="text"
        >
          History
        </v-btn>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import {
  mdiContentSave,
  mdiContentSaveAll,
  mdiHistory,
  mdiShieldLockOutline,
  mdiUsbFlashDrive
} from '@mdi/js'

// Public assets sit under the deployment's base path, which is `/` unless the
// build was given one.
const iconSrc = `${useRuntimeConfig().app.baseURL}hero.webp`

const features = [
  {
    icon: mdiShieldLockOutline,
    title: 'Stays on your device',
    text: 'Saves are read in the browser. Nothing is uploaded to a server.'
  },
  {
    icon: mdiUsbFlashDrive,
    title: 'Import and export',
    text: 'Scan a folder, memory card or drive for saves, and write them back as .DSV or .SAV.'
  },
  {
    icon: mdiHistory,
    title: 'Keep a history',
    text: 'Loaded saves stay in a session history so you can revisit them.'
  }
]
</script>

<style scoped>
/* `v-card-title` is nowrap + ellipsis by default, which clips these headings. */
.feature-title {
  white-space: normal;
}
</style>
