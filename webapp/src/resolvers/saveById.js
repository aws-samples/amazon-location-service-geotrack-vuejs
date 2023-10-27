import { util } from '@aws-appsync/utils'

export function request(ctx) {
	const values = ctx.arguments.input
	const keys = { id: ctx.args.input.id ?? util.autoId() }

    const timeStamp = util.time.nowISO8601()
    
    values.createdAt = ctx.args.input.createdAt ?? timeStamp
	values.updatedAt = timeStamp

	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues(keys),
		attributeValues: util.dynamodb.toMapValues(values),
	}
}

export function response(ctx) {
	return ctx.result
}