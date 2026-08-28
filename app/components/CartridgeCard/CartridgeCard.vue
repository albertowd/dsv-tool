<template>
  <v-card>
    <v-row justify="center">
      <v-col class="text-center">
        <CartridgeInput :dsv-index="dsvIndex" />
      </v-col>
      <v-col>
        <CartridgeInfo :dsv-index="dsvIndex" />
      </v-col>
    </v-row>
    <v-card-actions>
      <v-btn color="red" variant="text">
        <v-icon>mdi-delete</v-icon>
      </v-btn>
      <v-spacer />
      <v-btn color="green" variant="text">
        <v-icon>mdi-download-box</v-icon> .DSV
      </v-btn>
      <v-btn color="gold" variant="text">
        <v-icon>mdi-download-box</v-icon> .SAV
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" src="./CartridgeCard.ts"></script>
<style scoped src="./CartridgeCard.css"></style>
