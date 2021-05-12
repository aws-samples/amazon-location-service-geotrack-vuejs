/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateDevice = /* GraphQL */ `
  subscription OnCreateDevice {
    onCreateDevice {
      id
      userID
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateDevice = /* GraphQL */ `
  subscription OnUpdateDevice {
    onUpdateDevice {
      id
      userID
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteDevice = /* GraphQL */ `
  subscription OnDeleteDevice {
    onDeleteDevice {
      id
      userID
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
