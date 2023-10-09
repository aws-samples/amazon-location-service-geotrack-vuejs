import { util } from '@aws-appsync/utils'

export function request(ctx) {
	const values = ctx.arguments.input

    const timeStamp = util.time.nowISO8601()

    const keys = { id: ctx.args.input.id ?? util.autoId(), createdAt: timeStamp }

    values.createdAt = timeStamp
	values.updatedAt = timeStamp

	values.expiresAt = values.expiresAt ?? util.time.nowEpochSeconds() + 3600 * 24 * 30

	return {
		operation: 'PutItem',
		key: util.dynamodb.toMapValues(keys),
		attributeValues: util.dynamodb.toMapValues(values),
	}
}

export function response(ctx) {
	return ctx.result
}