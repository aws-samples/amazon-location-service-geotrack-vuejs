import Vue from 'vue'
import App from './App.vue'
import Vuelidate from 'vuelidate'
import router from './router'
import store from './store'
import './quasar'
import axios from 'axios'

Vue.prototype.$http = axios

Vue.config.productionTip = false

import Amplify, * as AmplifyModules from 'aws-amplify'

import { AmplifyPlugin } from 'aws-amplify-vue'
import aws_exports from '../aws-exports'

Amplify.configure(aws_exports)

Vue.use(Vuelidate)
Vue.use(AmplifyPlugin, AmplifyModules)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
