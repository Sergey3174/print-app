import { Outlet, useNavigate } from "react-router-dom";
import { MobileShell } from "../../mobile-shell/ui/MobileShell";
import { useRef, useState, type ChangeEvent } from "react";
import { useRecentFiles } from "../model/recentFilesContext";
import { SettingsEditorSheet } from "../../../pages/profile/ui/SettingsEditorSheet";
import { useDispatch, useSelector } from "react-redux";
import { FileText, Info, Upload } from "lucide-react";
import { toast } from "react-toastify";
import { validatePreviewFile } from "../../../shared/lib/file/validatePreviewFile";
import EN from "../../../assets/en.svg";
import ID from "../../../assets/id.png";
import { useTranslation } from "react-i18next";
import { changeAppLanguage, type AppLanguage } from "../../../i18n";
import { type AppDispatch, type RootState } from "../../../app/store/store";
import { uploadTaskFileThunk } from "../../../entities/task/store/taskSlice";

export function AppLayout() {
  const { t, i18n } = useTranslation();
  const [isUploadSheetOpen, setIsUploadSheetOpen] = useState(false);
  const [isOpeningFile, setIsOpeningFile] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const selectedPrinter = useSelector(
    (state: RootState) => state.selectedPrinter.printer,
  );
  const { openPreviewFile } = useRecentFiles();
  const [selectedLanguage, setSelectedLanguage] = useState<AppLanguage>(() =>
    i18n.resolvedLanguage === "id_ID" ? "id" : "en",
  );

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
      await dispatch(uploadTaskFileThunk(file)).unwrap();
      await openPreviewFile(file);
      setIsUploadSheetOpen(false);
      navigate(selectedPrinter ? "/app/preview" : "/app/printer-scanner");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to upload document",
      );
    } finally {
      setIsOpeningFile(false);
    }
  };

  const header = (
    <header className="border-b border-white/25 bg-[linear-gradient(180deg,rgba(255,255,255,0.62),rgba(251,249,248,0.38))] shadow-[0_12px_32px_rgba(15,23,42,0.08),inset_0_-1px_0_rgba(255,255,255,0.35)] backdrop-blur-xs">
      <div className="flex h-16 w-full items-center justify-between px-3">
        <div className="flex items-center gap-4">
          {/* <div className="rounded-full border border-white/60 bg-[#eef2ff]/85 p-2 text-[#1d4ed8] shadow-[0_6px_16px_rgba(29,78,216,0.12)] transition-transform duration-150 active:scale-95">
            <Printer size={20} />
          </div> */}
          <h1 className="text-2xl font-bold tracking-[-0.02em] text-[#1a237e]">
            PrintBox
          </h1>
        </div>

        <button
          type="button"
          className="rounded-full border h-10 w-10 border-white/45 bg-white/35 p-0.5 text-[#1a237e] shadow-[0_4px_14px_rgba(15,23,42,0.06)] transition duration-150 active:scale-95 hover:bg-white/50"
          aria-label={t("app.changeLanguage")}
          onClick={() => {
            const nextLanguage = selectedLanguage === "en" ? "id" : "en";
            setSelectedLanguage(nextLanguage);
            void changeAppLanguage(nextLanguage);
          }}
        >
          <img
            src={selectedLanguage === "en" ? EN : ID}
            alt={
              selectedLanguage === "en"
                ? t("common.language.english")
                : t("common.language.indonesian")
            }
            className="h-full w-full object-cover rounded-full"
          />
        </button>
      </div>
    </header>
  );

  return (
    <MobileShell header={header}>
      <Outlet />

      <button
        className="absolute bottom-5 right-1/2 translate-x-1/2 uppercase min-w-[240px] h-12 px-4  gap-2  bg-[#1a237e] text-white flex justify-center items-center rounded-2xl "
        onClick={() => setIsUploadSheetOpen(true)}
        aria-label={t("common.uploadFile")}
      >
        <Upload size={20} /> {t("common.uploadDocument")}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />

      <SettingsEditorSheet
        isOpen={isUploadSheetOpen}
        title={t("common.uploadDocuments")}
        description={t("app.uploadDescription")}
        onClose={() => setIsUploadSheetOpen(false)}
        showActionButtons={false}
        showCloseButton={false}
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
                {isOpeningFile
                  ? t("common.openingFile")
                  : t("common.chooseFile")}
              </p>
              <p className="text-xs text-[#454652]">{t("app.uploadFormats")}</p>
            </div>

            <Upload
              size={18}
              className="shrink-0 text-[#767683] transition group-hover:text-[#000666]"
            />
          </button>

          <div className="flex items-start gap-3 rounded-xl border border-[#bdc2ff] bg-[#e0e0ff]/40 p-3">
            <Info size={16} className="mt-0.5 shrink-0 text-[#1a237e]" />
            <p className="text-xs leading-relaxed text-[#343d96]">
              {t("app.uploadHint")}
            </p>
          </div>
        </div>
      </SettingsEditorSheet>
    </MobileShell>
  );
}
