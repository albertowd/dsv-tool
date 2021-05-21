import Vue from 'vue'

import Dsv from '~/models/Dsv'
import { CurrentState } from '~/store/current'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  props: {
    dsvIndex: {
      default: -1,
      type: Number
    }
  },
  computed: {
    dsv: {
      get (): Dsv {
        if (this.dsvIndex < 0) {
          return (this.$store.state.current as CurrentState).dsv
        } else {
          return (this.$store.state.history as HistoryState).dsvs[this.dsvIndex]
        }
      }
    }
  }
})
