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
  data () {
    return {
      file: null as File | null
    }
  },
  computed: {
    cardType: {
      get (): string {
        return this.dsv.size > 0 ? 'gold' : 'grey'
      }
    },
    dsv: {
      get (): Dsv {
        if (this.dsvIndex < 0) {
          return (this.$store.state.current as CurrentState).dsv
        } else {
          return (this.$store.state.history as HistoryState).dsvs[this.dsvIndex]
        }
      }
    }
  },
  methods: {
    changeCurrentDsv (file: File | null): void {
      if (file) {
        this.$fileToDsv(file)
          .then((dsv: Dsv | void): void => {
            if (dsv) {
              this.$store.commit('current/update', dsv)
            }
          })
      }
    }
  }
})
