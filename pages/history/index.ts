import Vue from 'vue'

import SaveCard from '~/components/SaveCard/SaveCard.vue'
import Sav from '~/models/Sav'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  components: {
    SaveCard
  },
  computed: {
    savs: {
      get (): Sav[] {
        return (this.$store.state.history as HistoryState).savs
      }
    }
  },
  methods: {
    clearHistory (): void {
      this.$store.commit('history/clear')
    },
    exportHistory (): void {
      const a: any = document.createElement('a')
      a.download = 'dsv-tool.history'
      a.href = this.$downloadableHistory(this.savs)
      a.click()
      a.remove()
    },
    importHistory (): void {
      // Cast to any so the compiler do not show error.
      (this.$refs.importFileInput as any).$refs.input.click()
    },
    importHistoryFile (file: File | null): void {
      if (file) {
        file.arrayBuffer().then((arrayBuffer: ArrayBuffer): void => {
          const historyBuffer: string = Buffer.from(arrayBuffer).toString()
          this.$store.commit('history/import', historyBuffer)
        })
      }
    }
  }
})
