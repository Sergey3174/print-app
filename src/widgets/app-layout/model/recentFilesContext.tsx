import {
  createContext,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import {
  buildRecentFileItem,
  type RecentFileLike,
} from "../../../shared/lib/file/buildRecentFileItem";

export type RecentFileItem = RecentFileLike;

type RecentFilesContextValue = {
  recentFiles: RecentFileItem[];
  activeRecentFile: RecentFileItem | null;
  openPreviewFile: (file: File) => Promise<void>;
  removeRecentFile: (id: number) => void;
  setActiveRecentFileById: (id: number) => void;
};

const initialRecentFiles: RecentFileItem[] = [
  {
    id: 1,
    title: "Startup UX Blue Print",
    type: "PDF",
    pages: 3,
    action: "Print",
    sizeLabel: "0.9 MB",
    createdAt: Date.now() - 5_000,
    file: null,
  },
  {
    id: 2,
    title: "Resume - Pranav Khatri",
    type: "PDF",
    pages: 1,
    action: "Print",
    sizeLabel: "0.2 MB",
    createdAt: Date.now() - 4_000,
    file: null,
  },
  {
    id: 3,
    title: "Project Requirements Doc",
    type: "PDF",
    pages: 8,
    action: "Print",
    sizeLabel: "1.1 MB",
    createdAt: Date.now() - 3_000,
    file: null,
  },
];

const RecentFilesContext = createContext<RecentFilesContextValue | null>(null);

export function RecentFilesProvider({ children }: PropsWithChildren) {
  const [recentFiles, setRecentFiles] =
    useState<RecentFileItem[]>(initialRecentFiles);
  const [activeRecentFile, setActiveRecentFile] =
    useState<RecentFileItem | null>(null);

  const value = useMemo<RecentFilesContextValue>(
    () => ({
      recentFiles,
      activeRecentFile,
      openPreviewFile: async (file) => {
        const previewFileItem = await buildRecentFileItem(file);
        setActiveRecentFile(previewFileItem);
      },
      removeRecentFile: (id) => {
        setRecentFiles((prev) => prev.filter((file) => file.id !== id));
        setActiveRecentFile((prev) => (prev?.id === id ? null : prev));
      },
      setActiveRecentFileById: (id) => {
        setActiveRecentFile(
          recentFiles.find((file) => file.id === id && file.file) ?? null,
        );
      },
    }),
    [activeRecentFile, recentFiles],
  );

  return (
    <RecentFilesContext.Provider value={value}>
      {children}
    </RecentFilesContext.Provider>
  );
}

export function useRecentFiles() {
  const context = useContext(RecentFilesContext);

  if (!context) {
    throw new Error("useRecentFiles must be used within RecentFilesProvider");
  }

  return context;
}
