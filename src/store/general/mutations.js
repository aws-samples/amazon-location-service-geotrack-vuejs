  export const SET_DATA = (state, data) => {
    state.userDeviceList = data;
  };

  export const SET_USER = (state, user) => {
    state.userRec = user;
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