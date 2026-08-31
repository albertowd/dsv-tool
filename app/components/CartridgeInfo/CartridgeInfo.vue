<template>
  <v-card v-if="dsv" flat>
    <v-card-title class="cartridge-name">
      {{ dsv.name }}
    </v-card-title>
    <v-card-subtitle>{{ (dsv.size / 1024).toFixed(1) }} kb - {{ new Date(dsv.lastModified).toLocaleString() }}</v-card-subtitle>
    <v-card-text v-if="!hasFooter">
      <v-chip class="mb-2" size="small">
        Raw DS save
      </v-chip>
      <p>No DSV footer. Export as <strong>.DSV</strong> to add one.</p>
    </v-card-text>
    <v-card-text v-else>
      <h6>
        Actually Written Size: <span>{{ dsv.info.actuallyWrittenSize / 1024.0 }} kb</span>
      </h6>
      <h6>
        Address Bus Size: <span>{{ dsv.info.addressSize }}</span>
      </h6>
      <h6>
        Cookie: <span>{{ dsv.info.cookie }}</span>
      </h6>
      <h6>
        Header: <span>{{ dsv.info.header }}</span>
      </h6>
      <h6>
        Padded Size: <span>{{ dsv.info.paddedSize / 1024.0 }} kb</span>
      </h6>
      <h6>
        SaveSize: <span>{{ dsv.info.saveSize / 1024.0 }} kb</span>
      </h6>
      <h6>
        SaveType: <span>{{ dsv.info.saveType }}</span>
      </h6>
      <h6>
        Version Number: <span>{{ dsv.info.versionNumber }}</span>
      </h6>
    </v-card-text>
  </v-card>
</template>

<script lang="ts" src="./CartridgeInfo.ts"></script>
<style scoped src="./CartridgeInfo.css"></style>
