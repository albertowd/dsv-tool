import Vue from 'vue'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  components: {
    CartridgeCard
  },
  computed: {
    dsvs: {
      get (): Dsv[] {
        return (this.$store.state.history as HistoryState).dsvs
      }
    }
  },
  methods: {
    addFile (): void {
      const dsv: Dsv = new Dsv()
      dsv.name = `added dsv ${(this.$store.state.history as HistoryState).dsvs.length}`
      this.$store.commit('history/add', new Dsv())
    }
  }
})
