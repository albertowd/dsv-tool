import { defineComponent } from 'vue'

import CartridgeCard from '~/components/CartridgeCard/CartridgeCard.vue'
import type Dsv from '~/models/Dsv'
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
    clear (): void {
      this.history.clear()
    }
  }
})
