import { defineComponent } from 'vue'

const DND_EVENTS: string[] = ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop']

export default defineComponent({
  data () {
    return {
      dragAndDropCapable: false,
      uploadedFile: null as File | null
    }
  },
  mounted (): void {
    this.dragAndDropCapable = this.determineDragAndDropCapable()

    const fileInputDiv = this.$refs.fileInputDiv as HTMLElement | undefined
    if (this.dragAndDropCapable && fileInputDiv) {
      for (const dndEvent of DND_EVENTS) {
        fileInputDiv.addEventListener(dndEvent, (evt: Event): void => {
          evt.preventDefault()
          evt.stopPropagation()
        })
      }

      fileInputDiv.addEventListener('drop', (evt: Event): void => {
        const dropped: FileList | undefined = (evt as DragEvent).dataTransfer?.files
        if (dropped && dropped.length > 0) {
          console.log('dropped file name: ' + dropped[0]!.name)
          this.uploadedFile = dropped[0]!
        }
      })
    }
  },
  methods: {
    determineDragAndDropCapable (): boolean {
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
