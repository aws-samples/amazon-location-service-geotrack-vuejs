## Amazon Location Service GeoTrack Vue.js

Location data is a vital ingredient in today's applications, enabling capabilities ranging from asset tracking to location-based marketing. 

With [Amazon Location Service](https://aws.amazon.com/location/), you can easily add capabilities such as maps, points of interest, geocoding, routing, geofences, and tracking to applications. You retain control of your location data with Amazon Location, so you can combine proprietary data with data from the service. Amazon Location provides cost-effective location-based services (LBS) using high-quality data from global, trusted providers Esri and HERE Technologies.

This repo contains a Vue.js prototype that controls a delivery system. For the prototype to work you need to first create the agents and associate unique IoT device Ids to them. Once you have the delivery agents in the system, you can go add the routes they need to go. The form leverages Amazon Location Maps to display de map, Places to fing the latitute and longitute associated to the address typed, Geogence to define a perimeter at the destination so the person can receive a text message when the driver is near by, and Routes to calculate the estimated time and distance. 

At the toolbar there is a fire icon button. Upon clicking this button, the application will simulate the existent delivery routes. An AWS Lambda reads the start and end positions of each delivery route, calculates the route and sends IoT messages with the IoT devices associated to the delivery agents reporting their geo-location over time. The application does not prevent having two routes with the same IoT device, which will produce inconsistent position.

## Architecture Overview

<img src="./images/architecture.jpg"  width="800"/>

## Stack

* **Front-end** - Vue.js as the core framework, [Vuetify](https://vuetifyjs.com/en/) for UI, [MapLibre](https://github.com/maplibre) for map visualiztion, [AWS Amplify](https://aws.amazon.com/amplify/) libraries for Auth UI component and AWS integration.
* **Data** - User data is saved in [Amazon DynamoDB](https://aws.amazon.com/dynamodb/) via GraphQL using [AWS AppSync](https://aws.amazon.com/appsync/). Devices GPS positions are stored in Amazon Location Service Tracker. 
* **Auth** - [Amazon Cognito](https://aws.amazon.com/cognito/) provides JSON Web Tokens (JWT) and along with AppSync fine-grained authorization on what data types users can access.
* **IoT** - [AWS IoT](https://aws.amazon.com/iot/) with topics and rules. 
* **Serverless** - [AWS Lambda](https://aws.amazon.com/lambda/) for backend processes. 

## User Interface

#### Real-time tracking visualization
<img src="./images/geotrack-home.png"  width="800"/>

#### Managing Delivery Agents
<img src="./images/geotrack-agent.png"  width="500"/>

#### Managing Delivery Routes
<img src="./images/geotrack-delivery.png"  width="800"/>

# Deployment
To deploy this solution into your AWS Account please follow our [Deployment Guide](./docs/deployment_guide.md)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.

