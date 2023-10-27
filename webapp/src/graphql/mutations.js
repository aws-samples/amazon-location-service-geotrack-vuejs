
export const saveDriver = /* GraphQL */ `
mutation SaveDriver (
  $input: DriverInput!
  ) {
  saveDriver(input: $input) {
    id
    fullName
    email
    createdAt 
    trips {
      id
      createdAt
    }
  }
}
`;

export const delDriver = /* GraphQL */ `
mutation DeleteDriver (
  $id: ID!
  ) {
  delDriver(id: $id) {
    id
  }
}
`;

export const saveTrip = /* GraphQL */ `
mutation SaveTrip (
  $input: TripInput!
  ) {
  saveTrip(input: $input) {
    id
    driver {
      id
    }
    createdAt 
  }
}
`;

export const delTrip = /* GraphQL */ `
mutation DeleteTrip (
  $id: ID!
  ) {
  delTrip(id: $id) {
    id
  }
}
`;