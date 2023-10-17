# Requirements
Before you deploy, you must have the following in place:
*  [AWS Account](https://aws.amazon.com/account/) 
*  [GitHub Account](https://github.com/) 
*  [AWS CLI](https://aws.amazon.com/cli/) 
*  [AWS SAM](https://aws.amazon.com/serverless/sam/) 
*  Python 3.9, NodeJs v18 and npm
 


# Step 1: Deploy the Solution 

In this step we deploy all resources this solution requires, including AWS AppSync Schema and its resolvers, via AWS SAM.  

The first step is to execute **sam build** so the solution can prepare all the Python libraries to be installed.

```bash
sam build
```

Next step is to deploy the solution

```bash
sam deploy -g --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND CAPABILITY_NAMED_IAM
```

In the questions, provide the stack-name as geotrack-backend the region you are deploying the solution and accept all the default options. The output should be similar to:

```bash
Stack Name [sam-app]: geotrack-backend
AWS Region [us-east-1]: us-west-2
Parameter ProjectName [geotrack]:
Parameter EnvironmentName [main]:
Parameter CorsOrigin ['*']:
Parameter CorsHeaders ['Content-Type,X-Amz-Date,Authorization,X-Api-KeyX-Amz-Security-Token']:
Parameter CorsMethods ['OPTIONS,POST']:
#Shows you resources changes to be deployed and require a 'Y' to initiatedeploy
Confirm changes before deploy [y/N]: y
#SAM needs permission to be able to create roles to connect to theresources in your template
Allow SAM CLI IAM role creation [Y/n]: y
Save arguments to configuration file [Y/n]: y
SAM configuration file [samconfig.toml]:
SAM configuration environment [default]:
```

Confirm the deploy of the changeset and wait for the to finish.

# Step 2: Deploy the WebApp

```bash
./webappconfig.sh
```