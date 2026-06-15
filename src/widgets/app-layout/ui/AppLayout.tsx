import { Outlet, useNavigate } from "react-router-dom";
import { MobileShell } from "../../mobile-shell/ui/MobileShell";
import { BottomNav } from "../../bottom-nav/ui/BottomNav";
import { useRef, useState, type ChangeEvent } from "react";
import { useRecentFiles } from "../model/recentFilesContext";
import { SettingsEditorSheet } from "../../../pages/profile/ui/SettingsEditorSheet";
import { Trash2, Upload } from "lucide-react";

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

  return (
    <MobileShell>
      <Outlet />
      <button
        className="absolute bottom-5 right-5 h-15 w-15 bg-black text-white flex justify-center items-center rounded-full"
        onClick={() => setIsUploadSheetOpen(true)}
        aria-label="Upload file"
      >
        <Upload />
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
