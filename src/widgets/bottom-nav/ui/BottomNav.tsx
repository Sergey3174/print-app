import { useRef, useState, type ChangeEvent } from "react";
import { File, FileText, Home, Info, Plus, Upload } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { SettingsEditorSheet } from "../../../pages/profile/ui/SettingsEditorSheet";
import { useRecentFiles } from "../../app-layout/model/recentFilesContext";
import { toast } from "react-toastify";
import { validatePreviewFile } from "../../../shared/lib/file/validatePreviewFile";

type BottomNavItem = {
  to: string;
  icon: typeof File;
  label: string;
  type?: "special";
  fillOnActive?: boolean;
  action?: "upload";
};

const items: BottomNavItem[] = [
  { to: "/app", icon: Home, label: "Home", fillOnActive: true },
  // { to: "/app/stats", icon: Folder, label: "Files", fillOnActive: false },
  {
    to: "/app",
    icon: Plus,
    label: "UPLOAD",
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
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { openPreviewFile } = useRecentFiles();

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";

    if (!file) {
      return;
    }

    const validationResult = validatePreviewFile(file);

    if (!validationResult.isValid) {
      toast.error(validationResult.errorMessage);
      return;
    }

    setIsOpeningFile(true);

    try {
      await openPreviewFile(file);
      setIsUploadSheetOpen(false);
      navigate("/app/preview");
    } finally {
      setIsOpeningFile(false);
    }
  };

  return (
    <>
      <footer className="absolute bottom-0 left-0 z-[2] grid w-full grid-cols-2 items-center justify-items-center bg-black/95 p-2 shadow-[0_14px_30px_rgba(11,55,134,0.18)]">
        {items.map((item) => {
          const Icon = item.icon;

          if (item.action === "upload") {
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setIsUploadSheetOpen(true)}
                className="flex self-center rounded-xl bg-white px-4 py-2 text-black transition duration-150 ease-out active:scale-95 active:bg-white/80"
              >
                <div className="flex items-center gap-2 transition duration-150 active:opacity-80">
                  <span
                    className="relative flex items-center justify-center font-extrabold tracking-[0.22em]"
                    aria-hidden="true"
                  >
                    <Upload size={22} />
                  </span>
                  <span className="text-[14px] font-medium">{item.label}</span>
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
                  isActive ? "text-white" : " text-gray-400"
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
                      strokeWidth={isActive && item.fillOnActive ? 0 : 2}
                    />
                    {isActive && item.label === "Home" ? (
                      <span className="absolute bottom-[4px] h-[9px] w-[6px] rounded-t-[2px] bg-black" />
                    ) : null}
                  </span>
                  {/* <span>{item.label}</span> */}
                </div>
              )}
            </NavLink>
          );
        })}
      </footer>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      <SettingsEditorSheet
        isOpen={isUploadSheetOpen}
        title="Upload documents"
        description="Pick a document or image and we'll open it in preview right away."
        onClose={() => setIsUploadSheetOpen(false)}
        showActionButtons={false}
        showCloseButton
      >
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isOpeningFile}
            className="group flex w-full items-center gap-4 rounded-2xl border border-[#c6c5d4] bg-[#f5f3f3] p-4 text-left transition active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1a237e] text-white">
              <FileText size={22} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-[#000666]">
                {isOpeningFile ? "Opening file..." : "Choose file"}
              </p>
              <p className="text-xs text-[#454652]">
                PDF, DOCX, JPG or PNG up to 50 MB
              </p>
            </div>

            <Upload
              size={18}
              className="shrink-0 text-[#767683] transition group-hover:text-[#000666]"
            />
          </button>

          <div className="flex items-start gap-3 rounded-xl border border-[#bdc2ff] bg-[#e0e0ff]/40 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-[#1a237e]" />
            <p className="text-xs leading-relaxed text-[#343d96]">
              The preview opens automatically right after selection, without an
              extra save step.
            </p>
          </div>
        </div>
      </SettingsEditorSheet>
    </>
  );
}
