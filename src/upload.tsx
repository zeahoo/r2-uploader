import { showHUD, Toast, Clipboard, showToast, getPreferenceValues } from "@raycast/api";
import { S3Client } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { readFileSync } from "fs";
import mime from "mime-types";
import path from "path";
import { R2Config } from "./types/config";
import { getS3Client, uploadToOSS } from "./utils/s3helper";
import { getAllFilePaths, isImageFormat } from "./utils/filehelper";
export default async function Command() {
  try {
    const { file } = await Clipboard.read();
    console.log(`File: ${file}`);
    const config: R2Config = getPreferenceValues<R2Config>();
    const S3 = getS3Client(config);
    const outputFormat = config.outputFormat || "";

    // read file
    if (file) {
      const normalizedPath = file.replace(/^file:\/\//, "");
      const pathList = getAllFilePaths(normalizedPath);
      const OSS_URL_LIST = await Promise.all(
        pathList.map(async ({ filePath, filename, fullname, extension }) => {
          const contentType = mime.contentType(extension) || "application/octet-stream";
          const fileContent: Buffer = readFileSync(filePath);
          const key = uuidv4() + extension;
          console.log(
            `currentFile Path: ${filePath} Filename: ${filename} Fullname: ${fullname} Extension: ${extension}
             key: ${key}
            `,
          );
          const URL = await uploadToOSS(S3, config, key, fileContent, contentType);
          return {
            filename: filename,
            fullname: fullname,
            extension: extension,
            url: URL,
          };
        }),
      );
      if (outputFormat === "JSON") {
        const OSS_URL_LIST_STRING = JSON.stringify(OSS_URL_LIST, null, 2);
        await Clipboard.copy(OSS_URL_LIST_STRING);
      } else if (outputFormat === "Markdown") {
        const MD = OSS_URL_LIST.map((item) => {
          const filename = item.filename;
          const url = item.url;
          const extension = item.extension;
          if (isImageFormat(extension)) {
            return `![${filename}](${url})`;
          } else {
            return `[${filename}](${url})`;
          }
        }).join("\n");
        await Clipboard.copy(MD);
      } else if (outputFormat === "URL") {
        const URL_ONLY_STR = OSS_URL_LIST.map((item) => {
          return item.url;
        }).join("\n");
        await Clipboard.copy(URL_ONLY_STR);
      } else {
        showToast({
          style: Toast.Style.Failure,
          title: "Error",
          message: "Output format not supported. Please check your preferences.",
        });
        return;
      }
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
