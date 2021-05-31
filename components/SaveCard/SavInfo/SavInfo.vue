<template>
  <v-card flat>
    <v-card-title>
      {{ sav ? sav.name : 'Upload a .DSV or .SAV file' }}
    </v-card-title>
    <v-card-subtitle v-if="sav">
      {{ sav.size / 1024.0 }} kb - {{ new Date(sav.lastModified).toLocaleString() }}
    </v-card-subtitle>
    <DsvInfo :sav-index="savIndex" />
  </v-card>
</template>

<script lang="ts" src="./SavInfo.ts"></script>
<style scoped src="./SavInfo.css"></style>
