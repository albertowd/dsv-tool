import Vue from 'vue'

import CartridgeInfo from './CartridgeInfo/CartridgeInfo.vue'
import SavInfo from './SavInfo/SavInfo.vue'

import Sav from '~/models/Sav'
import { ConvertState } from '~/store/convert'
import { HistoryState } from '~/store/history'

export default Vue.extend({
  components: {
    CartridgeInfo,
    SavInfo
  },
  props: {
    savIndex: {
      default: -1,
      type: Number
    }
  },
  data () {
    return {
      highlightClass: '' as string
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
  },
  mounted () {
    for (const evt of ['dragenter', 'dragover', 'dragleave', 'drop']) {
      (this.$refs.saveCard as any).$refs.link.addEventListener(evt, (evt: DragEvent): void => {
        evt.preventDefault()
        evt.stopPropagation()
      }, false)
    }

    for (const evt of ['dragenter', 'dragover']) {
      (this.$refs.saveCard as any).$refs.link.addEventListener(evt, (): void => { this.highlightClass = 'highlight' }, false)
    }

    for (const evt of ['dragleave', 'drop']) {
      (this.$refs.saveCard as any).$refs.link.addEventListener(evt, (): void => { this.highlightClass = '' }, false)
    }

    (this.$refs.saveCard as any).$refs.link.addEventListener('drop', (evt: DragEvent): void => {
      const dt = evt.dataTransfer
      if (dt) {
        this.dropFiles(dt.files)
      }
    }, false)
  },
  methods: {
    clearCurrent (): void {
      if (this.savIndex < 0) {
        this.$store.commit('convert/clear')
      } else {
        this.$store.commit('history/remove', this.sav)
      }
    },
    downloadDsv (): void {
      if (this.sav) {
        const a: any = document.createElement('a')
        a.download = this.sav.name.replace('.sav', '.dsv')
        a.href = this.$downloadableDsv(this.sav)
        a.click()
        a.remove()
      }
    },
    downloadSav (): void {
      if (this.sav) {
        const a: any = document.createElement('a')
        a.download = this.sav.name.replace('.dsv', '.sav')
        a.href = this.$downloadableSav(this.sav)
        a.click()
        a.remove()
      }
    },
    dropFiles (files: FileList): void {
      for (let fileIndex: number = 0; fileIndex < File.length; fileIndex++) {
        this.$fileToSav(files[fileIndex])
          .then((sav: Sav | void): void => {
            if (sav) {
              this.$store.commit('convert/update', sav)
              this.$store.commit('history/add', sav)
            } else {
              this.$store.commit('current/update', null)
            }
          })
      }
    }
  }
})
