<template>
  <v-card ref="saveCard" class="save-card" :class="highlightClass">
    <v-card-title>{{ sav ? sav.id : '-' }}</v-card-title>
    <v-row justify="center">
      <v-col align="center">
        <CartridgeInfo :sav-index="savIndex" />
      </v-col>
      <v-col>
        <SavInfo :sav-index="savIndex" />
      </v-col>
    </v-row>
    <v-card-actions>
      <v-btn color="red" text :disabled="!sav" @click="clearCurrent">
        <span><v-icon>mdi-delete</v-icon> DELETE</span>
      </v-btn>
      <v-spacer />
      <v-btn color="green" text :disabled="!sav || sav.error" @click="downloadDsv">
        <span><v-icon>mdi-download-box</v-icon> .DSV</span>
      </v-btn>
      <v-btn color="gold" text :disabled="!sav || sav.error" @click="downloadSav">
        <span><v-icon>mdi-download-box</v-icon> .SAV</span>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts" src="./SaveCard.ts"></script>
<style scoped src="./SaveCard.css"></style>
