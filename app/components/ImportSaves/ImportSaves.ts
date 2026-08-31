import { defineComponent } from 'vue'

import { mdiClose, mdiUsbFlashDrive } from '@mdi/js'

import type Dsv from '~/models/Dsv'
import type { ScanResult } from '~/plugins/save-folder.client'
import { useHistoryStore } from '~/stores/history'

/**
 * What the last import did, for the message shown afterwards.
 */
interface ImportOutcome {
  added: number
  duplicates: number
  failed: number
  truncated: boolean
}

export default defineComponent({
  setup () {
    return {
      mdiClose,
      mdiUsbFlashDrive,
      history: useHistoryStore()
    }
  },
  data () {
    return {
      outcome: null as ImportOutcome | null,
      scanning: false
    }
  },
  computed: {
    /**
     * Whether the browser can be handed a directory to read, as opposed to
     * only being able to take one through a file input.
     */
    canPickFolder (): boolean {
      return this.$canPickDirectory()
    },
    outcomeMessage (): string {
      const outcome: ImportOutcome | null = this.outcome
      if (!outcome) {
        return ''
      }
      if (outcome.added === 0 && outcome.duplicates === 0 && outcome.failed === 0) {
        return 'No .dsv or .sav files there.'
      }

      const parts: string[] = [`Imported ${outcome.added} ${outcome.added === 1 ? 'save' : 'saves'}`]
      if (outcome.duplicates > 0) {
        parts.push(`${outcome.duplicates} already in the list`)
      }
      if (outcome.failed > 0) {
        parts.push(`${outcome.failed} unreadable`)
      }
      if (outcome.truncated) {
        parts.push('stopped early, there were more')
      }
      return `${parts.join(' - ')}.`
    },
    outcomeType (): 'info' | 'success' {
      return (this.outcome?.added ?? 0) > 0 ? 'success' : 'info'
    },
    /**
     * The snackbar's visibility, which is just "is there a result to show".
     * Dismissing it drops the result rather than keeping a stale one around.
     */
    showOutcome: {
      get (): boolean {
        return this.outcome !== null
      },
      set (visible: boolean): void {
        if (!visible) {
          this.outcome = null
        }
      }
    }
  },
  methods: {
    /**
     * Reads the saves found and files them in the history.
     * @param scan Saves to import.
     */
    async importSaves (scan: ScanResult): Promise<void> {
      let added: number = 0
      let duplicates: number = 0
      let failed: number = 0

      for (const file of scan.files) {
        if (this.alreadyStored(file)) {
          duplicates++
          continue
        }
        const dsv: Dsv = await this.$fileToDsv(file)
        // `fileToDsv` reports a bad read on the model rather than throwing, so
        // one unreadable save does not cost the rest of the import.
        if (dsv.error) {
          failed++
          continue
        }
        this.history.add(dsv)
        added++
      }

      this.outcome = { added, duplicates, failed, truncated: scan.truncated }
    },
    /**
     * Whether a file is already in the history, so a card can be rescanned
     * without stacking up copies of the same saves.
     * @param file File about to be imported.
     * @returns whether the history already holds it.
     */
    alreadyStored (file: File): boolean {
      return this.history.dsvs.some((dsv: Dsv): boolean =>
        dsv.name === file.name
        && dsv.size === file.size
        && dsv.lastModified === file.lastModified)
    },
    /**
     * Scans a directory the user picks, where the browser allows it.
     */
    async scanFolder (): Promise<void> {
      const directory = await this.$pickDirectory()
      if (!directory) {
        return
      }

      this.outcome = null
      this.scanning = true
      try {
        await this.importSaves(await this.$scanDirectory(directory))
      } finally {
        this.scanning = false
      }
    },
    /**
     * Handles the directory `<input>` used where there is no picker.
     * @param event Change event carrying the chosen folder's files.
     */
    async pickFiles (event: Event): Promise<void> {
      const input = event.target as HTMLInputElement
      const files: FileList | null = input.files
      if (!files || files.length === 0) {
        return
      }

      this.outcome = null
      this.scanning = true
      try {
        await this.importSaves(this.$filterSaves(files))
      } finally {
        this.scanning = false
        // Let the same folder be chosen twice in a row.
        input.value = ''
      }
    },
    /**
     * Opens the fallback directory input.
     */
    browse (): void {
      (this.$refs.folderInput as HTMLInputElement | undefined)?.click()
    }
  }
})
