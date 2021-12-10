/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createDeliveryAgent = /* GraphQL */ `
  mutation CreateDeliveryAgent(
    $input: CreateDeliveryAgentInput!
    $condition: ModelDeliveryAgentConditionInput
  ) {
    createDeliveryAgent(input: $input, condition: $condition) {
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
export const updateDeliveryAgent = /* GraphQL */ `
  mutation UpdateDeliveryAgent(
    $input: UpdateDeliveryAgentInput!
    $condition: ModelDeliveryAgentConditionInput
  ) {
    updateDeliveryAgent(input: $input, condition: $condition) {
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
export const deleteDeliveryAgent = /* GraphQL */ `
  mutation DeleteDeliveryAgent(
    $input: DeleteDeliveryAgentInput!
    $condition: ModelDeliveryAgentConditionInput
  ) {
    deleteDeliveryAgent(input: $input, condition: $condition) {
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
export const createDevice = /* GraphQL */ `
  mutation CreateDevice(
    $input: CreateDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    createDevice(input: $input, condition: $condition) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateDevice = /* GraphQL */ `
  mutation UpdateDevice(
    $input: UpdateDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    updateDevice(input: $input, condition: $condition) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteDevice = /* GraphQL */ `
  mutation DeleteDevice(
    $input: DeleteDeviceInput!
    $condition: ModelDeviceConditionInput
  ) {
    deleteDevice(input: $input, condition: $condition) {
      id
      deliveryAgentId
      deviceType
      createdAt
      updatedAt
      owner
    }
  }
`;
export const createDeliveryInfo = /* GraphQL */ `
  mutation CreateDeliveryInfo(
    $input: CreateDeliveryInfoInput!
    $condition: ModelDeliveryInfoConditionInput
  ) {
    createDeliveryInfo(input: $input, condition: $condition) {
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
export const updateDeliveryInfo = /* GraphQL */ `
  mutation UpdateDeliveryInfo(
    $input: UpdateDeliveryInfoInput!
    $condition: ModelDeliveryInfoConditionInput
  ) {
    updateDeliveryInfo(input: $input, condition: $condition) {
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
export const deleteDeliveryInfo = /* GraphQL */ `
  mutation DeleteDeliveryInfo(
    $input: DeleteDeliveryInfoInput!
    $condition: ModelDeliveryInfoConditionInput
  ) {
    deleteDeliveryInfo(input: $input, condition: $condition) {
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
