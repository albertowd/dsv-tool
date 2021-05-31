import { MutationTree } from 'vuex'

import Sav from '~/models/Sav'

function fetchLocalState (): Sav | null {
  if (localStorage.convert) {
    const obj: any = JSON.parse(localStorage.convert)
    return Object.assign(new Sav(), obj)
  } else {
    return null
  }
}

export const state = () => ({
  sav: fetchLocalState() as Sav | null
})

export type ConvertState = ReturnType<typeof state>

export const mutations: MutationTree<ConvertState> = {
  clear: (state: ConvertState): void => {
    state.sav = null
    localStorage.convert = JSON.stringify(state.sav)
  },
  update: (state: ConvertState, sav: Sav): void => {
    state.sav = sav
    localStorage.convert = JSON.stringify(state.sav)
  }
}
