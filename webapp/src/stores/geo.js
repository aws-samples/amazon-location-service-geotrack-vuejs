import { defineStore } from "pinia";
import Location from "aws-sdk/clients/location";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";
import { Auth } from "aws-amplify";
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
        routeSummary: null,
        routeSteps: null,
        geoFencePolygon: [],
        devicesIdsInRoute: [],
        geoFenceList: []
    }),

    actions: {
        async fetchDevicesIdsInRoute() {
            try {
                let deviceIds = [];
                console.group("fetchdevicesidsinroute");

                const results = await API.graphql({
                    query: queries.deviceIdByTripStatus,
                    variables: {
                        status: "inroute"
                    },
                    authToken: this.userStore.token
                });
                let trips = results.data.statusTrips.trips
                for (let i = 0; i < trips.length; i++) {
                    deviceIds.push(trips[i].driver.deviceId)
                }
                this.devicesIdsInRoute = [...deviceIds];
                console.groupEnd();
            } catch (error) {
                console.error(error);
                console.groupEnd();
                throw error;
            }
        },       

        saveGeoFence(name, polygonVertices) {
            const locationService = new Location({
                credentials: useUserStore.credentials,
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
                            reject("Rejected");
                        }
                        else {
                            console.log("Saved on Amazon Location Service: " + data.GeofenceId);
                            geoFenceId = data.GeofenceId
                            resolve("Resolved");
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

        fetchGeoFenceItems() {
            try {
                let geoFences = [];
                console.group("fetchGeoFenceItems");
                this.loading = true;
                this.geoFenceList = [];
                const locationService = new Location({
                    credentials: useUserStore.credentials,
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
                tripsList = [...tripResults.data.allTrips.trips]
                this.loading = false;
                console.log()
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
                driversList = [...driverResults.data.allDrivers.drivers]
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

        async createDriver(driverRecord) {
            try {
                console.group("createDriver");
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
                    driverInput["id"] = driverRecordid
                }

                if (driverRecord.status != null && driverRecord.status.length > 2) {
                    driverInput["status"] = driverRecord.status
                } else {
                    driverInput["status"] = "active"
                }

                result = await API.graphql({
                    query: mutations.createDriver,
                    variables: { input: driverInput },
                    authToken: this.userStore.token
                });

                this.loading = false;
                this.driverRec = result;
                console.groupEnd();
                console.log(result);
                return result;
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async saveDevice(id, driverId, deviceType, isNewDevice) {
            try {
                console.group("saveDevice");
                this.loading = true;
                let result = "";
                var deviceInput = {
                    id: id,
                    deliverydriverId: driverId,
                    deviceType: deviceType
                }
                if (!isNewDevice) {
                    const {
                        // @ts-ignore
                        data: { updateDevice: devId }
                    } = await API.graphql(graphqlOperation(updateDevice, {
                        input: deviceInput
                    }));
                    result = devId
                } else {
                    const {
                        // @ts-ignore
                        data: { createDevice: devId }
                    } = await API.graphql(graphqlOperation(createDevice, {
                        input: deviceInput
                    }));
                    result = devId
                }
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

        async deldriver(id) {
            try {
                console.group("deldriver");
                this.loading = true;

                var delInput = {
                    id: id
                }
                const {
                    // @ts-ignore
                    data: { deleteDeliverydriver: result }
                } = await API.graphql(graphqlOperation(deleteDeliverydriver, {
                    input: delInput
                }));

                const {
                    // @ts-ignore
                    data: { listDeliveryInfos: { items: results } }
                } = await API.graphql(graphqlOperation(listDeliveryInfos));

                if (results && results.length > 0) {
                    for (let i = 0; i < this.results.length; i++) {
                        if (results[i].deliverydriver.id === id) {
                            delInput.id = results[i].id
                            const {
                                // @ts-ignore
                                data: { deleteDeliveryInfo: delinfo }
                            } = await API.graphql(graphqlOperation(deleteDeliveryInfo, {
                                input: delInput
                            }));
                            console.log(delinfo.id);
                        }
                    }
                }

                this.loading = false;
                console.log(result.id);
                console.groupEnd();
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async delDevice(id) {
            try {
                console.group("delDevice");
                this.loading = true;

                var delInput = {
                    id: id
                }

                const {
                    // @ts-ignore
                    data: { deleteDevice: result }
                } = await API.graphql(graphqlOperation(deleteDevice, {
                    input: delInput
                }));

                this.loading = false;
                console.log(result.id);
                console.groupEnd();
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async delDelivery(id) {
            try {
                console.group("delDelivery");
                this.loading = true;

                var delInput = {
                    id: id
                }

                const {
                    // @ts-ignore
                    data: { deleteDeliveryInfo: result }
                } = await API.graphql(graphqlOperation(deleteDeliveryInfo, {
                    input: delInput
                }));

                this.loading = false;
                console.log(result.id);
                console.groupEnd();
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },

        async saveDeliveryInfo(id,
            geoStart,
            geoEnd,
            duration,
            distance,
            geoFenceId,
            userPhone,
            expireAt,
            routeStatus,
            deliveryInfoDeliverydriverId) {
            try {
                console.group("saveadeliveryinfo");
                this.loading = true;
                let result = "";

                var deliveryInfoInput = {
                    deliveryInfoDeliverydriverId: deliveryInfoDeliverydriverId,
                    geoStart: geoStart,
                    geoEnd: geoEnd,
                    duration: duration,
                    distance: distance,
                    geoFenceId: geoFenceId,
                    userPhone: userPhone,
                    expireAt: expireAt,
                    status: routeStatus,
                }

                if (id != null && id.length > 2) {
                    deliveryInfoInput["id"] = id

                    const {
                        // @ts-ignore
                        data: { updateDeliveryInfo: deliveryInfoObj }
                    } = await API.graphql(graphqlOperation(updateDeliveryInfo, {
                        input: deliveryInfoInput
                    }));
                    result = deliveryInfoObj
                } else {
                    const {
                        // @ts-ignore
                        data: { createDeliveryInfo: deliveryInfoObj }
                    } = await API.graphql(graphqlOperation(createDeliveryInfo, {
                        input: deliveryInfoInput
                    }));
                    result = deliveryInfoObj
                }

                this.loading = false;
                console.groupEnd();
                return result;
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        }
    },
});