import { util, runtime } from '@aws-appsync/utils'

export function request(ctx) {

    if (ctx.prev.result.trips.length == 0) {
        runtime.earlyReturn({ trips: []})
    }

    let drivers = []
    let ids = []

    for (const idx in ctx.prev.result.trips) {
        let record = ctx.prev.result.trips[idx]
        if (record.driver.id != null) {
            if (!ids.includes(record.driver.id)) {
                ids.push(record.driver.id)            
                drivers.push(util.dynamodb.toMapValues({ "id": record.driver.id }))
            }
        }
    }

    return dynamoDBBatchGetItem(drivers)
}

export function response(ctx) {
    if (ctx.error) {
        util.error(ctx.error.message, ctx.error.type);
    }

    let trips = ctx.prev.result.trips
    let drivers = ctx.result.data["geotrack-dev-Drivers"]
    for (const idxTrips in trips) {
        let record = trips[idxTrips]
        for (const idxDrivers in drivers) {
            let driver = drivers[idxDrivers]
            if (record.driver.id == driver.id) {
                record.driver = driver
                break;
            }
        }
    }
    return { trips };
}

function dynamoDBBatchGetItem(drivers) {
    return {
        operation: 'BatchGetItem',
        tables: {
            "geotrack-dev-Drivers": {
                keys: drivers
            }
        },
    };
}