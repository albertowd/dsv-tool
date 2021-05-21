<template>
  <v-card class="cartridge" flat>
    <v-img
      contain
      class="cartridge-img"
      :src="require(`~/assets/nds-cartridge-${cardType}.png`)"
    />
    <v-overlay :absolute="true" :opacity="0.0" :value="file === null">
      <v-file-input
        v-model="file"
        accept=".dsv,.sav"
        class="cartridge-input"
        dense
        light
        prepend-icon="mdi-upload"
        :clearable="false"
        :hide-input="true"
        :truncate-length="128"
        @change="changeCurrentDsv"
      />
    </v-overlay>
  </v-card>
</template>

<script lang="ts" src="./CartridgeInput.ts"></script>
<style scoped src="./CartridgeInput.css"></style>
