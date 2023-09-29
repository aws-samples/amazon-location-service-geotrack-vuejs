import { defineStore } from "pinia";
import Location from "aws-sdk/clients/location";
import { API, graphqlOperation } from "aws-amplify";
import * as mutations from "../graphql/mutations";
import * as queries from "../graphql/queries";
// import * as subscriptions from "../graphql/subscriptions";
// import { v4 as uuidv4 } from 'uuid';

import { useUserStore } from "../stores/user";

export const useGeoStore = defineStore("geo", {
    state: () => ({
        userStore: useUserStore(),
        agentList: [],
        loading: false,
        paginationToken: "",
        agentRec: "",
        deviceRec: "",
        depCoord: [],
        destCoord: [],
        routeSummary: "",
        routeSteps: [],
        deliveryList: [],
        geoFenceId: "",
        geoFencePolygon: [],
        devicesIdsInRoute: [],
        locationList: []
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
                console.groupEnd();
            } catch (error) {
                console.error(error);
                console.groupEnd();
                throw error;
            }
        },
        
        calculateRoute(credentials, depLngLat, destLngLat) {
                return new Promise((resolve, reject) => {   
                    console.group("calculateRoute");
                    let locationService = new Location({
                        credentials: credentials,
                        region: import.meta.env.VITE_AWS_REGION,
                    });
        
                    var params = {
                        CalculatorName: import.meta.env.VITE_GEOROUTE_CALCULATION,
                        DeparturePosition: [
                        depLngLat.lng,
                        depLngLat.lat,
                        ],
                        DestinationPosition: [
                        destLngLat.lng,
                        destLngLat.lat,
                        ],
                        DepartNow: false,
                        IncludeLegGeometry: true,
                        TravelMode: 'Car'
                    };    
                    locationService.calculateRoute(params, function(err, data) {
                        if (err) { 
                            console.error(err, err.stack);
                            reject("Rejected");
                        }
                        else {
                            this.routeSteps =  data.Legs[0].Geometry.LineString;
                            this.routeSummary = data.Summary;
                            console.groupEnd();
                            resolve("Resolved");
                        }
                    })
                });
        },
        
        saveGeoFence(name, polygonVertices, credentials) {
                return new Promise((resolve, reject) => {
                    try {
                        console.group("saveGeoFence");
                        this.loading = true;
        
                        let locationService = new Location({
                            credentials: credentials,
                            region: import.meta.env.VITE_AWS_REGION,
                        });    
        
                        const geoParams = {
                            CollectionName: import.meta.env.VITE_GEOFENCE,
                            GeofenceId: name,
                            Geometry: {
                                Polygon: [polygonVertices]
                            }
                        }
                        
                            locationService.putGeofence(geoParams, function(err, data) {
                            if (err) { 
                                console.log(err, err.stack);
                                reject("Rejected");
                            }
                            else { 
                                console.log("Saved on Amazon Location Service: " + data.GeofenceId);
                                this.geoFenceId = data.GeofenceId                                
                                resolve("Resolved");                                  
                                }                
                            })      
                        
                        this.loading = false;
                        console.groupEnd();
                            
        
                    } catch (error) {
                        console.error(error);
                        this.loading = false;
                        console.groupEnd(); 
                        reject("Rejected");       
                        throw error;
                    }
                });
            },
        
        fetchGeoFenceItems(credentials) {
            try {
                let locations = [];
                console.group("fetchGeoFenceItems");
                this.loading = true;
                this.locationList = [];
        
                let locationService = new Location({
                    credentials: credentials,
                    region: import.meta.env.VITE_AWS_REGION,
                });
        
                locationService.listGeofences({ CollectionName: import.meta.env.VITE_GEOFENCE }, (err, response) => {
                    if (err) console.log(err, err.stack); // an error occurred
                    else {                
                        if (response && response.Entries.length > 0) {
                            for (let i = 0; i < response.Entries.length; i++) {
                                if (response.Entries[i].Status == "ACTIVE") {
                                    locations.push({
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
                this.locationList = locations;
                this.loading = false;
                console.groupEnd();
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },
        
        async fetchDeliveryAgents() {
            try {
                let alist = null;
                console.group("fetchDeliveryAgents");
                this.loading = true;
                this.agentList = [];                
        
                const {
                    // @ts-ignore
                    data: { listDeliveryAgents: { items: results } }
                } = await API.graphql(graphqlOperation(listDeliveryAgents));
        
                alist = results
                //console.log(agentsList)        
                this.agentList = alist;
                this.loading = false;
                console.groupEnd();
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },
        
        async saveAgent(id, fullName, deliveryType, agentDeviceId) {
            try {
                console.group("saveagent");
                this.loading = true;
                let result = "";
        
                if (id != null && id.length > 2) {
                    var curAgentInput = {
                        id: id,
                        fullName: fullName,
                        deliveryType: deliveryType,
                        deliveryAgentDeviceId: agentDeviceId
                    }
                    const {
                        // @ts-ignore
                        data: { updateDeliveryAgent: agentObj }
                    } = await API.graphql(graphqlOperation(updateDeliveryAgent, {
                        input: curAgentInput
                    }));
                    result = agentObj
                } else {
                    var newAgentInput = {
                        fullName: fullName,
                        deliveryType: deliveryType,
                        deliveryAgentDeviceId: agentDeviceId
                    }
                    const {
                        // @ts-ignore
                        data: { createDeliveryAgent: agentObj }
                    } = await API.graphql(graphqlOperation(createDeliveryAgent, {
                        input: newAgentInput
                    }));
                    result = agentObj
                }
        
                this.loading = false; 
                this.agentRec = result;       
                console.groupEnd();
                //console.log(result);
                return result;
            } catch (error) {
                console.error(error);
                this.loading = false;
                console.groupEnd();
                throw error;
            }
        },
        
        async saveDevice(id, agentId, deviceType, isNewDevice) {
            try {
                console.group("saveDevice");
                this.loading = true;
                let result = "";
                var deviceInput = {
                    id: id,
                    deliveryAgentId: agentId,
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
        
        async delAgent(id) {
            try {
                console.group("delAgent");
                this.loading = true;
                
                var delInput = {
                    id: id
                }
                const {
                    // @ts-ignore
                    data: { deleteDeliveryAgent: result }
                } = await API.graphql(graphqlOperation(deleteDeliveryAgent, {
                    input: delInput
                }));
        
                const {
                    // @ts-ignore
                    data: { listDeliveryInfos: { items: results } }
                } = await API.graphql(graphqlOperation(listDeliveryInfos));
        
                if (results && results.length > 0) {
                    for (let i = 0; i < this.results.length; i++) {
                        if (results[i].deliveryAgent.id === id) {
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
        
        async delDevice(id)  {
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
        
        async fetchDeliveryInfoList() {
            try {
                let infoList = null;
                console.group("fetchdeliveryinfolist");
                this.loading = true;
                this.deliveryList = [];                
        
                const {
                    // @ts-ignore
                    data: { listDeliveryInfos: { items: results } }
                } = await API.graphql(graphqlOperation(listDeliveryInfos));
        
                infoList = results
                this.deliveryList = infoList;
                this.loading = false;
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
                deliveryInfoDeliveryAgentId ) {
            try {
                console.group("saveadeliveryinfo");
                this.loading = true;
                let result = "";
        
                var deliveryInfoInput = {
                    deliveryInfoDeliveryAgentId: deliveryInfoDeliveryAgentId,
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