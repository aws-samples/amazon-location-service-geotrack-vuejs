import { util } from '@aws-appsync/utils'

export function request(ctx) {
	return {
		operation: 'GetItem',
		key: util.dynamodb.toMapValues({ id: ctx.args.id }),
	}
}

export const response = (ctx) => ctx.result