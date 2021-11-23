import os
import json
import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENV')
location = boto3.client('location')
ssm = boto3.client('ssm')

def GetSsmParam(paramKey, isEncrypted):
    try:
        ssmResult = ssm.get_parameter(
            Name=paramKey,
            WithDecryption=isEncrypted
        )

        if (ssmResult["ResponseMetadata"]["HTTPStatusCode"] == 200):
            return ssmResult["Parameter"]["Value"]
        else:
            return ""

    except Exception as e:
        logger.error(str(e))
        return ""

def handler(event, context):      

    ssmParam = "/amplify/" + project_name + "/tracker"
    trackerName = GetSsmParam(ssmParam, False)

    response = location.batch_update_device_position(
        TrackerName=trackerName,
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
