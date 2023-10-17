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
ROUTE_NAME = os.getenv('ROUTE_NAME')
TRACKER_NAME = os.getenv('TRACKER_NAME')

location = boto3.client('location')
iot = boto3.client('iot-data')

def route_calculation(departure, destination):
    return location.calculate_route(
    CalculatorName=ROUTE_NAME,
    DeparturePosition=[departure['lng'], departure['lat']],
    DestinationPosition=[destination['lng'], destination['lat']],
    DepartNow=True,
    DistanceUnit='Kilometers',
    TravelMode='Car',
    )
    
def publish_location(trip_id, device_id, position):
    logger.info("Publishing device: " + str(device_id) + " at lng:" + str(position[0]) + " lat:" + str(position[1]))
    message = json.dumps(
        {
        	"TrackerName": TRACKER_NAME,
        	"DeviceID" :device_id,
        	"position": [
        		float(position[1]),
        		float(position[0])
        	],
        	"timestamp": datetime.now().isoformat(),
        	"tripId": trip_id
        })    

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
            publish_location(event['id'], event['driver']['deviceId'], step['StartPosition'])
            logger.info("Sleeping: " + str(round(step['DurationSeconds']/div)) + " sec")
            sleep(round(step['DurationSeconds']/div))
            publish_location(event['id'], event['driver']['deviceId'], step['EndPosition'])
    

    response = {
        'statusCode': 200,
        'body': 'successfully read items!'
    }
  
    return response