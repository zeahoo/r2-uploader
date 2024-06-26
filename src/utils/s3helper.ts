import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { R2Config } from "../types/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function uploadToOSS(
  S3: S3Client,
  r2Config: R2Config,
  key: string,
  fileContent: Buffer,
  contentType: string,
) {
  const bucketName = r2Config.bucketName;
  const publicDomain = r2Config.publicDomain;
  await S3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      ContentType: contentType,
      Body: fileContent,
    }),
  );
  if (publicDomain && publicDomain.length > 0) {
    return `${publicDomain}/${key}`;
  } else {
    const response = await getSignedUrl(
      S3,
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
      { expiresIn: 3600 },
    );
    return response;
  }
}
