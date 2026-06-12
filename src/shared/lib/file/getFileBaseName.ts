export function getFileBaseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "");
}
