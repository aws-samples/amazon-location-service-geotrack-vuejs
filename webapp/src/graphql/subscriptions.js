export const onDevicePositionUpdate = /* GraphQL */ `
subscription OnDevicePositionUpdate($deviceId: ID) {
  onDevicePositionUpdate(deviceId: $deviceId) {
    deviceId
    position {
      lat
      lng
    }
    timestamp
    tripId
  }
}
`;
