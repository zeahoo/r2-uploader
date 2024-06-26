import { showHUD, Toast, Clipboard, showToast, getPreferenceValues } from "@raycast/api";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import mime from "mime-types";
import path from "path";
import { R2Config } from "./types/config";
import { uploadToOSS } from "./utils/s3helper";
export default async function Command() {
  try {
    const config: R2Config = getPreferenceValues<R2Config>();
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
    const { text, file, html } = await Clipboard.read();
    console.log(`File: ${file}`);

    // read file
    if (file) {
      const normalizedPath = file.replace(/^file:\/\//, "");
      const extension = path.extname(normalizedPath);
      const contentType = mime.contentType(extension) || "application/octet-stream";
      const fileContent: Buffer = readFileSync(normalizedPath);
      const key = uuidv4() + extension;
      console.log(key);
      const URL = await uploadToOSS(S3, config, key, fileContent, contentType);
      await Clipboard.copy(URL);
      showHUD("Copied to clipboard");
    } else {
      showToast({
        style: Toast.Style.Failure,
        title: "Error",
        message: "No file to upload, Please check your clipboard.",
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
