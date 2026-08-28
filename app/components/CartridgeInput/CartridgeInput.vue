<template>
  <v-card
    class="cartridge mx-auto"
    flat
    :class="{ 'cartridge-dragging': dragging }"
    @dragenter.prevent="dragging = true"
    @dragover.prevent
    @dragleave.prevent="dragging = false"
    @drop.prevent="dropDsv"
  >
    <v-img
      contain
      class="cartridge-img"
      :src="cartridgeImage"
    />
    <v-overlay
      contained
      persistent
      class="align-center justify-center"
      theme="light"
      :model-value="file === null"
      :scrim="false"
    >
      <v-file-input
        v-model="file"
        accept=".dsv,.sav"
        class="cartridge-input"
        density="compact"
        prepend-icon="mdi-upload"
        :clearable="false"
        :hide-input="true"
        :truncate-length="128"
        @update:model-value="changeCurrentDsv"
      />
    </v-overlay>
  </v-card>
</template>

<script lang="ts" src="./CartridgeInput.ts"></script>
<style scoped src="./CartridgeInput.css"></style>
