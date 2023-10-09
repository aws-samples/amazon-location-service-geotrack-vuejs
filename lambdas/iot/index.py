import os
import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENV')
TRACKER = os.getenv('TRACKER')
location = boto3.client('location')

def handler(event, context):      

    response = location.batch_update_device_position(
        TrackerName=TRACKER,
        Updates=[
            {
                'DeviceId': event['device_id'],
                'Position': [
                    event['longitude'], event['latitude']
                ],
                'SampleTime': event['timestamp']
            },
        ]
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(response)
    }
