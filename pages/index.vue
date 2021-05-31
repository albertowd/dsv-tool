<template>
  <v-container>
    <v-img contain lazy-src="img/nintendo-ds-icon-thumb.png" max-height="256px" src="img/nintendo-ds-icon.png" />
    <v-card class="mt-6">
      <v-card-title>DSV Tool</v-card-title>
      <v-card-subtitle>A tool to convert Nintendo DS dump saves to DSV files and back.</v-card-subtitle>
      <v-card-text>There are {{ savs.length }} converted files for this user. See them <router-link to="/history">here</router-link></v-card-text>
      <v-card-text>Or convert a new file <router-link to="/convert">here</router-link>!</v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" src="./index.ts" />
<style scoped src="./index.css" />
