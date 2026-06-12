import { estimatePagesByType } from "./estimatePagesByType";
import { formatFileSize } from "./formatFileSize";
import { getFileBaseName } from "./getFileBaseName";
import { getFileExtension } from "./getFileExtension";

export type RecentFileLike = {
  id: number;
  title: string;
  type: string;
  pages: number;
  action: "Print";
  sizeLabel: string;
  createdAt: number;
  file: File | null;
};

export async function buildRecentFileItem(file: File): Promise<RecentFileLike> {
  const extension = getFileExtension(file.name);
  const title = getFileBaseName(file.name);
  const createdAt = Date.now();

  return {
    id: createdAt,
    title,
    type: extension.toUpperCase(),
    pages: await estimatePagesByType(file, extension),
    action: "Print",
    sizeLabel: formatFileSize(file.size),
    createdAt,
    file,
  };
}
