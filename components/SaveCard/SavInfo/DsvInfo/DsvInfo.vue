<template>
  <v-card-text v-if="sav && sav.dsv.addressSize > 0">
    <h6>
      Actually Written Size:
      <span>{{ sav.dsv.actuallyWrittenSize / 1024.0 }} kb</span>
    </h6>
    <h6>
      Address Bus Size: <span>{{ sav.dsv.addressSize }}</span>
    </h6>
    <h6>
      Cookie: <span>{{ sav.dsv.cookie }}</span>
    </h6>
    <h6>
      Header: <span>{{ sav.dsv.header }}</span>
    </h6>
    <h6>
      Padded Size: <span>{{ sav.dsv.paddedSize / 1024.0 }} kb</span>
    </h6>
    <h6>
      SaveSize / Save Type: <span>{{ sav.dsv.saveSize / 1024.0 }} kb / {{ sav.dsv.saveType }}</span>
    </h6>
    <h6>
      Version Number: <span>{{ sav.dsv.versionNumber }}</span>
    </h6>
  </v-card-text>
</template>

<script lang="ts" src="./DsvInfo.ts"></script>
<style scoped src="./DsvInfo.css"></style>
