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
          })
      }
    }
  }
})
