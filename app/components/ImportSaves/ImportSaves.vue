<template>
  <div class="import-saves">
    <v-btn
      :prepend-icon="mdiUsbFlashDrive"
      variant="text"
      :loading="scanning"
      @click="canPickFolder ? scanFolder() : browse()"
    >
      Import
      <v-tooltip
        activator="parent"
        aria-label="Scan a folder, memory card or drive for .dsv and .sav files"
        location="bottom"
      >
        Scan a folder, memory card or drive for <code>.dsv</code> and
        <code>.sav</code> files
      </v-tooltip>
    </v-btn>

    <!-- Only reached where `showDirectoryPicker` is missing. `webkitdirectory`
         is the prefixed name in every browser that has it, Firefox included.
         The button above opens it, so it is never shown; it still carries a
         label, so it has a name wherever it does get exposed. -->
    <label
      class="d-sr-only"
      for="import-saves-folder"
    >Folder to scan for saves</label>
    <input
      v-show="false"
      id="import-saves-folder"
      ref="folderInput"
      accept=".dsv,.sav"
      multiple
      type="file"
      webkitdirectory
      @change="pickFiles"
    >

    <!-- A snackbar rather than an alert in place: the result is transient, and
         this sits in a toolbar row where anything inline would shove the
         buttons around. -->
    <v-snackbar
      v-model="showOutcome"
      location="bottom"
      :color="outcomeType"
      :timeout="6000"
    >
      {{ outcomeMessage }}
      <template #actions>
        <v-btn
          :icon="mdiClose"
          aria-label="Dismiss"
          variant="text"
          @click="showOutcome = false"
        />
      </template>
    </v-snackbar>
  </div>
</template>

<script lang="ts" src="./ImportSaves.ts"></script>
