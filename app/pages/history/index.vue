<template>
  <v-container>
    <div class="d-flex align-center mb-4">
      <h1 class="text-h5">
        History
      </h1>
      <v-spacer />
      <v-btn
        prepend-icon="mdi-delete-sweep"
        variant="text"
        :disabled="dsvs.length === 0"
        @click="clear"
      >
        Clear
      </v-btn>
    </div>

    <v-alert
      v-if="dsvs.length === 0"
      icon="mdi-information"
      type="info"
      variant="tonal"
    >
      No saves loaded yet. Open <NuxtLink to="/convert">Convert</NuxtLink> and pick a
      <code>.dsv</code> or <code>.sav</code> file.
    </v-alert>

    <CartridgeCard
      v-for="(dsv, index) in dsvs"
      :key="dsv.id"
      class="mb-4"
      :dsv-index="index"
    />
  </v-container>
</template>

<script lang="ts" src="./index.ts"></script>
<style scoped src="./index.css"></style>
