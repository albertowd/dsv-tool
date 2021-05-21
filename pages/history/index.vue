<template>
  <v-container>
    <v-btn @click="addFile">Add File</v-btn>
    <v-card v-for="(dsv, index) in dsvs" :key="index">
      <CartridgeCard :dsv-index="index" />
      <v-card-title>{{ dsv.name }}</v-card-title>
      <v-card-subtitle>{{ new Date(dsv.lastModified).toISOString().replace('T', ' ') }}</v-card-subtitle>
      <v-card-text>{{ dsv.base64 }}</v-card-text>
    </v-card>
  </v-container>
</template>

<script lang="ts" src="./index.ts" />
<style scoped src="./index.css" />
