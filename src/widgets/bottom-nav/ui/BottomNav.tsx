import { useRef, useState, type ChangeEvent } from "react";
import { File, Folder, Plus, Trash2, Upload, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { SettingsEditorSheet } from "../../../pages/profile/ui/SettingsEditorSheet";
import { useRecentFiles } from "../../app-layout/model/recentFilesContext";

type BottomNavItem = {
  to: string;
  icon: typeof File;
  label: string;
  type?: "special";
  fillOnActive?: boolean;
  action?: "upload";
};

const items: BottomNavItem[] = [
  { to: "/app", icon: File, label: "Home", fillOnActive: false },
  // { to: "/app/stats", icon: Folder, label: "Files", fillOnActive: false },
  {
    to: "/app",
    icon: Plus,
    label: "Upload",
    // type: "special",
    action: "upload",
  },
  // {
  //   to: "/app/profile",
  //   icon: User,
  //   label: "Account",
  //   fillOnActive: false,
  // },
];

export function BottomNav() {
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addRecentFile } = useRecentFiles();

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

    await addRecentFile(draftFile);
    setDraftFile(null);
    setIsUploadSheetOpen(false);
  };

  return (
    <>
      <footer className="absolute bottom-0 left-0 z-[2] grid w-full grid-cols-2 items-center justify-items-center bg-white/95 p-2 shadow-[0_14px_30px_rgba(11,55,134,0.18)]">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.action === "upload") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setIsUploadSheetOpen(true)}
                className="flex h-14 w-14 items-center justify-center bg-transparent text-[#7d8ea4] self-center "
              >
                <div className="flex flex-col items-center">
                  <span
                    className="relative flex items-center justify-center font-extrabold tracking-[0.22em]"
                    aria-hidden="true"
                  >
                    <Icon size={30} />
                  </span>
                  <span className="text-[11px]">{item.label}</span>
                </div>
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex h-14 w-14 items-center justify-center self-center rounded-[18px] text-xs ${
                  isActive ? "text-gray-600" : "bg-transparent text-[#7d8ea4]"
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex flex-col items-center">
                  <span
                    className="relative flex items-center justify-center font-extrabold tracking-[0.22em]"
                    aria-hidden="true"
                  >
                    <Icon
                      size={32}
                      fill={
                        isActive && item.fillOnActive ? "currentColor" : "none"
                      }
                    />
                  </span>
                  <span>{item.label}</span>
                </div>
              )}
            </NavLink>
          );
        })}
      </footer>

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
        description="Choose documents or images to add them to your home list."
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
    </>
  );
}
