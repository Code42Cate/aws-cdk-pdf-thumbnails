# AWS CDK Lambda + S3 PDF Thumbnail Generator

This is a very small and minimal example CDK project to create a lambda function that automatically generates a PNG thumbnail for a PDF file uploaded to an S3 bucket.

**Note: This is not a production-ready solution. It is just a minimal example to show how you could use AWS CDK to create PDF thumbnails. It is not optimized for performance or security, seriously, don't use this in production.**


First, make sure that CDK is installed and configured/authenticated.
Then edit the `config.ts` file to set your account ID and region.

Then follow these steps:
```bash
npm install
cdk bootstrap
cdk synth
cdk deploy
```

## Useful commands

* `cdk bootstrap`   bootstrap this stack
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

* `npm run test`    perform the jest unit tests


## Components

The project consists of the following components:

* `config.ts` - contains the configuration for the project
* `bin/aws-thumbnail.ts` - the main entry point for the CDK project
* `lib/aws-thumbnail-stack.ts` - the main stack for the CDK project
* `lib/lambda/index.ts` - the lambda function that is executed when a PDF file is uploaded to the S3 bucket
* `test/aws-thumbnail.test.ts` - the unit tests for the CDK project

## Stack

Deploying the stack will create the following resources:
* S3 bucket to upload the PDF files and store the thumbnails
* Lambda function to generate the thumbnails
* Role for the Lambda function to access the S3 bucket
* Event Notification for the S3 bucket to trigger the Lambda function when an object is created