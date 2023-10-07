import { util } from '@aws-appsync/utils'

export function request(ctx) {
	const values = ctx.arguments.input
	const keys = { id: ctx.args.input.id ?? util.autoId(), email: ctx.args.input.email }
    
    values.createdAt = util.time.nowISO8601()
	values.updatedAt = util.time.nowISO8601()

	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues(keys),
		attributeValues: util.dynamodb.toMapValues(values),
	}
}

export function response(ctx) {
	return ctx.result
}