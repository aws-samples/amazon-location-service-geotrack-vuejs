export const listDrivers = /* GraphQL */ `
query ListDrivers {
  allDrivers {
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
  allTrips {
    trips {
      createdAt
      distance
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