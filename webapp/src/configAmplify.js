import { Amplify } from 'aws-amplify';

export function configAmplify() {

    Amplify.configure({
        Auth: {
            Cognito: {
                identityPoolId: import.meta.env.VITE_IDENTITY_POOL_ID, // REQUIRED - Amazon Cognito Identity Pool ID
                region: import.meta.env.VITE_AWS_REGION, // REQUIRED - Amazon Cognito Region
                userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID, // OPTIONAL - Amazon Cognito User Pool ID for authenticated user access
                userPoolClientId: import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID, // OPTIONAL - Amazon Cognito Web Client ID for authenticated user access
            },
        },
        API: {
            GraphQL: {
                endpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT,
                region: import.meta.env.VITE_AWS_REGION,
                defaultAuthMode: 'userPool'
            }
        },
        Geo: {
            LocationService: {
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

}