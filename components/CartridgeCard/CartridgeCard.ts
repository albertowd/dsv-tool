import Vue from 'vue'

import CartridgeInfo from '~/components/CartridgeInfo/CartridgeInfo.vue'
import CartridgeInput from '~/components/CartridgeInput/CartridgeInput.vue'

export default Vue.extend({
  components: {
    CartridgeInfo,
    CartridgeInput
  },
  props: {
    dsvIndex: {
      default: -1,
      type: Number
    }
  }
})
