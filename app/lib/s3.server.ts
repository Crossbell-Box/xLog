import {
  S3_REGION,
  S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY,
  S3_BUCKET_NAME,
  S3_ENDPOINT,
} from "~/lib/env"
import {
  S3Client,
  PutObjectCommand,
  type PutObjectRequest,
} from "@aws-sdk/client-s3"
import { singleton } from "~/lib/singleton.server"

export const s3 = singleton("s3-client", () => {
  return new S3Client({
    endpoint: S3_ENDPOINT ? `https://${S3_ENDPOINT}` : undefined,
    region: S3_REGION,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  })
})

export const s3uploadFile = async (
  filename: string,
  file: PutObjectRequest["Body"] | string | Buffer,
  contentType?: string
) => {
  await s3.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: filename,
      Body: file,
      ContentType: contentType,
    })
  )
}
