import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { Amplify } from 'aws-amplify';

Amplify.configure({
    aws_project_region: import.meta.env.VITE_APP_AWS_REGION,
    aws_cognito_identity_pool_id: import.meta.env.VITE_APP_IDENTITY_POOL_ID,                                    
    aws_cognito_region: import.meta.env.VITE_APP_AWS_REGION,
    aws_user_pools_id: import.meta.env.VITE_APP_COGNITO_USER_POOL_ID,
    aws_user_pools_web_client_id: import.meta.env.VITE_APP_COGNITO_USER_POOL_CLIENT_ID,
    aws_appsync_region: import.meta.env.VITE_APP_AWS_REGION,
    aws_appsync_graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
    aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
  });

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)

app.mount('#app')
