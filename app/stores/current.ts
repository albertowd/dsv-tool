import { defineStore } from 'pinia'

import Dsv from '~/models/Dsv'

export const useCurrentStore = defineStore('current', {
  state: () => ({
    dsv: new Dsv() as Dsv
  }),
  actions: {
    clear (): void {
      this.dsv = new Dsv()
    },
    update (dsv: Dsv): void {
      this.dsv = dsv
    }
  }
})
