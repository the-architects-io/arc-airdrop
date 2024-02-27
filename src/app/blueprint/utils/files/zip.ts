import { CollectionFileStats } from "@/app/blueprint/types";
import { ZipReader, BlobReader } from "@zip.js/zip.js";

const validateFileNames = (fileNames: string[]) => {
  // files should be named numerically starting from 0.
  // 0.png, 1.png, 2.png, 3.png, 4.png, 5.png, etc.

  let checkedFileNameNumbers: string[] = [];

  const fileNamesAreValid = fileNames.every((fileName) => {
    const fileNameWithoutFolder = fileName.split("/").pop();
    if (!fileNameWithoutFolder) {
      return false;
    }
    const fileNameParts = fileNameWithoutFolder.split(".");
    const fileNameWithoutExtension = fileNameParts[0];
    const fileNameNumber = parseInt(fileNameWithoutExtension);

    const fileNameNumberIsValid =
      !isNaN(fileNameNumber) &&
      !checkedFileNameNumbers.includes(fileNameNumber.toString()) &&
      fileNameNumber >= 0 &&
      fileNameNumber < fileNames.length;

    if (fileNameNumberIsValid) {
      checkedFileNameNumbers.push(fileNameNumber.toString());
    }

    return fileNameNumberIsValid;
  });

  return (
    fileNamesAreValid && checkedFileNameNumbers.length === fileNames.length
  );
};

export async function inspectZipFile(file: File): Promise<CollectionFileStats> {
  return new Promise(async (resolve, reject) => {
    const reader = new BlobReader(file as File);
    const zipReader = new ZipReader(reader);

    try {
      // Get all entries in the ZIP
      const entries = await zipReader.getEntries();

      const nonSystemFiles = entries.filter(
        (entry) => !entry.filename.startsWith("__MACOSX")
      );

      const fileNames = nonSystemFiles.map((entry) => entry.filename);

      // Validate file names
      const fileNamesAreValid = validateFileNames(fileNames);

      let totalUncompressedSize = 0;

      nonSystemFiles.forEach((entry) => {
        if (!entry.directory) {
          totalUncompressedSize += entry.uncompressedSize;
        }
      });

      console.log(`Total Files: ${nonSystemFiles.length}`);

      console.log(`Total Uncompressed Size: ${totalUncompressedSize} bytes`);

      await zipReader.close();

      resolve({
        files: nonSystemFiles.map(
          (entry) =>
            ({
              name: entry.filename,
              size: entry.uncompressedSize,
            } as CollectionFileStats["files"][0])
        ),
        totalUncompressedSize,
        fileNamesAreValid,
      });
    } catch (error) {
      console.error(error as Error);
      reject(error);
    }
  });
}
