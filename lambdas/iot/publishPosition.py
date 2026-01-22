import os
import json
import boto3
import logging
from datetime import datetime

logger = logging.getLogger()
logger.setLevel(logging.INFO)

appsync_url = os.getenv('APPSYNC_URL')

def handler(event, context):
    """
    Triggered by IoT rule when position message is published
    Publishes device position to AppSync subscription using IAM auth
    """
    logger.info(f"Received event: {json.dumps(event)}")
    
    try:
        # Extract data from IoT message (direct from IoT rule)
        device_id = event.get('DeviceID')
        position = event.get('position', [])
        trip_id = event.get('tripId')
        timestamp = event.get('timestamp')
        
        # Ensure timestamp is in ISO 8601 format with timezone
        if timestamp:
            # Add Z suffix if not present
            if not timestamp.endswith('Z') and '+' not in timestamp and '-' not in timestamp[-6:]:
                timestamp = timestamp + 'Z'
        else:
            timestamp = datetime.utcnow().isoformat() + 'Z'
        
        logger.info(f"Using timestamp: {timestamp}")
        
        if not device_id or len(position) != 2:
            logger.error(f"Invalid event data: {event}")
            return {'statusCode': 400, 'body': 'Invalid data'}
        
        # Publish to AppSync using IAM auth
        mutation = """
        mutation PublishPosition($deviceId: ID!, $position: CoordinateInput!, $timestamp: AWSDateTime!, $tripId: ID) {
          publishDevicePosition(deviceId: $deviceId, position: $position, timestamp: $timestamp, tripId: $tripId) {
            deviceId
            position {
              lat
              lng
            }
            timestamp
          }
        }
        """
        
        variables = {
            'deviceId': device_id,
            'position': {
                'lat': float(position[0]),
                'lng': float(position[1])
            },
            'timestamp': timestamp,
            'tripId': trip_id
        }
        
        # Use requests with AWS4Auth for IAM signing
        import requests
        from requests_aws4auth import AWS4Auth
        
        session = boto3.Session()
        credentials = session.get_credentials()
        credentials = credentials.get_frozen_credentials()
        
        auth = AWS4Auth(
            credentials.access_key,
            credentials.secret_key,
            session.region_name,
            'appsync',
            session_token=credentials.token,
        )
        
        response = requests.post(
            appsync_url,
            json={'query': mutation, 'variables': variables},
            auth=auth,
            headers={'Content-Type': 'application/json'}
        )
        
        logger.info(f"AppSync response: {response.json()}")
        
        return {'statusCode': 200, 'body': 'Position published'}
        
    except Exception as e:
        logger.error(f"Error: {e}", exc_info=True)
        return {'statusCode': 500, 'body': str(e)}
