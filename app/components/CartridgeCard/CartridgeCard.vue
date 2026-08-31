<template>
  <v-card>
    <v-row
      align="center"
      class="cartridge-row"
      justify="center"
    >
      <v-col
        class="text-center"
        cols="12"
        md="4"
      >
        <CartridgeInput :dsv-index="dsvIndex" />
      </v-col>
      <v-col
        cols="12"
        md="8"
      >
        <CartridgeInfo :dsv-index="dsvIndex" />
      </v-col>
    </v-row>
    <v-card-actions>
      <v-btn
        color="red"
        variant="text"
        :disabled="!loaded"
        @click="remove"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn
        color="green"
        variant="text"
        :disabled="!loaded"
        @click="saveAsDsv"
      >
        <v-icon>mdi-download-box</v-icon> .DSV
      </v-btn>
      <v-btn
        color="gold"
        variant="text"
        :disabled="!loaded"
        @click="saveAsSav"
      >
        <v-icon>mdi-download-box</v-icon> .SAV
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" src="./CartridgeCard.ts"></script>
<style scoped src="./CartridgeCard.css"></style>
