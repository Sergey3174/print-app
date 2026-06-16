import { Outlet, useNavigate } from "react-router-dom";
import { MobileShell } from "../../mobile-shell/ui/MobileShell";
import { useRef, useState, type ChangeEvent } from "react";
import { useRecentFiles } from "../model/recentFilesContext";
import { SettingsEditorSheet } from "../../../pages/profile/ui/SettingsEditorSheet";
import { Globe, Printer, Trash2, Upload } from "lucide-react";

export function AppLayout() {
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openPreviewFile } = useRecentFiles();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setDraftFile(file);
    event.target.value = "";
  };

  const handleCloseSheet = () => {
    setDraftFile(null);
    setIsUploadSheetOpen(false);
  };

  const handleSaveFile = async () => {
    if (!draftFile) {
      setIsUploadSheetOpen(false);
      return;
    }

    await openPreviewFile(draftFile);
    setDraftFile(null);
    setIsUploadSheetOpen(false);
    navigate("/app/preview");
  };

  const header = (
    <header className="border-b border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(251,249,248,0.38))] shadow-[0_12px_32px_rgba(15,23,42,0.08),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-xs">
      <div className="flex h-16 w-full items-center justify-between px-3">
        <div className="flex items-center gap-4">
          <div className="rounded-full border border-white/60 bg-[#eef2ff]/85 p-2 text-[#1d4ed8] shadow-[0_6px_16px_rgba(29,78,216,0.12)] transition-transform duration-150 active:scale-95">
            <Printer size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1a237e]">
            PrintBox
          </h1>
        </div>

        <button
          type="button"
          className="rounded-full border border-white/45 bg-white/35 p-2 text-[#1a237e] shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition duration-150 active:scale-95 hover:bg-white/50"
          aria-label="Change language"
        >
          <Globe size={20} />
        </button>
      </div>
    </header>
  );

  return (
    <MobileShell header={header}>
      <Outlet />

      <button
        className="absolute bottom-5 right-1/2 translate-x-1/2 uppercase min-w-[240px] h-12 px-4  gap-2  bg-black text-white flex justify-center items-center rounded-full"
        onClick={() => setIsUploadSheetOpen(true)}
        aria-label="Upload file"
      >
        <Upload size={20} /> Upload document
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <SettingsEditorSheet
        isOpen={isUploadSheetOpen}
        title="Upload file"
        description="Choose a document or image to open it in print preview."
        onClose={handleCloseSheet}
        onSave={handleSaveFile}
        disabled={!draftFile}
      >
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[#0d6be8]/40 bg-[#eef6ff] px-4 py-5 text-sm font-semibold text-[#0d6be8]"
          >
            <Upload size={18} />
            Choose files
          </button>

          {draftFile ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900">
                  {draftFile.name.replace(/\.[^.]+$/, "")}
                </p>
                <p className="text-xs text-gray-500">
                  {(draftFile.name.split(".").pop() ?? "file").toUpperCase()} |{" "}
                  {draftFile.size >= 1024 * 1024
                    ? `${(draftFile.size / (1024 * 1024)).toFixed(1)} MB`
                    : `${Math.max(1, Math.round(draftFile.size / 1024))} KB`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDraftFile(null)}
                className="rounded-full border border-red-200 bg-red-50 p-2 text-red-500 transition hover:bg-red-100"
                aria-label="Remove selected file"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ) : null}
        </div>
      </SettingsEditorSheet>
    </MobileShell>
  );
}
