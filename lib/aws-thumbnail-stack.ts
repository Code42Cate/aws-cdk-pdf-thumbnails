import { Stack, StackProps, RemovalPolicy, Duration } from "aws-cdk-lib";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { LambdaDestination } from "aws-cdk-lib/aws-s3-notifications";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { LayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { ManagedPolicy, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import config from "../config";

export class AwsThumbnailStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    // create s3 bucket that is used for pdf + thumbnail storage
    // enable deletion of bucket

    const bucket = new Bucket(this, "PdfBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // role with permissions to read/write to s3 bucket

    const lambdaRole = new Role(this, "PdfThumbnailLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: "PdfThumbnailLambdaRole",
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
      ],
    });

    const lambda = new NodejsFunction(this, "PdfThumbnailLambda", {
      entry: "lib/lambda/index.ts",
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
      bundling: {
        minify: true,
        tsconfig: "./tsconfig.json",
      },
      layers: [
        LayerVersion.fromLayerVersionArn(
          this,
          "GraphicsMagickLayer",
          `arn:aws:lambda:${config.region}:175033217214:layer:graphicsmagick:2`
        ),
        LayerVersion.fromLayerVersionArn(
          this,
          "GhostScriptLayer",
          `arn:aws:lambda:${config.region}:764866452798:layer:ghostscript:13`
        ),
      ],
      functionName: "PdfThumbnailGenerator",
      description:
        "Triggered when a pdf is uploaded to the bucket. Creates a thumbnail and stores it in the same bucket.",
      timeout: Duration.seconds(30),
      runtime: Runtime.NODEJS_18_X,
      role: lambdaRole,
    });

    // add s3 bucket as event source for lambda
    // lambda will be triggered when a pdf is uploaded to the bucket
    bucket.addEventNotification(EventType.OBJECT_CREATED, new LambdaDestination(lambda), { suffix: ".pdf" });
  }
}
