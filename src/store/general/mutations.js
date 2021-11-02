  export const SET_DATA = (state, data) => {
    state.agentList = data;
  };

  export const SET_DEPCOORD = (state, data) => {
    state.depCoord = data;
  };

  export const SET_DESTCOORD = (state, data) => {
    state.destCoord = data;
  };

  export const SET_DELIVERYLIST = (state, data) => {
    state.deliveryList = data;
  };

  export const SET_DEVICEIDSINROUTE = (state, data) => {
    state.devicesIdsInRoute = data;
  };  

  export const SET_ROUTESUMMARY = (state, data) => {
    state.routeSummary = data;
  };

  export const SET_ROUTESTEPS = (state, data) => {
    state.routeSteps = data;
  };

  export const SET_GEOFENCEID = (state, data) => {
    state.geoFenceId = data;
  };

  export const SET_GEOFENCE = (state, data) => {
    state.geoFencePolygon = data;
  };

  export const SET_USER = (state, user) => {
    state.agentRec = user;
  };

  export const SET_DEVICE = (state, device) => {
    state.deviceRec = device;
  };

  export const SET_LOADER = (state, isLoading) => {
    state.loading = isLoading;
  };

  export const SET_PAGINATION = (state, paginationToken) => {
    state.paginationToken = paginationToken;
  };