<template>
  <div class="export-saves">
    <v-menu location="bottom end">
      <template #activator="{ props }">
        <v-btn
          v-bind="props"
          :append-icon="mdiMenuDown"
          :prepend-icon="mdiFolderArrowDownOutline"
          variant="text"
          :disabled="empty"
          :loading="writing"
        >
          Export
          <v-tooltip
            activator="parent"
            :aria-label="canPickFolder
              ? 'Write every save in the list to a folder, memory card or drive'
              : 'Download every save in the list'"
            location="bottom"
          >
            {{ canPickFolder
              ? 'Write every save in the list to a folder, memory card or drive'
              : 'Download every save in the list' }}
          </v-tooltip>
        </v-btn>
      </template>

      <!-- The format is the whole choice here, so it is the menu rather than a
           separate control: a save is written either with a footer or without. -->
      <v-list density="compact">
        <v-list-item
          :prepend-icon="mdiContentSave"
          title="All as .DSV"
          subtitle="With a DeSmuME footer"
          @click="exportAll('dsv')"
        />
        <v-list-item
          :prepend-icon="mdiContentSaveOutline"
          title="All as .SAV"
          subtitle="Raw, as a cartridge holds it"
          @click="exportAll('sav')"
        />
      </v-list>
    </v-menu>

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

<script lang="ts" src="./ExportSaves.ts"></script>
