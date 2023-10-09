
export const createDriver = /* GraphQL */ `
mutation CreateDriver (
  $input: DriverInput!
  ) {
  addDriver(input: $input) {
    id
    fullName
    email
    createdAt 
  }
}
`;

export const createTrip = /* GraphQL */ `
mutation CreateTrip (
  $input: TripInput!
  ) {
  addTrip(input: $input) {
    id
    driver {
      id
    }
    createdAt 
  }
}
`;