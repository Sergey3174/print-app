import { getDocxPageCount } from "./getDocxPageCount";
import { getPdfPageCount } from "./getPdfPageCount";

export async function estimatePagesByType(file: File, extension: string) {
  if (extension === "pdf") {
    return getPdfPageCount(file);
  }

  if (extension === "docx") {
    return getDocxPageCount(file);
  }

  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(extension)) {
    return 1;
  }

  return 1;
}
