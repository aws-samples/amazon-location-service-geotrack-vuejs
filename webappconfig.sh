#!/usr/bin/env bash

DARKGRAY='\033[1;30m'
RED='\033[0;31m'    
LIGHTRED='\033[1;31m'
GREEN='\033[0;32m'    
YELLOW='\033[1;33m'
BLUE='\033[0;34m'    
PURPLE='\033[0;35m'    
LIGHTPURPLE='\033[1;35m'
CYAN='\033[0;36m'    
WHITE='\033[1;37m'
SET='\033[0m'
DATESUFFIX=$(date +%Y-%m-%d-%H%M) 

STACKNAME=$(cat samconfig.toml | grep stack_name |  tr -d '"' | awk '{print $3}')
AWSREGION=$(cat samconfig.toml | grep region |  tr -d '"' | awk '{print $3}')

if [ -z "$STACKNAME" ]; then
    echo -e "${RED} Stack name could not be found at the samconfig.toml file ${RED}${SET} - Fail"
    exit 1
fi

if [ -z "$AWSREGION" ]; then
    echo -e "${RED} AWS Region could not be found at the samconfig.toml file ${RED}${SET} - Fail"
    exit 1
fi

echo -e "${WHITE}Stack name: ${YELLOW}$STACKNAME${SET}"
echo -e "${WHITE}AWS Region: ${YELLOW}$AWSREGION${SET}"

function get_output() {
    local RSP=$(aws cloudformation describe-stacks --stack-name $STACKNAME --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" --output text --region $AWSREGION)
    eval "echo $1: $RSP"
    eval "$1=$RSP"
}

get_output ApiId
get_output AwsRegion
get_output AppSyncUrl
get_output CloudFrontUrl
get_output IdentityPoolId
get_output CognitoUserPoolId
get_output CognitoUserPoolClientId
get_output CognitoDomainName
get_output S3WebAppBucket
get_output GeoMap
get_output GeoRouteCalculation
get_output GeoPlaceIndex
get_output GeoTracker
get_output GeoFence

echo -e "-- Creating .env file"

echo "VITE_API_URL=https://${ApiId}.execute-api.${AwsRegion}.amazonaws.com/dev" > webapp/.env
echo "VITE_AWS_REGION=${AwsRegion}" >> webapp/.env
echo "VITE_CLOUDFRONT_URL=https://${CloudFrontUrl}" >> webapp/.env
echo "VITE_COGNITO_USER_POOL_CLIENT_ID=${CognitoUserPoolClientId}" >> webapp/.env
echo "VITE_COGNITO_USER_POOL_ID=${CognitoUserPoolId}" >> webapp/.env
echo "VITE_COGNITO_DOMAIN=${CognitoDomainName}.auth.${AwsRegion}.amazoncognito.com" >> webapp/.env
echo "VITE_IDENTITY_POOL_ID=${IdentityPoolId}" >> webapp/.env
echo "VITE_BUCKET_NAME=${S3WebAppBucket}" >> webapp/.env

echo "VITE_GEOMAP=${GeoMap}" >> webapp/.env
echo "VITE_GEOROUTE_CALCULATION=${GeoRouteCalculation}" >> webapp/.env
echo "VITE_GEOPLACE_INDEX=${GeoPlaceIndex}" >> webapp/.env
echo "VITE_GEOTRACKER=${GeoTracker}" >> webapp/.env
echo "VITE_GEOFENCE=${GeoFence}" >> webapp/.env
echo "VITE_GRAPHQL_ENDPOINT=${AppSyncUrl}" >> webapp/.env

cd webapp
npm install
npm run build
aws s3 cp dist "s3://${S3WebAppBucket}" --recursive
cd ..

echo -e "- Web App available at: ${YELLOW}https://${CloudFrontUrl}${SET}" 
