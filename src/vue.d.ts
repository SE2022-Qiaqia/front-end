import { ComponentCustomProperties } from 'vue'
import { Store } from 'vuex'
import { FinalState } from './store/types'

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $store: Store<FinalState>
  }
}