import { defineComponent } from 'vue'

import { mdiDeleteSweep, mdiInformation } from '@mdi/js'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import ExportSaves from '~/components/ExportSaves/ExportSaves.vue'
import ImportSaves from '~/components/ImportSaves/ImportSaves.vue'
import type Dsv from '~/models/Dsv'
import { useHistoryStore } from '~/stores/history'

export default defineComponent({
  components: {
    CartridgeCard,
    ExportSaves,
    ImportSaves
  },
  setup () {
    return {
      mdiDeleteSweep,
      mdiInformation,
      history: useHistoryStore()
    }
  },
  computed: {
    dsvs (): Dsv[] {
      return this.history.dsvs
    }
  },
  methods: {
    clear (): void {
      this.history.clear()
    }
  }
})
