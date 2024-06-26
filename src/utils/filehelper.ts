import fs from "fs";
import path from "path";

function getAllFilePaths(filePath: string): string[] {
  const filePaths: string[] = [];

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
        filePaths.push(filePath);
      }
    }
  }

  return filePaths;
}

export default getAllFilePaths;
