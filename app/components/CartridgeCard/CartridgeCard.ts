import { defineComponent } from 'vue'

import CartridgeInfo from '~/components/CartridgeInfo/CartridgeInfo.vue'
import CartridgeInput from '~/components/CartridgeInput/CartridgeInput.vue'
import type Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

export default defineComponent({
  components: {
    CartridgeInfo,
    CartridgeInput
  },
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
  computed: {
    dsv (): Dsv | undefined {
      return this.dsvIndex < 0 ? this.current.dsv : this.history.dsvs[this.dsvIndex]
    },
    loaded (): boolean {
      return (this.dsv?.size ?? 0) > 0
    }
  },
  methods: {
    /**
     * Reads the loaded file back out of the model.
     * @returns the bytes, or null when nothing is loaded.
     */
    bytes (): Uint8Array | null {
      const dsv: Dsv | undefined = this.dsv
      return dsv && dsv.base64.length > 0 ? this.$fromBase64(dsv.base64) : null
    },
    /**
     * Downloads the save with a DeSmuME footer, adding one if the loaded file
     * is a raw save and keeping the existing one otherwise.
     */
    saveAsDsv (): void {
      const bytes: Uint8Array | null = this.bytes()
      if (bytes && this.dsv) {
        const dsv: Uint8Array = this.$isDsv(bytes) ? bytes : this.$savToDsv(bytes, this.dsv.info)
        this.$downloadBytes(this.$renameExtension(this.dsv.name, 'dsv'), dsv)
      }
    },
    /**
     * Downloads the raw save, stripping the footer when there is one.
     */
    saveAsSav (): void {
      const bytes: Uint8Array | null = this.bytes()
      if (bytes && this.dsv) {
        const sav: Uint8Array = this.$isDsv(bytes) ? this.$dsvToSav(bytes) : bytes
        this.$downloadBytes(this.$renameExtension(this.dsv.name, 'sav'), sav)
      }
    },
    /**
     * Drops the save: from the history when this card belongs to one,
     * otherwise from the converter.
     */
    remove (): void {
      const dsv: Dsv | undefined = this.dsv
      if (this.dsvIndex < 0) {
        this.current.clear()
      } else if (dsv) {
        this.history.remove(dsv)
      }
    }
  }
})
