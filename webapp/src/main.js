//import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
    region: import.meta.env.VITE_AWS_REGION, // REQUIRED - Amazon Cognito Region
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, // OPTIONAL - Amazon Cognito User Pool ID for authenticated user access
    userPoolWebClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID, // OPTIONAL - Amazon Cognito Web Client ID for authenticated user access
  },
  API: {
    graphql_endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
  },
  geo: {
    AmazonLocationService: {
      maps: {
        items: {
          [import.meta.env.VITE_GEOMAP]: { // REQUIRED - Amazon Location Service Map resource name
            style: "VectorEsriStreets", // REQUIRED - String representing the style of map resource
          },
        },
        default: import.meta.env.VITE_GEOMAP, // REQUIRED - Amazon Location Service Map resource name to set as default
      },
      search_indices: {
        items: [import.meta.env.VITE_GEOPLACE_INDEX], // REQUIRED - Amazon Location Service Place Index name
        default: import.meta.env.VITE_GEOPLACE_INDEX, // REQUIRED - Amazon Location Service Place Index name to set as default
      },
      region: import.meta.env.VITE_AWS_REGION // REQUIRED - Amazon Location Service Region
    },
  },
})

// Amplify.configure({
//     aws_project_region: import.meta.env.VITE_AWS_REGION,
//     aws_cognito_identity_pool_id: import.meta.env.VITE_IDENTITY_POOL_ID,                                    
//     aws_cognito_region: import.meta.env.VITE_AWS_REGION,
//     aws_user_pools_id: import.meta.env.VITE_COGNITO_USER_POOL_ID,
//     aws_user_pools_web_client_id: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID,
//     aws_appsync_region: import.meta.env.VITE_AWS_REGION,
//     aws_appsync_graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
//     aws_appsync_authenticationType: 'AMAZON_COGNITO_USER_POOLS'
//   });

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
app.use(vuetify)
app.use(router)

app.mount('#app')
