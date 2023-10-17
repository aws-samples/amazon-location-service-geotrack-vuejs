import { util } from '@aws-appsync/utils';

export function request(ctx) {
  console.log("ctx.identity:", JSON.parse(JSON.stringify(ctx.identity)))
  const { status = 'inroute', limit = 20, nextToken } = ctx.arguments;
  const index = 'statusSgi';
  const query = JSON.parse(
    util.transform.toDynamoDBConditionExpression({ status: { eq: status } })
  );
  return { operation: 'Query', index, query, limit, nextToken };
}

export function response(ctx) {
  console.log("ctx.identity:", JSON.parse(JSON.stringify(ctx.identity)))
  const { items: trips = [], nextToken } = ctx.result;
  return { trips, nextToken };
}


// https://aws.amazon.com/blogs/mobile/appsync-pipeline-resolvers-2/
// https://docs.aws.amazon.com/appsync/latest/devguide/js-resolver-reference-dynamodb.html
// https://docs.aws.amazon.com/appsync/latest/devguide/tutorial-dynamodb-resolvers-js.html
// https://docs.aws.amazon.com/appsync/latest/devguide/configuring-resolvers-js.html
// https://aws.amazon.com/blogs/mobile/introducing-new-aws-appsync-module-and-functions-for-dynamodb-javascript-resolvers/
// https://advancedweb.hu/first-experiences-with-the-new-appsync-javascript-resolver-runtime/
// https://levelup.gitconnected.com/slashing-serverless-api-latency-with-appsync-javascript-resolvers-8aa5ae6a9ac0
// https://stefan-majiros.com/blog/custom-graphql-batchgetitem-resolver-in-aws-amplify-for-appsync
// https://serverlessland.com/patterns/appsync-dynamodb-singletable-js-resolver
// https://blog.graphbolt.dev/write-reusable-code-for-appsync-javascript-resolvers (create item)