import * as cdk from "aws-cdk-lib";
import { Match, Template } from "aws-cdk-lib/assertions";
import * as AwsThumbnail from "../lib/aws-thumbnail-stack";

// Very minimal test to check basic stack creation, add more as needed.
test("Stack created", () => {
  const app = new cdk.App();
  const stack = new AwsThumbnail.AwsThumbnailStack(app, "MyTestStack");
  const template = Template.fromStack(stack);

  // has s3 bucket resource
  template.hasResourceProperties("AWS::S3::Bucket", Match.anyValue());

  // template has lambda function with layers and name
  template.hasResourceProperties(
    "AWS::Lambda::Function",
    Match.objectLike({
      FunctionName: "PdfThumbnailGenerator",
      Layers: Match.arrayWith([Match.stringLikeRegexp(".*(graphicsmagick|ghostscript).*")]),
    })
  );

  // template has lambda role
  template.hasResourceProperties("AWS::IAM::Role", Match.objectLike({ RoleName: "PdfThumbnailLambdaRole" }));
});
