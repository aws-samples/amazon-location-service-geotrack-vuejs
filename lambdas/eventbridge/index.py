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

# Migrated from Pinpoint to SNS for SMS messaging
sns = boto3.client('sns')
appsync = boto3.client('appsync')

appsync_url = os.getenv('APPSYNC_URL')
project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENV')
# Migrated from Pinpoint APPLICATION_ID to SNS Topic ARN
sns_topic_arn = os.getenv('SNS_TOPIC_ARN')

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
            # Migrated from Pinpoint to SNS for SMS messaging
            # SNS uses a simpler publish API compared to Pinpoint's send_messages
            # Note: Phone number should be retrieved from the delivery info record
            phone_number = row.get('userPhone', '')
            
            if phone_number:
                try:
                    response = sns.publish(
                        PhoneNumber=phone_number,
                        Message='The driver should be arriving soon',
                        MessageAttributes={
                            'AWS.SNS.SMS.SMSType': {
                                'DataType': 'String',
                                'StringValue': 'Transactional'
                            }
                        }
                    )
                    logger.info(f"SMS sent successfully via SNS: {response}")
                    print(response)
                except Exception as e:
                    logger.error(f"Failed to send SMS via SNS: {str(e)}")
                    return {
                        'statusCode': 500,
                        'body': json.dumps(f'Error sending SMS: {str(e)}')
                    }
            else:
                logger.warning("No phone number available for SMS notification")
                return {
                    'statusCode': 400,
                    'body': json.dumps('No phone number available')
                }

        return {
            'statusCode': 200,
            'body': json.dumps('Success')
        }
    else:
        return {
            'statusCode': 500,
            'body': json.dumps('Error')
        }

