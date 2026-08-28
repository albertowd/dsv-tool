import { defineComponent } from 'vue'

import type Dsv from '~/models/Dsv'
import { useCurrentStore } from '~/stores/current'
import { useHistoryStore } from '~/stores/history'

export default defineComponent({
  props: {
    dsvIndex: {
      default: -1,
      type: Number
    }
  },
  setup () {
    return {
      current: useCurrentStore(),
      history: useHistoryStore()
    }
  },
  computed: {
    dsv (): Dsv | undefined {
      return this.dsvIndex < 0 ? this.current.dsv : this.history.dsvs[this.dsvIndex]
    }
  }
})
