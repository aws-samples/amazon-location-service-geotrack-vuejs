/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateDeliveryAgent = /* GraphQL */ `
  subscription OnCreateDeliveryAgent {
    onCreateDeliveryAgent {
      id
      fullName
      deliveryType
      createdAt
      updatedAt
      owner
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const onUpdateDeliveryAgent = /* GraphQL */ `
  subscription OnUpdateDeliveryAgent {
    onUpdateDeliveryAgent {
      id
      fullName
      deliveryType
      createdAt
      updatedAt
      owner
      device {
        id
        deliveryAgentId
        deviceType
        createdAt
        updatedAt
        owner
      }
    }
  }
`;
export const onDeleteDeliveryAgent = /* GraphQL */ `
  subscription OnDeleteDeliveryAgent {
    onDeleteDeliveryAgent {
      id
      fullName
      deliveryType
      createdAt
      updatedAt
      owner
      device {
        id
        deliveryAgentId
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
      deliveryAgentId
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
      deliveryAgentId
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
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateDeliveryInfo = /* GraphQL */ `
  subscription OnCreateDeliveryInfo {
    onCreateDeliveryInfo {
      id
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
      deliveryAgent {
        id
        fullName
        deliveryType
        createdAt
        updatedAt
        owner
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
      }
      owner
    }
  }
`;
export const onUpdateDeliveryInfo = /* GraphQL */ `
  subscription OnUpdateDeliveryInfo {
    onUpdateDeliveryInfo {
      id
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
      deliveryAgent {
        id
        fullName
        deliveryType
        createdAt
        updatedAt
        owner
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
      }
      owner
    }
  }
`;
export const onDeleteDeliveryInfo = /* GraphQL */ `
  subscription OnDeleteDeliveryInfo {
    onDeleteDeliveryInfo {
      id
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
      deliveryAgent {
        id
        fullName
        deliveryType
        createdAt
        updatedAt
        owner
        device {
          id
          deliveryAgentId
          deviceType
          createdAt
          updatedAt
          owner
        }
      }
      owner
    }
  }
`;
