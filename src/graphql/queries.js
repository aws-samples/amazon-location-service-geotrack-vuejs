/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      fullName
      createdAt
      updatedAt
      owner
      device {
        id
        userID
        deviceType
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        fullName
        createdAt
        updatedAt
        owner
        device {
          id
          userID
          deviceType
          createdAt
          updatedAt
          owner
        }
      }
      nextToken
    }
  }
`;
export const listDevices = /* GraphQL */ `
  query ListDevices(
    $filter: ModelDeviceFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listDevices(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userID
        deviceType
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getDevice = /* GraphQL */ `
  query GetDevice($id: ID!) {
    getDevice(id: $id) {
      id
      userID
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
