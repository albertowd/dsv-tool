import { defineComponent } from 'vue'

import type Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

const CARTRIDGE_IMAGES: Record<string, string> = {
  gold: 'nds-cartridge-gold.webp',
  grey: 'nds-cartridge-grey.webp'
}

/**
 * Shape of the cartridge artwork. Pinning it means the rendered image box is
 * the artwork itself, which is what the label overlay is positioned against.
 */
const CARTRIDGE_ASPECT: number = 222 / 239

export default defineComponent({
  props: {
    dsvIndex: {
      default: -1,
      type: Number
    }
  },
  setup () {
    return {
      CARTRIDGE_ASPECT,
      baseUrl: useRuntimeConfig().app.baseURL,
      current: useCurrentStore(),
      history: useHistoryStore()
    }
  },
  data () {
    return {
      dragging: false,
      file: null as File | null,
      // The icon URL is a guess built from the save's name, so a load failure
      // is the ordinary "this game is not in the set" answer, not an error.
      iconMissing: false
    }
  },
  computed: {
    cardType (): string {
      return this.loaded ? 'gold' : 'grey'
    },
    cartridgeImage (): string {
      return `${this.baseUrl}${CARTRIDGE_IMAGES[this.cardType] ?? CARTRIDGE_IMAGES.grey}`
    },
    dsv (): Dsv | undefined {
      return this.dsvIndex < 0 ? this.current.dsv : this.history.dsvs[this.dsvIndex]
    },
    loaded (): boolean {
      return (this.dsv?.size ?? 0) > 0
    },
    gameIcon (): string | null {
      if (!this.saveName || this.iconMissing) {
        return null
      }
      return this.$gameIconUrl(this.saveName)
    },
    saveName (): string {
      const name: string | undefined = this.dsv?.name
      // `-` is the placeholder an empty Dsv carries, not a file name.
      return !name || name === '-' ? '' : name
    }
  },
  watch: {
    // Reset on the name rather than on `gameIcon`: that one is derived from
    // `iconMissing`, so clearing the flag would revive the icon it just gave
    // up on, and the two would chase each other.
    saveName (): void {
      this.iconMissing = false
    }
  },
  methods: {
    changeCurrentDsv (picked: File | File[] | null): void {
      const file: File | null = Array.isArray(picked) ? (picked[0] ?? null) : picked
      if (file) {
        this.iconMissing = false
        this.$fileToDsv(file)
          .then((dsv: Dsv): void => {
            this.current.update(dsv)
            // Cards rendered from the history are read-only views of an entry
            // that is already stored; only the converter adds to it.
            if (this.dsvIndex < 0) {
              this.history.add(dsv)
            }
          })
      }
    },
    /**
     * Loads the first file dropped onto the cartridge.
     * @param event Drop event carrying the files.
     */
    dropDsv (event: DragEvent): void {
      this.dragging = false
      const dropped: File | undefined = event.dataTransfer?.files?.[0]
      if (dropped) {
        this.file = dropped
        this.changeCurrentDsv(dropped)
      }
    }
  }
})
