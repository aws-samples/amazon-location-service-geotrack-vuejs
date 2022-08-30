import Vue from 'vue'

import './styles/quasar.sass'
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import {
  Quasar,
  QDialog,
  Notify,
  ClosePopup,
  QScrollArea,
  QLayout,
  QToolbar,
  QBanner,
  QCard,
  QPageContainer,
  QBtn,
  QForm,
  QInput,
  QSpace,
  QSeparator,
    QBtnDropdown,
    QDrawer,
    QItem,
  QCardSection,
  QCardActions,
  QIcon
} from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: { 
    QDialog,
    QDrawer,
    QLayout,
    QBtnDropdown,
    QItem,
    QScrollArea, 
    QToolbar,
    QBanner, 
    QCard, 
    QPageContainer,
    QBtn,
    QForm,
    QInput,
    QSpace,
    QSeparator,
    QCardSection,
    QCardActions,
    QIcon },
  directives: { ClosePopup },
  plugins: { Notify }
 })