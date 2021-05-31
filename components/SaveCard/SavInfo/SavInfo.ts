import Vue from 'vue'

import DsvInfo from './DsvInfo/DsvInfo.vue'
import Sav from '~/models/Sav'
import { ConvertState } from '~/store/convert'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  components: {
    DsvInfo,
  },
  props: {
    savIndex: {
      default: -1,
      type: Number
    }
  },
  computed: {
    sav: {
      get (): Sav | null {
        if (this.savIndex < 0) {
          return (this.$store.state.convert as ConvertState).sav
        } else {
          return (this.$store.state.history as HistoryState).savs[this.savIndex]
        }
      }
    }
  }
})
