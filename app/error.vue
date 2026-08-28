<template>
  <v-app>
    <v-main>
      <v-container>
        <h1 v-if="props.error.statusCode === 404">
          {{ PAGE_NOT_FOUND }}
        </h1>
        <h1 v-else>
          {{ OTHER_ERROR }}
        </h1>
        <NuxtLink to="/" @click="clearError({ redirect: '/' })">
          Home
        </NuxtLink>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

const PAGE_NOT_FOUND = '404 Not Found'
const OTHER_ERROR = 'An error occurred'

const props = defineProps<{ error: NuxtError }>()

useHead({
  title: props.error.statusCode === 404 ? PAGE_NOT_FOUND : OTHER_ERROR
})
</script>

<style scoped>
h1 {
  font-size: 20px;
}
</style>
