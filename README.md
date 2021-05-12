## Amazon Location Service GeoTrack Vue.js

Location data is a vital ingredient in today's applications, enabling capabilities ranging from asset tracking to location-based marketing. 

With [Amazon Location Service](https://aws.amazon.com/location/), you can easily add capabilities such as maps, points of interest, geocoding, routing, geofences, and tracking to applications. You retain control of your location data with Amazon Location, so you can combine proprietary data with data from the service. Amazon Location provides cost-effective location-based services (LBS) using high-quality data from global, trusted providers Esri and HERE Technologies.

This repo contains a Vue.js application that displays the users last positions reported in the past 15min in a map, leveraging Amplify for authentication. In the Amplify build process, there is automation that automattically creates the Amazon Location Services' resources and associate a policy to Amazon Cognito role for accessing them. 

## Architecture Overview

<img src="./images/architecture.png"  width="800"/>

## Stack

* **Front-end** - Vue.js as the core framework, [Quasar](https://quasar.dev/) for UI, [MapLibre](https://github.com/maplibre) for map visualiztion, [AWS Amplify](https://aws.amazon.com/amplify/) for Auth UI component and AWS integration. 
* **Data** - User data is saved in [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) via GraphQL using [AWS AppSync](https://aws.amazon.com/appsync/). Devices GPS positions are stored in Amazon Location Service Tracker. 
* **Auth** - [Amazon Cognito](https://aws.amazon.com/cognito/) provides JSON Web Tokens (JWT) and along with AppSync fine-grained authorization on what data types users can access.
* **IoT** - [AWS IoT](https://aws.amazon.com/iot/) with topics and rules integrated with an [AWS Lambda](https://aws.amazon.com/lambda/). 


## User Interface

<img src="./images/home.png"  width="800"/>

<img src="./images/map.png"  width="500"/>

## Testing the solution

If you clone this repo, at the root directory you can use the sendTrackingRecords.sh script to sends 4 location data points using the current time from NY Central Park to the Amazon Location Service Tracker. The only parameter that you need to provide is the deviceId.

```bash
./sendTrackingRecords.sh 1111111
Updating Device 1111111 at LGN -73.9687025 LAT 40.7812239 at 2021-05-12T16:30:04Z
```

# Deployment
To deploy this solution into your AWS Account please follow our [Deployment Guide](./docs/deployment_guide.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

