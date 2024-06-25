import { Form, showHUD, Toast, LocalStorage, Clipboard, showToast } from "@raycast/api";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { readFileSync } from "fs";
import mime from "mime-types";
import path from "path";
import { R2Config } from "./types/Config";
export default async function Command() {
  try {
    const value = await LocalStorage.getItem<string>("r2-config");
    if (value) {
      const config: R2Config = JSON.parse(value);
      // Modify the config here
      const ACCOUNT_ID = config.accountId || "";
      const bucket_name = config.bucketName;
      const ACCESS_KEY_ID = config.accessKeyId || "";
      const SECRET_ACCESS_KEY = config.secretAccessKey || "";
      const PUBLIC_DOMAIN = config.publicDomain || "";
      const ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

      const S3 = new S3Client({
        region: "auto",
        endpoint: ENDPOINT,
        credentials: {
          accessKeyId: ACCESS_KEY_ID,
          secretAccessKey: SECRET_ACCESS_KEY,
        },
      });
      const { text, file, html } = await Clipboard.read();
      console.log(`File: ${file}`);

      // read file
      if (file) {
        const normalizedPath = file.replace(/^file:\/\//, "");
        const extension = path.extname(normalizedPath);
        const contentType = mime.contentType(extension) || "application/octet-stream";
        const fileContent = readFileSync(normalizedPath);
        const key = uuidv4() + extension;
        console.log(key);
        const putCommand = new PutObjectCommand({
          Bucket: bucket_name,
          Key: key,
          ContentType: contentType,
          Body: fileContent,
        });
        await S3.send(putCommand);
        if (PUBLIC_DOMAIN && PUBLIC_DOMAIN.length > 0) {
          const URL = `${PUBLIC_DOMAIN}/${key}`;
          await Clipboard.copy(URL);
          showHUD("Copied to clipboard");
        } else {
          const response = await getSignedUrl(S3, putCommand, { expiresIn: 3600 });
          console.log(response);
          await Clipboard.copy(response);
          showHUD("Copied to clipboard");
        }
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: "No file to upload, Please check your clipboard.",
        });
      }
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "No config found, Please check your config.",
      });
    }

    // await closeMainWindow();
    // showHUD("Copied to clipboard");
  } catch (error) {
    console.error(error);
    showToast({
      style: Toast.Style.Failure,
      title: "Error",
      message: `Error to copy to clipboard: ${error}`,
    });
  }
}
