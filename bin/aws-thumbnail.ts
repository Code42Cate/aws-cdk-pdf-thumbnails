#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AwsThumbnailStack } from "../lib/aws-thumbnail-stack";
import config from "../config";

const app = new cdk.App();
new AwsThumbnailStack(app, "AwsThumbnailStack", {
  env: { account: config.account, region: config.region },
});
