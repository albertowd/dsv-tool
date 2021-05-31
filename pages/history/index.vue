<template>
  <v-container>
    <v-card>
      <v-card-actions>
        <v-btn color="red" text :disabled="savs.length === 0" @click="clearHistory">
          <span><v-icon>mdi-alert-remove</v-icon> CLEAR</span>
        </v-btn>
        <v-spacer />
        <v-btn text @click="importHistory">
          <span> <v-icon>mdi-folder-upload</v-icon> IMPORT</span>
          <v-file-input
            ref="importFileInput"
            accept=".history"
            class="d-none"
            @change="importHistoryFile"
          />
        </v-btn>
        <v-btn text :disabled="savs.length === 0" @click="exportHistory">
          <span> <v-icon>mdi-folder-download</v-icon> EXPORT</span>
        </v-btn>
      </v-card-actions>
    </v-card>
    <v-card v-for="(sav, index) in savs" :key="index">
      <SaveCard class="mt-5" :sav-index="savs.length - 1 - index" />
    </v-card>
  </v-container>
</template>

<script lang="ts" src="./index.ts" />
<style scoped src="./index.css" />
