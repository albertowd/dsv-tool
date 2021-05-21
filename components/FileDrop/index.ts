import Vue from 'vue'

export default Vue.extend({
  data (): any {
    return {
      dragAndDropCapable: false as Boolean,
      uploadedFile: null as File | null
    }
  },
  mounted (): void {
    this.dragAndDropCapable = this.determineDragAndDropCapable()
    if (this.dragAndDropCapable) {
      for (const dndEvent of ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']) {
        this.$refs.fileInputDiv.addEventListener(dndEvent, (evt: Event): void => {
          evt.preventDefault()
          evt.stopPropagation()
        })
      }

      this.$refs.fileInputDiv.addEventListener('drop', (evt: any): void => {
        if (evt.dataTransfer.files.length > 0) {
          console.log('dropped file name: ' + evt.dataTransfer.files[0].name)
          this.uploadedFile = evt.dataTransfer.files[0]
        }
      })
    }
  },
  methods: {
    determineDragAndDropCapable (): Boolean {
      const div = document.createElement('div')
      const dndAble = (('draggable' in div) ||
      ('ondragstart' in div && 'ondrop' in div)) &&
      'FormData' in window &&
      'FileReader' in window
      div.remove()
      console.log(`DND able: ${dndAble}`)
      return dndAble
    }
  }
})
