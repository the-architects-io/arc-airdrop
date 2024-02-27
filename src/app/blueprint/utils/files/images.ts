const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/tiff",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/rtf",
  "audio/mpeg",
  "audio/ogg",
  "audio/wav",
  "audio/mp4",
  "video/mp4",
  "video/ogg",
  "video/webm",
  "application/zip",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "text/html",
  "text/css",
  "application/javascript",
  "application/json",
  "application/xml",
];

const mimeToExtension: { [key: string]: string } = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/gif": "gif",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/tiff": "tiff",
  "application/pdf": "pdf",
  "application/msword": "doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
  "application/vnd.ms-excel": "xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.ms-powerpoint": "ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "pptx",
  "text/plain": "txt",
  "text/csv": "csv",
  "application/rtf": "rtf",
  "audio/mpeg": "mp3",
  "audio/ogg": "ogg",
  "audio/wav": "wav",
  "audio/mp4": "m4a",
  "video/mp4": "mp4",
  "video/ogg": "ogv",
  "video/webm": "webm",
  "application/zip": "zip",
  "application/x-rar-compressed": "rar",
  "application/x-7z-compressed": "7z",
  "application/x-tar": "tar",
  "text/html": "html",
  "text/css": "css",
  "application/javascript": "js",
  "application/json": "json",
  "application/xml": "xml",
};

export const createFileFromUrl = async ({
  url,
  fileName,
}: {
  url: string;
  fileName: string;
}) => {
  const response = await fetch(url);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const contentType =
    response.headers.get("Content-Type") || "application/octet-stream";
  if (!allowedMimeTypes.includes(contentType.split(";")[0])) {
    throw new Error(`Invalid file type: ${contentType}`);
  }

  const blob = await response.blob();
  const fileNameWithoutExtension = fileName.replace(/\.[^/.]+$/, "");
  const safeFileName = fileNameWithoutExtension.replace(/[^a-zA-Z0-9_-]/g, "");

  const extension = mimeToExtension[contentType.split(";")[0]] || "bin";
  const newFileName = `${safeFileName}.${extension}`;

  const file = new File([blob], newFileName, {
    type: contentType.split(";")[0],
  });

  return file;
};
