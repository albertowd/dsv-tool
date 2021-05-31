import { MutationTree } from 'vuex'

import Sav from '~/models/Sav'

function fetchLocalState (): Sav[] {
  if (localStorage.history) {
    const objs: any[] = JSON.parse(localStorage.history)
    return objs.map((obj: any): Sav => Object.assign(new Sav(), obj))
  } else {
    return []
  }
}

export const state = () => ({
  savs: fetchLocalState() as Sav[]
})

export type HistoryState = ReturnType<typeof state>

export const mutations: MutationTree<HistoryState> = {
  add: (state: HistoryState, sav: Sav): void => {
    state.savs.push(sav)
    localStorage.history = JSON.stringify(state.savs)
  },
  clear: (state: HistoryState): void => {
    state.savs = []
    localStorage.history = JSON.stringify(state.savs)
  },
  import: (state: HistoryState, historyBuffer: string): void => {
    const historyObjs: any[] = JSON.parse(historyBuffer)
    state.savs = historyObjs.map((obj: any): Sav => Object.assign(new Sav(), obj))
    localStorage.history = JSON.stringify(state.savs)
  },
  remove: (state: HistoryState, sav: Sav): void => {
    state.savs = state.savs.filter((stored: Sav) => sav.id !== stored.id)
    localStorage.history = JSON.stringify(state.savs)
  }
}
