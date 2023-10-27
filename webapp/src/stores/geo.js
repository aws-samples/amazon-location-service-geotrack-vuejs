import { defineStore } from "pinia";
import Location from "aws-sdk/clients/location";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";
import { Auth } from "aws-amplify";
import circle from '@turf/circle'

// import * as subscriptions from "../graphql/subscriptions";
// import { v4 as uuidv4 } from 'uuid';

import { useUserStore } from "../stores/user";


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

                const results = await API.graphql({
                    query: queries.deviceIdByTripStatus,
                    variables: { status: "inroute" },
                    authToken: this.userStore.token
                });
                for (let i = 0; i < results.data.statusTrips.trips.length; i++) {
                    deviceIds.push(results.data.statusTrips.trips[i].driver.deviceId)
                }
                console.log("Drivers in rounte: " + deviceIds.length);
                console.groupEnd();
                return deviceIds;
            } catch (error) {
                console.error(error);
                console.groupEnd();
                throw error;
            }
        },

        async saveGeoFence(name, polygonVertices) {
            const locationService = new Location({
                credentials: await Auth.currentUserCredentials(),
                region: import.meta.env.VITE_AWS_REGION,
            });
            return new Promise((resolve, reject) => {
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

                    locationService.putGeofence(geoParams, function (err, data) {
                        if (err) {
                            console.log(err, err.stack);
                            reject(null);
                        }
                        else {
                            console.log("Saved on Amazon Location Service: " + data.GeofenceId);
                            geoFenceId = data.GeofenceId
                            resolve(geoFenceId);
                        }
                    })

                    this.loading = false;
                    console.groupEnd();
                    return geoFenceId

                } catch (error) {
                    console.error(error);
                    this.loading = false;
                    console.groupEnd();
                    reject("Rejected");
                    throw error;
                }
            });
        },

        async calculateRoute() {
            const locationService = new Location({
                credentials: await Auth.currentUserCredentials(),
                region: import.meta.env.VITE_AWS_REGION,
            });
            
            return new Promise((resolve, reject) => {
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

                locationService.calculateRoute(params, function (err, data) {
                    if (err) {
                        console.error(err, err.stack);
                        console.groupEnd();
                        reject(null);
                    }
                    else {
                        this.routeSteps = [...data.Legs[0].Geometry.LineString];
                        this.routeSummary = data.Summary;
                        console.groupEnd();
                        resolve({ "summary": data.Summary, "steps": [...data.Legs[0].Geometry.LineString] });
                    }
                })
            });
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
                const locationService = new Location({
                    credentials: await Auth.currentUserCredentials(),
                    region: import.meta.env.VITE_AWS_REGION,
                });

                locationService.listGeofences({ CollectionName: import.meta.env.VITE_GEOFENCE }, (err, response) => {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {
                        if (response && response.Entries.length > 0) {
                            for (let i = 0; i < response.Entries.length; i++) {
                                if (response.Entries[i].Status == "ACTIVE") {
                                    geoFences.push({
                                        id: response.Entries[i].GeofenceId,
                                        geoFenceName: response.Entries[i].GeofenceId,
                                        boundary: response.Entries[i].Geometry.Polygon
                                    })
                                }
                            }
                        }
                    }
                });

                //console.log(usersList);
                this.geoFenceList = geoFences;
                this.loading = false;
                console.groupEnd();
            } catch (error) {
                console.error(error);
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
                const tripResults = await API.graphql({
                    query: queries.listTrips,
                    authToken: this.userStore.token
                });
                tripsList = [...tripResults.data.listTrips.trips]
                this.loading = false;
                console.groupEnd();
                return tripsList;
            } catch (error) {
                console.error(error);
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
                const driverResults = await API.graphql({
                    query: queries.listDrivers,
                    authToken: this.userStore.token
                });
                driversList = [...driverResults.data.listDrivers.drivers]
                this.loading = false;
                console.groupEnd();
                return driversList;
            } catch (error) {
                console.error(error);
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


                result = await API.graphql({
                    query: mutations.saveDriver,
                    variables: { input: driverInput },
                    authToken: this.userStore.token
                });

                this.loading = false;
                this.driverRec = result;
                console.groupEnd();
                return result;
            } catch (error) {
                console.error(error);
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
                
                console.log("calculating routing")
                route = await this.calculateRoute()
                
                this.geoFencePolygon = this.calculateGeoFence([this.destCoord.lng, this.destCoord.lat]);

                const geoFenceId = await this.saveGeoFence(
                    this.uniqueId(),
                    this.geoFencePolygon[0]
                );

                if (geoFenceId == null) {
                    console.error("Error saving geoFence")
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

                result = await API.graphql({
                    query: mutations.saveTrip,
                    variables: { input: tripInput },
                    authToken: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;
            } catch (error) {
                console.error(error);
            }
        },

        async delDriver(id) {
            try {
                console.group("delDriver");
                this.loading = true;
                let result = "";

                result = await API.graphql({
                    query: mutations.delDriver,
                    variables: { id: id },
                    authToken: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;

            } catch (error) {
                console.error(error);
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

                result = await API.graphql({
                    query: mutations.delTrip,
                    variables: { id: id },
                    authToken: this.userStore.token
                });

                this.loading = false;
                console.groupEnd();
                return result;

            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

    },
});