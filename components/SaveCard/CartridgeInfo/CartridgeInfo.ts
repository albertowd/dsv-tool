import Vue from 'vue'

import Sav from '~/models/Sav'
import { ConvertState } from '~/store/convert'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  props: {
    savIndex: {
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
        return this.sav ? '' : '-empty'
      }
    },
    sav: {
      get (): Sav | null {
        if (this.savIndex < 0) {
          return (this.$store.state.convert as ConvertState).sav
        } else {
          return (this.$store.state.history as HistoryState).savs[this.savIndex]
        }
      }
    },
    savId: {
      get (): string {
        const match = this.sav?.name.match(/^\d{4}/)
        return match ? match[0] : '0000'
      }
    }
  },
  methods: {
    changeConvertFile (file: File | null): void {
      if (file) {
        this.$fileToSav(file)
          .then((sav: Sav | void): void => {
            if (sav) {
              this.$store.commit('convert/update', sav)
              this.$store.commit('history/add', sav)
            } else {
              this.$store.commit('current/update', null)
            }
          })
      } else {
        this.$store.commit('current/update', null)
      }
    }
  }
})
