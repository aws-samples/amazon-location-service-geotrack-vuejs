export const listDrivers = /* GraphQL */ `
query ListDrivers {
  listDrivers {
    drivers {
      deliveryType
      deviceId
      deviceType
      email
      fullName
      status
      id
    }
  }
}
`;

export const deviceIdByTripStatus = /* GraphQL */ `
query DeviceIdByTripStatus (
  $status: TripStatus
  ) {
  statusTrips(status: $status) {
    nextToken
    trips {
      driver {
        deviceId
      }
    }
  }
}
`;

export const listTrips = /* GraphQL */ `
query ListTrips {
  listTrips {
    trips {
      createdAt
      duration
      distance
      labelStart
      geoStart {
        lat
        lng
      }
      labelEnd
      geoEnd {
        lat
        lng
      }
      driver {
        id
        fullName
      }
      duration
      id
      status
    }
  }
}
`;