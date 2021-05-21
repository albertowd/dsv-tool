import { MutationTree } from 'vuex'

import Dsv from '~/models/Dsv'

export const state = () => ({
  dsv: new Dsv() as Dsv
})

export type CurrentState = ReturnType<typeof state>

export const mutations: MutationTree<CurrentState> = {
  clear: (state: CurrentState): void => {
    state.dsv = new Dsv()
  },
  update: (state: CurrentState, dsv: Dsv): void => {
    state.dsv = dsv
  }
}
