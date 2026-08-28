import { defineStore } from 'pinia'

import type Dsv from '~/models/Dsv'

export const useHistoryStore = defineStore('history', {
  state: () => ({
    dsvs: [] as Dsv[]
  }),
  actions: {
    add (dsv: Dsv): void {
      this.dsvs.push(dsv)
    },
    clear (): void {
      this.dsvs = []
    },
    remove (dsv: Dsv): void {
      this.dsvs = this.dsvs.filter((stored: Dsv) => dsv.id === stored.id)
    }
  }
})
