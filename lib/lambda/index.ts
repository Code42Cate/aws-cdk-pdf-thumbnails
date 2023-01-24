import type { S3Event } from "aws-lambda";
import { GetObjectCommand, GetObjectCommandOutput, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { fromBase64 } from "pdf2pic";
import { ToBase64Response } from "pdf2pic/dist/types/toBase64Response";

const client = new S3Client({});

const parseObjectKey = (key: string) => decodeURIComponent(key.replace(/\+/g, " "));

const bodyToBase64 = async (body: GetObjectCommandOutput["Body"]) => {
  const pdfByteArray = await body?.transformToByteArray();

  if (!pdfByteArray) return false;

  return Buffer.from(pdfByteArray).toString("base64");
};

export const handler = async (event: S3Event) => {
  // for each record, download the pdf and create a thumbnail
  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      // get buffer of each record
      const getOutput = await client.send(
        new GetObjectCommand({ Bucket: record.s3.bucket.name, Key: parseObjectKey(record.s3.object.key) })
      );
      if (getOutput.ContentType !== "application/pdf") return false;

      const pdfBase64 = await bodyToBase64(getOutput.Body);
      if (!pdfBase64) return false;

      // convert first page of pdf to base64 thumbnail
      const storeAsImage: ToBase64Response = await fromBase64(pdfBase64, {})(1, true);
      if (!storeAsImage || !storeAsImage?.base64) return false;

      // safe thumbnail as buffer
      const thumbnail = Buffer.from(storeAsImage.base64, "base64");

      // upload thumbnail to s3 bucket
      await client.send(
        new PutObjectCommand({
          Bucket: record.s3.bucket.name,
          Key: parseObjectKey(record.s3.object.key).replace(".pdf", ".png"),
          Body: thumbnail,
          ContentType: "image/png",
        })
      );

      return true;
    })
  );

  const response = {
    statusCode: 200,
    body: {
      message: "success",
      totalCreated: results.filter((result) => result.status === "fulfilled").length,
      totalFailed: results.filter((result) => result.status === "rejected").length,
    },
  };
  return response;
};
