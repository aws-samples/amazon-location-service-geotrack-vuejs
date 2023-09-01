export const listDevicesIds = /* GraphQL */ `
    query ListDeliveryInfos (
        $filter: ModelDeliveryInfoFilterInput
        $limit: Int
        $nextToken: String
      ) {  
        listDeliveryInfos(nextToken:$nextToken, limit: $limit, filter: $filter) {
        items {
        deliveryAgent {
            device {
                id
            }
            }
        }
        nextToken
    }
    }
`;