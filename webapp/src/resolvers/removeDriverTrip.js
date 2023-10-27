import { util } from '@aws-appsync/utils'

export function request(ctx) {

	const tripId = ctx.prev.result.id
    const driverId = ctx.prev.result.driver.id
    const timeStamp = util.time.nowISO8601()

	const expressionValues = util.dynamodb.toMapValues({ ':updatedAt': timeStamp })
	expressionValues[':trips'] = util.dynamodb.toStringSet([tripId])

	return {
		operation: 'UpdateItem',
		key: util.dynamodb.toMapValues({ "id": driverId }),
		update: {
			expression: "DELETE trips :trips SET updatedAt = :updatedAt",
			expressionValues,
		},
	}
}

export const response = (ctx) => ctx.result