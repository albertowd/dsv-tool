import { MutationTree } from 'vuex'

import Dsv from '~/models/Dsv'

export const state = () => ({
  dsvs: [] as Dsv[]
})

export type HistoryState = ReturnType<typeof state>

export const mutations: MutationTree<HistoryState> = {
  add: (state: HistoryState, dsv: Dsv): void => {
    state.dsvs.push(dsv)
  },
  clear: (state: HistoryState): void => {
    state.dsvs = []
  },
  remove: (state: HistoryState, dsv: Dsv): void => {
    state.dsvs = state.dsvs.filter((stored: Dsv) => dsv.id === stored.id)
  }
}
