from urllib import request
from datetime import datetime
import os
import json
import boto3
import logging
import requests
from requests_aws4auth import AWS4Auth

logger = logging.getLogger()
logger.setLevel(logging.INFO)

pinpoint = boto3.client('pinpoint')
ssm = boto3.client('ssm')
appsync = boto3.client('appsync')

appsync_url = os.getenv('APPSYNC_URL')
project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENV')
pinpoint_application_id = os.getenv('APPLICATION_ID')

boto3_session = boto3.Session()
credentials = boto3_session.get_credentials()
credentials = credentials.get_frozen_credentials()

auth = AWS4Auth(
        credentials.access_key,
        credentials.secret_key,
        boto3_session.region_name,
        'appsync',
        session_token=credentials.token,
    )
                
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

def getGeoFenceRecord(geoFenceId):
    graphqlQuery="""
        query listDeliveryInfos {
            listDeliveryInfos(filter: { and: [ 
                { status: { ne: "completed" }},
                { geoFenceId: { eq: "%s" }}      ]}
            ) {
            items {
                id        
                geoFenceId
                userPhone    
                status
                deliveryAgent {
                id
                fullName
                device
                {
                    id
                }
                }
            }
            }
        }
        """%(geoFenceId)

    session = requests.Session()
    session.auth = auth

    response = session.request(
        url=appsync_url,
        method='POST',
        json={'query': graphqlQuery}
    )

    print(response.json())
    
    if 'data' in response.json() and len(response.json()['data']['listDeliveryInfos']['items']) == 1:
        return response.json()['data']['listDeliveryInfos']['items'][0]
    else:
        logger.error(response)
        return []
   
def handler(event, context):
    # event - Data from EventBridge
    # print(event)

    row = getGeoFenceRecord(event['detail']['GeofenceId'])
    if 'deliveryAgent' in row:
        deviceId = row['deliveryAgent']['device']['id']

        if event['detail']['DeviceId'] == deviceId:
            response = pinpoint.send_messages(
                ApplicationId=pinpoint_application_id,
                MessageRequest={
                    'Addresses': {
                        'string': {
                            'ChannelType': 'SMS',
                            'RawContent': 'string'
                        }
                    },
                    'MessageConfiguration': {            
                        'SMSMessage': {
                            'Body': 'The driver should be arriving soon',
                            'Keyword': 'GeoTrack',
                            'MessageType': 'TRANSACTIONAL'
                        },
                    },
                    'TraceId': 'string'
                }
            )

        print(response)

        return {
            'statusCode': 200,
            'body': json.dumps('Success')
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('Error')
        }

