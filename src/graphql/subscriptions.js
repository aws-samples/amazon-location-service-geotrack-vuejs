/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeliveryAgent = /* GraphQL */ `
  subscription OnCreateDeliveryAgent($owner: String) {
    onCreateDeliveryAgent(owner: $owner) {
      id
      fullName
      deliveryType
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      deliveryAgentDeviceId
      owner
    }
  }
`;
export const onUpdateDeliveryAgent = /* GraphQL */ `
  subscription OnUpdateDeliveryAgent($owner: String) {
    onUpdateDeliveryAgent(owner: $owner) {
      id
      fullName
      deliveryType
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      deliveryAgentDeviceId
      owner
    }
  }
`;
export const onDeleteDeliveryAgent = /* GraphQL */ `
  subscription OnDeleteDeliveryAgent($owner: String) {
    onDeleteDeliveryAgent(owner: $owner) {
      id
      fullName
      deliveryType
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
        owner
      }
      createdAt
      updatedAt
      deliveryAgentDeviceId
      owner
    }
  }
`;
export const onCreateDevice = /* GraphQL */ `
  subscription OnCreateDevice($owner: String) {
    onCreateDevice(owner: $owner) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateDevice = /* GraphQL */ `
  subscription OnUpdateDevice($owner: String) {
    onUpdateDevice(owner: $owner) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteDevice = /* GraphQL */ `
  subscription OnDeleteDevice($owner: String) {
    onDeleteDevice(owner: $owner) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateDeliveryInfo = /* GraphQL */ `
  subscription OnCreateDeliveryInfo($owner: String) {
    onCreateDeliveryInfo(owner: $owner) {
      id
      deliveryAgent {
        id
        fullName
        deliveryType
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        deliveryAgentDeviceId
        owner
      }
      geoStart {
        lat
        lng
      }
      geoEnd {
        lat
        lng
      }
      duration
      distance
      geoFenceId
      userPhone
      expireAt
      status
      createdAt
      updatedAt
      deliveryInfoDeliveryAgentId
      owner
    }
  }
`;
export const onUpdateDeliveryInfo = /* GraphQL */ `
  subscription OnUpdateDeliveryInfo($owner: String) {
    onUpdateDeliveryInfo(owner: $owner) {
      id
      deliveryAgent {
        id
        fullName
        deliveryType
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        deliveryAgentDeviceId
        owner
      }
      geoStart {
        lat
        lng
      }
      geoEnd {
        lat
        lng
      }
      duration
      distance
      geoFenceId
      userPhone
      expireAt
      status
      createdAt
      updatedAt
      deliveryInfoDeliveryAgentId
      owner
    }
  }
`;
export const onDeleteDeliveryInfo = /* GraphQL */ `
  subscription OnDeleteDeliveryInfo($owner: String) {
    onDeleteDeliveryInfo(owner: $owner) {
      id
      deliveryAgent {
        id
        fullName
        deliveryType
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
        createdAt
        updatedAt
        deliveryAgentDeviceId
        owner
      }
      geoStart {
        lat
        lng
      }
      geoEnd {
        lat
        lng
      }
      duration
      distance
      geoFenceId
      userPhone
      expireAt
      status
      createdAt
      updatedAt
      deliveryInfoDeliveryAgentId
      owner
    }
  }
`;
