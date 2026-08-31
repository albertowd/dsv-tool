import { defineComponent } from 'vue'

import { mdiClose, mdiContentSave, mdiContentSaveOutline, mdiFolderArrowDownOutline, mdiMenuDown } from '@mdi/js'

import type { SaveFormat } from '~/plugins/dsv-tools.client'
import type { OutgoingSave, WriteResult } from '~/plugins/save-folder.client'
import { useHistoryStore } from '~/stores/history'

/**
 * What the last export did, for the message shown afterwards.
 */
interface ExportOutcome {
  written: number
  failed: number
  /** Whether the saves were downloaded rather than written into a folder. */
  downloaded: boolean
}

export default defineComponent({
  setup () {
    return {
      mdiClose,
      mdiContentSave,
      mdiContentSaveOutline,
      mdiFolderArrowDownOutline,
      mdiMenuDown,
      history: useHistoryStore()
    }
  },
  data () {
    return {
      outcome: null as ExportOutcome | null,
      writing: false
    }
  },
  computed: {
    /**
     * Whether the browser can be handed a folder to write into, rather than
     * only being able to hand files back as downloads.
     */
    canPickFolder (): boolean {
      return this.$canPickDirectory()
    },
    empty (): boolean {
      return this.history.dsvs.length === 0
    },
    outcomeMessage (): string {
      const outcome: ExportOutcome | null = this.outcome
      if (!outcome) {
        return ''
      }

      const noun: string = outcome.written === 1 ? 'save' : 'saves'
      const verb: string = outcome.downloaded ? 'Downloaded' : 'Exported'
      const parts: string[] = [`${verb} ${outcome.written} ${noun}`]
      if (outcome.failed > 0) {
        parts.push(`${outcome.failed} could not be written`)
      }
      return `${parts.join(' - ')}.`
    },
    outcomeType (): 'error' | 'success' {
      return (this.outcome?.failed ?? 0) > 0 ? 'error' : 'success'
    },
    /**
     * The snackbar's visibility, which is just "is there a result to show".
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
     * Converts every stored save to the requested format.
     * @param format Format to write.
     * @returns the saves, named for the format they are now in.
     */
    outgoing (format: SaveFormat): OutgoingSave[] {
      const saves: OutgoingSave[] = []
      for (const dsv of this.history.dsvs) {
        if (dsv.base64.length === 0) {
          continue
        }
        const bytes: Uint8Array = this.$fromBase64(dsv.base64)
        saves.push({
          name: this.$renameExtension(dsv.name, format),
          bytes: this.$toSaveFormat(bytes, format, dsv.info)
        })
      }
      return saves
    },
    /**
     * Writes every stored save out in the given format: into a folder the user
     * picks where the browser allows it, and as downloads where it does not.
     * @param format Format to write.
     */
    async exportAll (format: SaveFormat): Promise<void> {
      const saves: OutgoingSave[] = this.outgoing(format)
      if (saves.length === 0) {
        return
      }

      const directory = this.canPickFolder ? await this.$pickDirectory('readwrite') : null
      // Only treat a missing directory as "download instead" where the picker
      // was never an option; dismissing it is a cancellation, not a fallback.
      if (!directory && this.canPickFolder) {
        return
      }

      this.outcome = null
      this.writing = true
      try {
        if (directory) {
          const result: WriteResult = await this.$writeSaves(directory, saves)
          this.outcome = { ...result, downloaded: false }
        } else {
          for (const save of saves) {
            this.$downloadBytes(save.name, save.bytes)
          }
          this.outcome = { written: saves.length, failed: 0, downloaded: true }
        }
      } finally {
        this.writing = false
      }
    }
  }
})
