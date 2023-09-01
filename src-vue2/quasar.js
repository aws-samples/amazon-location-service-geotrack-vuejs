import Vue from 'vue'

import './styles/quasar.sass'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import {
  Quasar,
  QDialog,
  Notify,
  ClosePopup,
  QScrollArea
} from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: { QDialog, QScrollArea },
  directives: { ClosePopup },
  plugins: { Notify }
 })