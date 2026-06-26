const UPLOAD_INIT_CONTENT_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  txt: "text/plain",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  rtf: "application/rtf",
  odt: "application/vnd.oasis.opendocument.text",
};

export function getUploadInitContentType(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "";

  return UPLOAD_INIT_CONTENT_TYPES[extension] ?? null;
}
