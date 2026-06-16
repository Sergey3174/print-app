const SUPPORTED_PREVIEW_EXTENSIONS = new Set(["pdf", "docx", "jpg", "jpeg", "png"]);

export function validatePreviewFile(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";

  if (SUPPORTED_PREVIEW_EXTENSIONS.has(extension)) {
    return {
      isValid: true,
      errorMessage: null,
    };
  }

  return {
    isValid: false,
    errorMessage: "Unsupported format. Please choose PDF, DOCX, JPG, JPEG, or PNG.",
  };
}
