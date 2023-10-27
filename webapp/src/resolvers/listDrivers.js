import { util } from '@aws-appsync/utils'

export function request(ctx) {
    const { limit = 20, nextToken } = ctx.arguments;
    return { operation: 'Scan', limit, nextToken };
    // const { title } = ctx.args;
    // const filter = { filter: { beginsWith: title } };
    // return {
    //   operation: 'Scan',
    //   filter: JSON.parse(util.transform.toDynamoDBFilterExpression(filter)),
    // };
  }
  export function response(ctx) {
    const { items: drivers = [], nextToken } = ctx.result;
    return { drivers, nextToken };
  }