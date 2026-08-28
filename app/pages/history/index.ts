import { defineComponent } from 'vue'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import Dsv from '~/models/Dsv'
import { useHistoryStore } from '~/stores/history'

export default defineComponent({
  components: {
    CartridgeCard
  },
  setup () {
    return {
      history: useHistoryStore()
    }
  },
  computed: {
    dsvs (): Dsv[] {
      return this.history.dsvs
    }
  },
  methods: {
    addFile (): void {
      const dsv: Dsv = new Dsv()
      dsv.name = `added dsv ${this.history.dsvs.length}`
      this.history.add(dsv)
    }
  }
})
