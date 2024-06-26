import fs from "fs";
import path from "path";

export function getAllFilePaths(
  filePath: string,
): { filePath: string; filename: string; fullname: string; extension: string }[] {
  const filePaths: { filePath: string; filename: string; fullname: string; extension: string }[] = [];

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const files = fs.readdirSync(filePath);

      files.forEach((file) => {
        const fullPath = path.join(filePath, file);
        const nestedFilePaths = getAllFilePaths(fullPath);
        filePaths.push(...nestedFilePaths);
      });
    } else if (stats.isFile()) {
      if (!filePath.endsWith(".DS_Store")) {
        const fullname = path.basename(filePath);
        const extension = path.extname(filePath);
        const filename = path.basename(filePath).replace(/\.[^/.]+$/, "");
        filePaths.push({ filePath, filename, fullname, extension });
      }
    }
  }

  return filePaths;
}

export function isImageFormat(extension: string): boolean {
  const imageFormats = [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp"];
  return imageFormats.includes(extension.toLowerCase());
}

export function getDirectory(dir: string): string {
  if (dir) {
    let directory = dir;
    if (dir.startsWith("/")) {
      directory = directory.substring(1);
    }
    if (!dir.endsWith("/")) {
      directory = directory + "/";
    }
    return directory;
  } else {
    return "";
  }
}
