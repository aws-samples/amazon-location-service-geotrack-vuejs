import random
import uuid
import os
import sys
import base64
import json
import urllib
import logging
import boto3
from boto3.dynamodb.conditions import Key, Attr
from time import sleep
from datetime import datetime 

logger = logging.getLogger()
logger.setLevel(logging.INFO)

iot_topic = os.getenv('IOT_TOPIC')
project_name = os.getenv('PROJECT_NAME')
project_env = os.getenv('PROJECT_ENV')

location = boto3.client('location')
iot = boto3.client('iot-data')

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

def route_calculation(departure, destination):

    ssmParam = "/amplify/" + project_name + "/route"
    routeName = GetSsmParam(ssmParam, False)

    return location.calculate_route(
    CalculatorName=routeName,
    DeparturePosition=[departure['lng'], departure['lat']],
    DestinationPosition=[destination['lng'], destination['lat']],
    DepartNow=True,
    DistanceUnit='Kilometers',
    TravelMode='Car',
    )
    
def publish_location(trip_id, device_id, position):
    logger.info("Publishing device: " + str(device_id) + " at lng:" + str(position[0]) + " lat:" + str(position[1]))
    retries = 0
    message = json.dumps(
            {
                "timestamp": datetime.now().isoformat(),
                "trip_id": trip_id,
                "device_id": device_id,
                "latitude": float(position[1]),
                "longitude": float(position[0])    
            }
        )    

    try:
        iot.publish(
            topic=iot_topic,
            qos=0,
            payload=message
        )
        
    except iot.exceptions.InternalFailureException as e:
        logger.error("Location InternalFailureException function error: " + str(e))
    except iot.exceptions.InvalidRequestException as e:
        logger.error("Location InvalidRequestException function error: " + str(e))
    except iot.exceptions.UnauthorizedException as e:
        logger.error("Location UnauthorizedException function error: " + str(e))
    except iot.exceptions.MethodNotAllowedException as e:
        logger.error("Location MethodNotAllowedException function error: " + str(e))
    except Exception as e:
        logger.error(str(e))


def get_random(min, max):
    num = round(random.uniform(min, max), 2)
    if (num.is_integer()):
        return num + 0.01
    else: 
        return num
    
def handler(event, context):
    #print(event)
    
    route = route_calculation(event['geoStart'],event['geoEnd'])
    if 'Legs' in route:
        for step in route['Legs'][0]['Steps']:
            if step['DurationSeconds'] >= 200:
                div=10
            elif step['DurationSeconds'] < 200 and step['DurationSeconds'] >= 100:
                div=6
            else:
                div=4
            
            logger.info("Sleeping: " + str(round(step['DurationSeconds']/div)) + " sec")
            sleep(round(step['DurationSeconds']/div))
            publish_location(event['id'], event['deliveryAgent']['device']['id'], step['StartPosition'])
            logger.info("Sleeping: " + str(round(step['DurationSeconds']/div)) + " sec")
            sleep(round(step['DurationSeconds']/div))
            publish_location(event['id'], event['deliveryAgent']['device']['id'], step['EndPosition'])
    

    response = {
        'statusCode': 200,
        'body': 'successfully read items!'
    }
  
    return response