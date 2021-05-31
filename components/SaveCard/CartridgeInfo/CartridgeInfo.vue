<template>
  <v-card class="cartridge" flat>
    <v-img
      class="absolute"
      contain
      :lazy-src="`img/cartridge/ds-cartridge${cardType}-thumb.png`"
      :src="`img/cartridge/ds-cartridge${cardType}.png`"
    />
    <v-file-input
      v-if="sav === null"
      v-model="file"
      accept=".dsv,.sav"
      class="absolute-input cartridge-input"
      dense
      light
      prepend-icon="mdi-upload"
      :clearable="false"
      :hide-input="true"
      :truncate-length="128"
      @change="changeConvertFile"
    />
    <v-img v-else class="absolute-icon sav-img" contain :src="`img/games/${savId}.png`" />
  </v-card>
</template>

<script lang="ts" src="./CartridgeInfo.ts"></script>
<style scoped src="./CartridgeInfo.css"></style>
