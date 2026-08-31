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
      :alt="loaded ? 'Nintendo DS cartridge holding a save' : 'Empty Nintendo DS cartridge'"
      :aspect-ratio="CARTRIDGE_ASPECT"
      :src="cartridgeImage"
    />
    <!-- Sits on the cartridge's printed label, where a DS shows the game's
         own icon. Only ever a guess from the file name, so a load failure is
         the normal "not in the set" answer and just leaves the label bare. -->
    <div
      v-if="gameIcon"
      class="cartridge-label"
    >
      <img
        alt=""
        class="cartridge-icon"
        :src="gameIcon"
        @error="iconMissing = true"
      >
    </div>
    <v-overlay
      contained
      persistent
      class="align-center justify-center"
      theme="light"
      :model-value="!loaded"
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
