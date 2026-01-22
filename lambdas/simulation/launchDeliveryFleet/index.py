from urllib import request
from datetime import datetime
from time import sleep
import os
import json
import boto3
import logging
import requests
from requests_aws4auth import AWS4Auth

logger = logging.getLogger()
logger.setLevel(logging.INFO)

lambda_client = boto3.client('lambda')
appsync = boto3.client('appsync')
dynamodb = boto3.resource('dynamodb')

appsync_url = os.getenv('APPSYNC_URL')
project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENC')
pushVehicleLambda = os.getenv('PUSH_VEHICLE_LAMBDA_NAME')
trips_table_name = os.getenv('TRIPS_TABLE_NAME')

boto3_session = boto3.Session()
credentials = boto3_session.get_credentials()
credentials = credentials.get_frozen_credentials()
items = []

auth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        boto3_session.region_name,
        'appsync',
        session_token=credentials.token,
    )

graphqlQuery=""""
query DeviceIdByTripStatus (
  $status: TripStatus
  ) {
  statusTrips(status: $status) {
    nextToken
    trips {
      id
      geoStart {
        lat
        lng
      }
      geoEnd {
        lat
        lng
      }
      duration
      distance
      status
      driver {
        fullName
        deviceId
      }
    }
  }
}
    """

def setProxyResponse(data):
        response = {}
        response["isBase64Encoded"] = False
        if "statusCode" in data:
          response["statusCode"] = data["statusCode"]
        else:
          response["statusCode"] = 200
        if "headers" in data:
            response["headers"] = data["headers"]
        else:
            response["headers"] = {
              'Content-Type': 'application/json', 
              'Access-Control-Allow-Origin': '*' 
            } 
        response["body"] = json.dumps(data["body"])
        return response

def handler(event, context):

    proxy_response = {}
    
    # Parse request body for tripIds
    body = {}
    if 'body' in event:
        try:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        except Exception as e:
            logger.error(f"Error parsing body: {e}")
    
    trip_ids = body.get('tripIds', [])
    logger.info(f"Received trip_ids: {trip_ids}")

    session = requests.Session()
    session.auth = auth   

    items = []
    
    # Query trips with 'accepted' status
    trips_query = """
    query StatusTrips($status: TripStatus) {
      statusTrips(status: $status) {
        trips {
          id
          geoStart {
            lat
            lng
          }
          geoEnd {
            lat
            lng
          }
          duration
          distance
          status
          driver {
            fullName
            deviceId
          }
        }
      }
    }
    """
    
    response = session.request(
        url=appsync_url,
        method='POST',
        json={'query': trips_query, 'variables': {'status': 'accepted'}}
    )
    
    try:
        response_data = response.json()
        logger.info(f"GraphQL response: {response_data}")
        
        if response_data and 'data' in response_data and response_data['data'] and 'statusTrips' in response_data['data']:
            all_items = response_data['data']['statusTrips']['trips']
            logger.info(f"Found {len(all_items)} trips with status 'accepted'")
            
            # Filter by tripIds if provided
            if trip_ids:
                items = [item for item in all_items if item['id'] in trip_ids]
                logger.info(f"Filtered to {len(items)} selected trips")
            else:
                items = all_items
    except Exception as e:
        logger.error(f"Error processing GraphQL response: {e}")
    
    logger.info(f"Processing {len(items)} trips")

    # Update trip status to 'inroute' for selected trips
    trips_table = dynamodb.Table(trips_table_name)
    
    for item in items:
        try:
            response = trips_table.update_item(
                Key={'id': item['id']},
                UpdateExpression='SET #status = :status',
                ExpressionAttributeNames={'#status': 'status'},
                ExpressionAttributeValues={':status': 'inroute'},
                ReturnValues='ALL_NEW'
            )
            item['status'] = 'inroute'  # Update local item
            logger.info(f"Successfully updated trip {item['id']} status to 'inroute' in DynamoDB")
        except Exception as e:
            logger.error(f"Error updating trip {item['id']} in DynamoDB: {e}")
    
    # Wait for DynamoDB GSI to update
    if items:
        logger.info("Waiting 2 seconds for GSI to update...")
        sleep(2)

    for row in items:
        response = lambda_client.invoke(
            FunctionName=str(pushVehicleLambda),
            InvocationType='Event',
            Payload=json.dumps(row)
        )

    proxy_response['statusCode']=200
    proxy_response["body"] = { 'msg': 'Processed ' + str(len(items)) + ' vehicles' }

    return setProxyResponse(proxy_response)