import { API, graphqlOperation } from "aws-amplify";
import { createDeliveryAgent, updateDeliveryAgent, deleteDeliveryAgent, createDevice, updateDevice, deleteDevice } from "../../graphql/mutations";
import { createDeliveryInfo, updateDeliveryInfo, deleteDeliveryInfo } from "../../graphql/mutations";
import { listDeliveryAgents, listDeliveryInfos } from "../../graphql/queries";
import { listDevicesIds } from "../general/queries"
import Location from "aws-sdk/clients/location";
import awsconfig from '../../aws-exports'

export async function fetchDevicesIdsInRoute(
    { commit }) {
    try {
        let deviceIds = [];
        console.group("store/general/actions/fetchdevicesidsinroute");
        commit("SET_LOADER", true);
        commit("SET_DEVICEIDSINROUTE", []);

        const {
            // @ts-ignore
            data: { listDeliveryInfos: { items: results } }
        } = await API.graphql(graphqlOperation(listDevicesIds));        
        for (let i = 0; i < results.length; i++) {
            deviceIds.push(results[i].deliveryAgent.device.id)
        }
        commit("SET_DEVICEIDSINROUTE", deviceIds);
        commit("SET_LOADER", false);
        console.groupEnd();
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export function setDepCoord(
    { commit }, { lnglat }) {
    console.group("store/general/actions/setDepCoord");
    commit("SET_DEPCOORD", lnglat);
    console.groupEnd();
}

export function setDestCoord(
    { commit }, { lnglat }) {
    console.group("store/general/actions/setDestCoord");
    commit("SET_DESTCOORD", lnglat);
    console.groupEnd();
}

export function setRouteSteps(
    { commit }, { rsteps }) {
    console.group("store/general/actions/setRouteSteps");
    commit("SET_ROUTESTEPS", rsteps);
    console.groupEnd();
}

export function setGeoFencePolygon(
    { commit }, { vertices }) {
    console.group("store/general/actions/setGeoFencePolygon");
    commit("SET_GEOFENCE", vertices);
    console.groupEnd();
}

export function calculateRoute(
    { commit }, { credentials, depLngLat, destLngLat}) {
        return new Promise((resolve, reject) => {   
            console.group("store/general/actions/calculateRoute");
            let locationService = new Location({
                credentials: credentials,
                region: awsconfig.aws_project_region,
            });

            var params = {
                CalculatorName: process.env.VUE_APP_ROUTE,
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
                    commit("SET_ROUTESTEPS", data.Legs[0].Geometry.LineString);
                    commit("SET_ROUTESUMMARY", data.Summary);
                    console.groupEnd();
                    resolve("Resolved");
                }
            })
        });
}

export function saveGeoFence(
    { commit }, { name, polygonVertices, credentials }) {
        return new Promise((resolve, reject) => {
            try {
                console.group("store/general/actions/saveGeoFence");
                commit("SET_LOADER", true);

                let locationService = new Location({
                    credentials: credentials,
                    region: awsconfig.aws_project_region,
                });    

                const geoParams = {
                    CollectionName: process.env.VUE_APP_GEOFENCE,
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
                        commit("SET_GEOFENCEID", data.GeofenceId);  
                        resolve("Resolved");                                  
                        }                
                    })      
                
                commit("SET_LOADER", false);
                console.groupEnd();
                    

            } catch (error) {
                console.error(error);
                commit("SET_LOADER", false);
                console.groupEnd(); 
                reject("Rejected");       
                throw error;
            }
        });
    }

export function fetchGeoFenceItems(
    { commit }, { credentials }) {
    try {
        let locationList = [];
        console.group("store/general/actions/fetchGeoFenceItems");
        commit("SET_LOADER", true);
        commit("SET_LOCATION_LIST", []);

        let locationService = new Location({
            credentials: credentials,
            region: awsconfig.aws_project_region,
        });

        locationService.listGeofences({ CollectionName: process.env.VUE_APP_GEOFENCE }, function (err, response) {
            if (err) console.log(err, err.stack); // an error occurred
            else {                
                if (response && response.Entries.length > 0) {
                    for (let i = 0; i < response.Entries.length; i++) {
                        if (response.Entries[i].Status == "ACTIVE") {
                            locationList.push({
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
        commit("SET_LOCATION_LIST", locationList);
        commit("SET_LOADER", false);
        console.groupEnd();
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function fetchDeliveryAgents(
    { commit }) {
    try {
        let alist = null;
        console.group("store/general/actions/fetchDeliveryAgents");
        commit("SET_LOADER", true);
        commit("SET_DATA", []);

        const {
            // @ts-ignore
            data: { listDeliveryAgents: { items: results } }
        } = await API.graphql(graphqlOperation(listDeliveryAgents));

        alist = results
        //console.log(agentsList)        
        commit("SET_DATA", alist);
        commit("SET_LOADER", false);
        console.groupEnd();
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function saveAgent({ commit },
    { id, fullName, deliveryType, agentDeviceId }) {
    try {
        console.group("store/general/actions/saveagent");
        commit("SET_LOADER", true);
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

        commit("SET_LOADER", false);        
        commit("SET_USER", result)
        console.groupEnd();
        //console.log(result);
        return result;
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function saveDevice({ commit },
    { id, agentId, deviceType, isNewDevice }) {
    try {
        console.group("store/general/actions/saveDevice");
        commit("SET_LOADER", true);
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
        commit("SET_LOADER", false);
        console.groupEnd();
        return result;
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function delAgent({ commit },
    { id }) {
    try {
        console.group("store/general/actions/delAgent");
        commit("SET_LOADER", true);
        
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

        commit("SET_LOADER", false);
        console.log(result.id);
        console.groupEnd();        
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function delDevice({ commit },
    { id }) {
    try {
        console.group("store/general/actions/delDevice");
        commit("SET_LOADER", true);

        var delInput = {
            id: id
        }
        
        const {
            // @ts-ignore
            data: { deleteDevice: result }
        } = await API.graphql(graphqlOperation(deleteDevice, {
            input: delInput
        }));
        
        commit("SET_LOADER", false);
        console.log(result.id);
        console.groupEnd();        
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function delDelivery({ commit },
    { id }) {
    try {
        console.group("store/general/actions/delDelivery");
        commit("SET_LOADER", true);

        var delInput = {
            id: id
        }
        
        const {
            // @ts-ignore
            data: { deleteDeliveryInfo: result }
        } = await API.graphql(graphqlOperation(deleteDeliveryInfo, {
            input: delInput
        }));
        
        commit("SET_LOADER", false);
        console.log(result.id);
        console.groupEnd();        
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function fetchDeliveryInfoList(
    { commit }) {
    try {
        let infoList = null;
        console.group("store/general/actions/fetchdeliveryinfolist");
        commit("SET_LOADER", true);
        commit("SET_DELIVERYLIST", []);

        const {
            // @ts-ignore
            data: { listDeliveryInfos: { items: results } }
        } = await API.graphql(graphqlOperation(listDeliveryInfos));

        infoList = results
        commit("SET_DELIVERYLIST", infoList);
        commit("SET_LOADER", false);
        console.groupEnd();
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}

export async function saveDeliveryInfo({ commit },
    {   id, 
        geoStart, 
        geoEnd, 
        duration, 
        distance, 
        geoFenceId, 
        userPhone, 
        expireAt, 
        routeStatus, 
        deliveryInfoDeliveryAgentId }) {
    try {
        console.group("store/general/actions/saveadeliveryinfo");
        commit("SET_LOADER", true);
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

        commit("SET_LOADER", false);        
        console.groupEnd();
        return result;
    } catch (error) {
        console.error(error);
        commit("SET_LOADER", false);
        console.groupEnd();
        throw error;
    }
}