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
        <v-img
          alt=""
          class="mx-auto mb-6"
          src="/icon.png"
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
          prepend-icon="mdi-content-save"
          size="large"
          to="/convert"
        >
          Convert a save
        </v-btn>
        <v-btn
          class="ma-2"
          prepend-icon="mdi-content-save-all"
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
const features = [
  {
    icon: 'mdi-shield-lock-outline',
    title: 'Stays on your device',
    text: 'Saves are read in the browser. Nothing is uploaded to a server.'
  },
  {
    icon: 'mdi-file-search-outline',
    title: 'Inspect the footer',
    text: 'Read the DSV footer: save type, address bus size, padding and cookie.'
  },
  {
    icon: 'mdi-history',
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
