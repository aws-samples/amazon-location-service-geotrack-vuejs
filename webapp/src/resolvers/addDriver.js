import { util } from '@aws-appsync/utils'

export function request(ctx) {
	const values = ctx.arguments.input
	const keys = { id: ctx.args.input.id ?? util.autoId(), email: ctx.args.input.email }

    const timeStamp = util.time.nowFormatted("yyyy-MM-dd'T'HH:mm:ssZ")
    
    values.createdAt = timeStamp
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