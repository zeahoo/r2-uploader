import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { R2Config } from "../types/config";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export function getS3Client(config: R2Config) {
  // Modify the config here
  const ACCOUNT_ID = config.accountId || "";
  const ACCESS_KEY_ID = config.accessKeyId || "";
  const SECRET_ACCESS_KEY = config.secretAccessKey || "";
  const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

  const S3 = new S3Client({
    region: "auto",
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
  return S3;
}

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
    if (publicDomain.endsWith("/")) {
      return `${publicDomain}${key}`;
    } else {
      return `${publicDomain}/${key}`;
    }
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
