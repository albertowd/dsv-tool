import { defineComponent } from 'vue'

import goldCartridge from '~/assets/nds-cartridge-gold.png'
import greyCartridge from '~/assets/nds-cartridge-grey.png'
import type Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

const CARTRIDGE_IMAGES: Record<string, string> = {
  gold: goldCartridge,
  grey: greyCartridge
}

export default defineComponent({
  props: {
    dsvIndex: {
      default: -1,
      type: Number
    }
  },
  setup () {
    return {
      current: useCurrentStore(),
      history: useHistoryStore()
    }
  },
  data () {
    return {
      dragging: false,
      file: null as File | null
    }
  },
  computed: {
    cardType (): string {
      return (this.dsv?.size ?? 0) > 0 ? 'gold' : 'grey'
    },
    cartridgeImage (): string {
      return CARTRIDGE_IMAGES[this.cardType] ?? greyCartridge
    },
    dsv (): Dsv | undefined {
      return this.dsvIndex < 0 ? this.current.dsv : this.history.dsvs[this.dsvIndex]
    }
  },
  methods: {
    changeCurrentDsv (picked: File | File[] | null): void {
      const file: File | null = Array.isArray(picked) ? (picked[0] ?? null) : picked
      if (file) {
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
