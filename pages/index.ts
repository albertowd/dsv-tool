import Vue from 'vue'

import Sav from '~/models/Sav'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  computed: {
    savs: {
      get (): Sav[] {
        return (this.$store.state.history as HistoryState).savs
      }
    }
  }
})
