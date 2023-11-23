import { defineStore } from "pinia";
import { fetchAuthSession } from 'aws-amplify/auth';
import { LocationClient, PutGeofenceCommand, CalculateRouteCommand, ListGeofencesCommand, SearchPlaceIndexForTextCommand, SearchPlaceIndexForPositionCommand } from '@aws-sdk/client-location';
import { generateClient } from 'aws-amplify/api';
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";
import circle from '@turf/circle'
import { useUserStore } from "../stores/user";
import { ConsoleLogger } from 'aws-amplify/utils';
import { configAmplify } from "../configAmplify";

const logger = new ConsoleLogger('geotrack');
configAmplify();

const api_client = generateClient()

const locationClient = async () => {
    const session = await fetchAuthSession();
    const client = new LocationClient({
        credentials: session.credentials,
        region: import.meta.env.VITE_AWS_REGION,
    });
    return client;
};

export const useGeoStore = defineStore("geo", {
    state: () => ({
        userStore: useUserStore(),
        driversList: [],
        loading: false,
        paginationToken: "",
        driverRec: "",
        deviceRec: "",
        depCoord: [],
        destCoord: [],
        routeSummary: {},
        routeSteps: [],
        geoFencePolygon: null,
        devicesIdsInRoute: [],
        geoFenceList: []
    }),

    actions: {
        uniqueId() {
            const dateString = Date.now().toString(36);
            const randomness = Math.random()
                .toString(36)
                .slice(2);
            return dateString + randomness;
        },

        ddbExpirationTime(days) {
            let date = new Date();
            date.setDate(date.getDate() + days);
            return date;
        },

        async fetchDevicesIdsInRoute() {
            try {
                let deviceIds = [];
                console.group("fetchDevicesIdsInRoute");

                const results = await api_client.graphql({
                    query: queries.deviceIdByTripStatus,
                    variables: { status: "inroute" },
                    //authToken: this.userStore.token
                });

                for (let i = 0; i < results.data.statusTrips.trips.length; i++) {
                    deviceIds.push(results.data.statusTrips.trips[i].driver.deviceId)
                }
                logger.info("Drivers in route: " + deviceIds.length);
                console.groupEnd();
                return deviceIds;
            } catch (error) {
                logger.error(error);
                console.groupEnd();
                throw error;
            }
        },

        async saveGeoFence(name, polygonVertices) {
            let geoFenceId = null;
            try {
                console.group("saveGeoFence");
                this.loading = true;

                const geoParams = {
                    CollectionName: import.meta.env.VITE_GEOFENCE,
                    GeofenceId: name,
                    Geometry: {
                        Polygon: [polygonVertices]
                    }
                }

                const locationService = await locationClient();
                const command = new PutGeofenceCommand(geoParams);
                const data = await locationService.send(command);

                if (data && data.GeofenceId) {
                    logger.info("Saved on Amazon Location Service: " + data.GeofenceId);
                    geoFenceId = data.GeofenceId
                }
                else {
                    console.warn(data)
                }

                this.loading = false;
                console.groupEnd();
                return geoFenceId

            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async calculateRoute(depLngLat = null, destLngLat = null) {
            if (depLngLat) {
                this.depCoord = depLngLat;
            }
            if (destLngLat) {
                this.destCoord = destLngLat;
            }

            console.group("calculateRoute");
            var params = {
                CalculatorName: import.meta.env.VITE_GEOROUTE_CALCULATION,
                DeparturePosition: [
                    this.depCoord.lng,
                    this.depCoord.lat,
                ],
                DestinationPosition: [
                    this.destCoord.lng,
                    this.destCoord.lat,
                ],
                DepartNow: false,
                IncludeLegGeometry: true,
                TravelMode: 'Car'
            };

            const locationService = await locationClient();
            const command = new CalculateRouteCommand(params);
            const data = await locationService.send(command);

            if (data && data.Summary) {
                this.routeSteps = [...data.Legs[0].Geometry.LineString];
                this.routeSummary = data.Summary;

                console.groupEnd();
                return ({ "summary": data.Summary, "steps": [...data.Legs[0].Geometry.LineString] });
            }
            else {
                console.warn(data)
                return ({ "summary": "", "steps": [] });
            }

        },

        async searchPlaceIndexForPosition(params) {
            const locationService = await locationClient();
            const command = new SearchPlaceIndexForPositionCommand(params);
            const data = await locationService.send(command);
          
            if (data && response.Results.length > 0) {
                return data.Results[0].Place.Label
            }
            else {
              return []
            }
          },
          
          async searchPlaceIndexForText(params) {
            const locationService = await locationClient();
            const command = new SearchPlaceIndexForTextCommand(params);
            const data = await locationService.send(command);
          
            if (data && data.Results.length > 0) {
              let placeOptions = []
              for (var i = 0; i < data.Results.length; i++) {
                placeOptions.push({
                  title: data.Results[i].Place.Label,
                  value: data.Results[i].Place.Geometry.Point,
                });    
              }
              return placeOptions
            }
            else {
              return []
            }
          },

        calculateGeoFence(center) {
            var options = {
                steps: 10,
                units: "kilometers",
                options: {},
            };
            var radius = 1;
            var polygon = circle(center, radius, options);
            return polygon.geometry.coordinates
        },

        async fetchGeoFenceItems() {
            try {
                let geoFences = [];
                console.group("fetchGeoFenceItems");
                this.loading = true;
                this.geoFenceList = [];

                const locationService = await locationClient();
                const command = new ListGeofencesCommand({ CollectionName: import.meta.env.VITE_GEOFENCE });
                const data = await locationService.send(command);

                if (data && data.Entries.length > 0) {
                    for (let i = 0; i < data.Entries.length; i++) {
                        if (data.Entries[i].Status == "ACTIVE") {
                            geoFences.push({
                                id: data.Entries[i].GeofenceId,
                                geoFenceName: data.Entries[i].GeofenceId,
                                boundary: data.Entries[i].Geometry.Polygon
                            })
                        }
                    }
                }

                //logger.info(usersList);
                this.geoFenceList = geoFences;
                this.loading = false;
                console.groupEnd();
            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async listTrips() {
            let tripsList = null
            try {
                console.group("listTrips");
                this.loading = true;
                this.driversList = [];
                const tripResults = await api_client.graphql({
                    query: queries.listTrips,
                    //authToken: this.userStore.token
                });
                tripsList = [...tripResults.data.listTrips.trips]
                this.loading = false;
                console.groupEnd();
                return tripsList;
            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async listDrivers() {
            let driversList = null
            try {
                console.group("listDrivers");
                this.loading = true;
                this.driversList = [];
                const driverResults = await api_client.graphql({
                    query: queries.listDrivers,
                    //authToken: this.userStore.token
                });
                driversList = [...driverResults.data.listDrivers.drivers]
                this.loading = false;
                console.groupEnd();
                return driversList;
            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async saveDriver(driverRecord) {
            try {
                console.group("saveDriver");
                this.loading = true;
                let result = "";

                var driverInput = {
                    fullName: driverRecord.fullName,
                    email: driverRecord.email,
                    deliveryType: driverRecord.deliveryType,
                    deviceType: driverRecord.deviceType,
                    deviceId: driverRecord.deviceId,
                }

                if (driverRecord.id != null && driverRecord.id.length > 2) {
                    driverInput["id"] = driverRecord.id
                }

                if (driverRecord.status != null && driverRecord.status.length > 2) {
                    driverInput["status"] = driverRecord.status
                } else {
                    driverInput["status"] = "active"
                }


                result = await api_client.graphql({
                    query: mutations.saveDriver,
                    variables: { input: driverInput },
                    //authToken: this.userStore.token
                });

                this.loading = false;
                this.driverRec = result;
                console.groupEnd();
                return result;
            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async saveTrip(tripRecord) {
            try {
                console.group("saveTrip");
                this.loading = true;
                let result = "";
                let route = null;

                logger.info("calculating routing")
                route = await this.calculateRoute()

                this.geoFencePolygon = this.calculateGeoFence([this.destCoord.lng, this.destCoord.lat]);

                const geoFenceId = await this.saveGeoFence(
                    this.uniqueId(),
                    this.geoFencePolygon[0]
                );

                if (geoFenceId == null) {
                    logger.error("Error saving geoFence")
                    return;
                }

                var tripInput = {
                    labelStart: tripRecord.trip.labelStart,
                    geoStart: this.depCoord,
                    labelEnd: tripRecord.trip.labelEnd,
                    geoEnd: this.destCoord,
                    distance: Math.round(route.summary.Distance).toString(),
                    duration: Math.round(
                        route.summary.DurationSeconds / 60
                    ).toString(),
                    geoFenceId: geoFenceId,
                    //expireAt: Math.round(this.ddbExpirationTime(7).getTime()), // Expire the date 7 days from today - DynamoDb Expire
                    status: "accepted",
                    driver: {
                        id: tripRecord.trip.driver.id
                    },
                    clientPhone: tripRecord.trip.clientPhone,
                }

                result = await api_client.graphql({
                    query: mutations.saveTrip,
                    variables: { input: tripInput },
                    //auth: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;
            } catch (error) {
                logger.error(error);
            }
        },

        async delDriver(id) {
            try {
                console.group("delDriver");
                this.loading = true;
                let result = "";

                result = await api_client.graphql({
                    query: mutations.delDriver,
                    variables: { id: id },
                    //authToken: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;

            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async delTrip(id) {
            try {
                console.group("delTrip");
                this.loading = true;
                let result = "";

                result = await api_client.graphql({
                    query: mutations.delTrip,
                    variables: { id: id },
                    //authToken: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;

            } catch (error) {
                logger.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

    },
});