<template>
  <div ref="fileInputDiv">
    <v-file-input
      v-model="uploadedFile"
      accept=".dsv,.sav"
      label="Pick a DSV or SAV file..."
      prepend-icon="mdi-content-save-outline"
    />
  </div>
</template>

<script lang="ts" src="./index.ts" />
<style scoped src="./index.css" />
