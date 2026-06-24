import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Scan, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import { SettingsEditorSheet } from "../../pages/profile/ui/SettingsEditorSheet";
import { getFileBaseName } from "../../shared/lib/file/getFileBaseName";
import { getFileExtension } from "../../shared/lib/file/getFileExtension";
import { useRecentFiles } from "../../widgets/app-layout/model/recentFilesContext";
import { parsePages } from "./parsePages";
import { setPreviewSession, type PagePreview } from "./previewSession";
import { buildPdfPreviews } from "./lib/buildPdfPreviews";
import { isPreviewImageExtension } from "./lib/isPreviewImageExtension";
import { formatCurrency } from "../../shared/lib/formatCurrency";
import { type AppDispatch, type RootState } from "../../app/store/store";
import { fetchTaskStateThunk } from "../../entities/task/store/taskSlice";

const DOCX_PAGE_WIDTH = 794;
const DOCX_DEFAULT_PAGE_HEIGHT = 1123;
const OFFICE_DOCUMENT_EXTENSIONS = ["doc", "docx"];

function ToggleOption({
  options,
  active,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  active: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-2xl bg-white/35 p-1 backdrop-blur-sm">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            active === opt.value
              ? "bg-white text-[#000666] border border-[#000666]/20 shadow-[0_8px_20px_rgba(26,35,126,0.08)]"
              : "text-[#767683]"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function DocxPageCard({ node }: { node: HTMLElement }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.innerHTML = "";

    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.pointerEvents = "none";
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.transformOrigin = "top left";
    ref.current.appendChild(clone);

    requestAnimationFrame(() => {
      const containerW = 144;
      const containerH = 192;
      const scale = Math.min(
        containerW / DOCX_PAGE_WIDTH,
        containerH / DOCX_DEFAULT_PAGE_HEIGHT,
      );
      const scaledW = DOCX_PAGE_WIDTH * scale;
      const offsetX = (containerW - scaledW) / 2;

      clone.style.width = `${DOCX_PAGE_WIDTH}px`;
      clone.style.transform = `translateX(${offsetX}px) scale(${scale})`;
    });
  }, [node]);

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden rounded-[18px] bg-white"
    />
  );
}

function PageCard({ preview }: { preview: PagePreview }) {
  if (preview.type === "image") {
    return (
      <img
        src={preview.src}
        className="h-full w-full rounded-[18px] object-contain bg-white"
        alt="page"
      />
    );
  }

  return <DocxPageCard node={preview.node} />;
}

function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="h-2 w-3/4 rounded bg-[#d8dcff]" />
      <div className="h-1.5 w-1/2 rounded bg-[#eef1ff]" />
      <div className="mt-1 flex-1 rounded bg-[#eef1ff]" />
      <div className="h-1.5 w-full rounded bg-[#eef1ff]" />
      <div className="h-1.5 w-4/5 rounded bg-[#eef1ff]" />
    </div>
  );
}

export function Preview() {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { activeRecentFile } = useRecentFiles();
  const task = useSelector((state: RootState) => state.task);
  const [pagesPerSheet, setPagesPerSheet] = useState(1);
  const [pageMode, setPageMode] = useState<"all" | "custom">("all");
  const [pageRangeInput, setPageRangeInput] = useState("");
  const [rangeStart, setRangeStart] = useState<string>("");
  const [rangeEnd, setRangeEnd] = useState<string>("");
  const [type, setType] = useState("B&W");
  const [sides, setSides] = useState("One Side");
  const [scrollProgress, setScrollProgress] = useState(0);
  const [previews, setPreviews] = useState<PagePreview[] | null>(null);
  const [fileName, setFileName] = useState("Startup UX Blue Print");
  const [loading, setLoading] = useState(false);
  const [isPageSheetOpen, setIsPageSheetOpen] = useState(false);

  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeFile = activeRecentFile?.file ?? null;
  const activeFileExtension = activeFile
    ? getFileExtension(activeFile.name)
    : null;
  const isOfficeDocument =
    activeFileExtension != null &&
    OFFICE_DOCUMENT_EXTENSIONS.includes(activeFileExtension);

  const totalPages =
    previews?.length ?? task.pagesCount ?? activeRecentFile?.pages ?? 0;
  const pricePerPage = 20000.21;

  const selectedPages = useMemo(() => {
    if (pageMode === "all") {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (pageRangeInput.trim()) {
      const parsed = parsePages(pageRangeInput, totalPages);
      if (parsed) return parsed;
      return [];
    }

    if (!rangeStart || !rangeEnd) return [];

    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);

    if (isNaN(start) || isNaN(end) || start > end) return [];

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [pageMode, pageRangeInput, rangeStart, rangeEnd, totalPages]);

  const selectedPagesCount = selectedPages.length;
  const totalPrice = pricePerPage * selectedPagesCount;

  console.log("totalPrice", totalPrice);

  const rangeError = useMemo(() => {
    if (pageMode === "all") return null;

    if (pageRangeInput.trim()) {
      const parsed = parsePages(pageRangeInput, totalPages);
      if (parsed === null) {
        return t("preview.invalidFormat");
      }
      if (parsed.length === 0) {
        return t("preview.noValidPages");
      }
    } else {
      if (!rangeStart && !rangeEnd) {
        return t("preview.enterPageRange");
      }
      if (!rangeStart || !rangeEnd) {
        return t("preview.fillBothFields");
      }

      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);

      if (start < 1 || start > totalPages) {
        return t("preview.startBetween", { totalPages });
      }
      if (end < 1 || end > totalPages) {
        return t("preview.endBetween", { totalPages });
      }
      if (start > end) {
        return t("preview.startLessOrEqual");
      }
    }

    return null;
  }, [pageMode, pageRangeInput, rangeStart, rangeEnd, t, totalPages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollProgress(isNaN(progress) ? 0 : progress);
  };

  useEffect(() => {
    void dispatch(fetchTaskStateThunk());
  }, [dispatch]);

  useEffect(() => {
    if (!isOfficeDocument || task.fileStatus !== "processing") {
      return;
    }

    const intervalId = window.setInterval(() => {
      void dispatch(fetchTaskStateThunk());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [dispatch, isOfficeDocument, task.fileStatus]);

  useEffect(() => {
    let isCancelled = false;

    async function loadPreviewFromContext() {
      if (!activeRecentFile) {
        setFileName(t("preview.noFileSelected"));
        setPreviews(null);
        setPreviewSession(null);
        return;
      }

      setFileName(activeRecentFile.title);

      if (!activeRecentFile.file) {
        setPreviews(null);
        setPreviewSession(null);
        return;
      }

      const file = activeRecentFile.file;
      const fileBaseName = getFileBaseName(file.name);
      const extension = getFileExtension(file.name);

      if (OFFICE_DOCUMENT_EXTENSIONS.includes(extension)) {
        setFileName(task.originalFileName ?? activeRecentFile.title);

        if (task.fileStatus === "processing") {
          setLoading(true);
          setPreviews(null);
          setPreviewSession(null);
          return;
        }

        if (task.fileStatus !== "ready" || !task.pdfFileUrl) {
          setLoading(false);
          setPreviews(null);
          setPreviewSession(null);
          return;
        }
      }

      setLoading(true);
      setPreviews(null);
      setPreviewSession(null);

      try {
        let result: PagePreview[] | null = null;

        if (extension === "pdf") {
          result = await buildPdfPreviews(file);
        } else if (OFFICE_DOCUMENT_EXTENSIONS.includes(extension)) {
          const response = await fetch(task.pdfFileUrl as string);
          const pdfBlob = await response.blob();
          result = await buildPdfPreviews(pdfBlob);
        } else if (isPreviewImageExtension(extension)) {
          result = [{ type: "image", src: URL.createObjectURL(file) }];
        }

        if (isCancelled || !result) {
          return;
        }

        setPreviews(result);
        setPreviewSession({
          fileName:
            OFFICE_DOCUMENT_EXTENSIONS.includes(extension) &&
            task.originalFileName
              ? getFileBaseName(task.originalFileName)
              : fileBaseName,
          previews: result,
        });
      } catch (err) {
        if (!isCancelled) {
          console.error(err);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    void loadPreviewFromContext();

    return () => {
      isCancelled = true;
    };
  }, [
    activeRecentFile,
    t,
    task.fileStatus,
    task.originalFileName,
    task.pdfFileUrl,
  ]);

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
        <div className="sticky top-0 z-10 flex items-center gap-2 bg-transparent px-4 py-4 backdrop-blur-xs">
          <button
            className="flex items-center gap-1 text-sm font-semibold text-[#1b1c1c]"
            onClick={() => navigate("/app")}
          >
            <ChevronLeft size={18} />
          </button>
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1b1c1c]">
            {t("preview.title")}
          </h1>
        </div>

        <div className="mx-4 mb-4 rounded-[28px] border border-white/30 bg-white/70 p-4 shadow-[0_8px_32px_rgba(26,35,126,0.05)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 px-2 pb-3">
            <span className="max-w-[60%] truncate text-sm font-semibold text-[#000666]">
              {fileName}
            </span>
            <span className="shrink-0 rounded-full bg-[#e0e0ff]/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] text-[#1a237e]">
              {t("common.pages", { count: totalPages })}
            </span>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto px-2 pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {loading ? (
              <div className="flex h-48 w-36 shrink-0 items-center justify-center rounded-[22px] border border-white/50 bg-white/75">
                <span className="text-xs font-medium text-[#767683]">
                  {t("common.loading")}
                </span>
              </div>
            ) : previews ? (
              previews.map((preview, i) => (
                <div
                  key={i}
                  className="h-48 w-36 shrink-0 overflow-hidden rounded-[12px] border border-black/15 bg-white/85 "
                >
                  <PageCard preview={preview} />
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-36 shrink-0 rounded-[22px] border border-white/50 bg-white/85"
                >
                  <Placeholder />
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-1">
            <div className="mx-auto h-1.5 max-w-25 flex-1 overflow-hidden rounded-full bg-[#d8dcff]">
              <div
                className="h-full w-10 rounded-full bg-gray-800 transition-all duration-150"
                style={{
                  marginLeft: `calc(${scrollProgress} * (100% - 40px))`,
                  background: "linear-gradient(90deg,#1a237e 0%,#4c56af 100%)",
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("/app/full-preview")}
              disabled={!previews?.length}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/50 bg-white/70 text-[#1a237e] shadow-[0_8px_20px_rgba(26,35,126,0.06)] disabled:opacity-40"
            >
              <Scan size={14} />
            </button>
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-[28px] border border-white/30 bg-white/70 p-5 shadow-[0_8px_32px_rgba(26,35,126,0.05)] backdrop-blur-xl">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-4">
              <span className="w-12 shrink-0 text-sm font-semibold text-[#454652]">
                {t("preview.copy")}
              </span>
              <div className="flex h-[46px] w-full items-center justify-between gap-1 rounded-2xl bg-white/35 px-6 py-1.5 backdrop-blur-sm">
                <button
                  onClick={() => setPagesPerSheet((p) => Math.max(1, p - 1))}
                  className="text-lg font-semibold leading-none text-[#1a237e]"
                >
                  -
                </button>
                <span className="w-4 text-center text-lg font-bold leading-none text-[#000666]">
                  {pagesPerSheet}
                </span>
                <button
                  onClick={() => setPagesPerSheet((p) => Math.min(8, p + 1))}
                  className="text-lg font-semibold leading-none text-[#1a237e]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="h-px bg-[#c6c5d4]/50" />

            <div className="flex items-center justify-between gap-4">
              <span className="w-12 shrink-0 text-sm font-semibold text-[#454652]">
                {t("preview.pages")}
              </span>
              <div className="flex w-full gap-1 rounded-2xl bg-white/35 p-1 backdrop-blur-sm">
                <button
                  onClick={() => {
                    setPageMode("custom");
                    setIsPageSheetOpen(true);
                  }}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    pageMode === "custom"
                      ? "bg-white text-[#000666] border border-[#000666]/20  shadow-[0_8px_20px_rgba(26,35,126,0.08)]"
                      : "text-[#767683]"
                  }`}
                >
                  {t("preview.custom")}
                </button>
                <button
                  onClick={() => {
                    setPageMode("all");
                    setIsPageSheetOpen(false);
                  }}
                  className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                    pageMode === "all"
                      ? "bg-white text-[#000666] border border-[#000666]/20  shadow-[0_8px_20px_rgba(26,35,126,0.08)]"
                      : "text-[#767683]"
                  }`}
                >
                  {t("preview.allPages")}
                </button>
              </div>
            </div>

            {pageMode === "custom" && selectedPages.length > 0 && (
              <div className="flex items-center gap-2 rounded-2xl bg-[#e0e0ff]/45 px-4 py-3.5 text-sm text-[#454652]">
                <span className="font-semibold text-[#1a237e]">
                  {t("preview.selected")}
                </span>
                <span className="font-semibold text-[#000666]">
                  {selectedPages.slice(0, 5).join(", ")}
                  {selectedPages.length > 5 ? "..." : ""}
                </span>
              </div>
            )}

            <div className="h-px bg-[#c6c5d4]/50" />

            <div className="flex items-center justify-between gap-4">
              <span className="w-12 shrink-0 text-sm font-semibold text-[#454652]">
                {t("preview.type")}
              </span>
              <ToggleOption
                options={[
                  { value: "Color", label: t("preview.color") },
                  { value: "B&W", label: t("preview.bw") },
                ]}
                active={type}
                onChange={setType}
              />
            </div>

            <div className="h-px bg-[#c6c5d4]/50" />

            <div className="flex items-center justify-between gap-4">
              <span className="w-12 shrink-0 text-sm font-semibold text-[#454652]">
                {t("preview.sides")}
              </span>
              <ToggleOption
                options={[
                  { value: "Both Sides", label: t("preview.bothSides") },
                  { value: "One Side", label: t("preview.oneSide") },
                ]}
                active={sides}
                onChange={setSides}
              />
            </div>
          </div>
        </div>

        <div className="mt-auto px-4 pb-5">
          <div className="rounded-[28px] border border-white/30 bg-white/70 p-5 shadow-[0_8px_32px_rgba(26,35,126,0.05)] backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="mt-0.5 text-[11px] font-medium text-[#767683]">
                  {t("common.pages", { count: selectedPagesCount })}
                </p>
                <p className="text-[32px] font-extrabold tracking-[-0.03em] text-[#000666]">
                  {formatCurrency(totalPrice)}
                </p>
              </div>
              <button
                onClick={() =>
                  navigate("/app/payment-preview", {
                    state: {
                      fileName,
                      totalPages,
                      selectedPagesCount,
                      totalPrice,
                      type,
                      sides,
                      pagesPerSheet,
                    },
                  })
                }
                className="ml-4 max-w-[200px] flex-1 rounded-full bg-[#1a237e] py-3.5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(26,35,126,0.22)] disabled:opacity-50"
                disabled={rangeError !== null && pageMode === "custom"}
              >
                {t("preview.continue")}
              </button>
            </div>
          </div>
        </div>
      </section>

      <SettingsEditorSheet
        isOpen={isPageSheetOpen}
        title={t("preview.selectPages")}
        description={t("preview.totalPages", { count: totalPages })}
        onClose={() => setIsPageSheetOpen(false)}
        onSave={() => setIsPageSheetOpen(false)}
        disabled={rangeError !== null && pageMode === "custom"}
      >
        <div className="flex flex-col gap-3">
          <div className="rounded-[22px] border border-white/40 bg-white/65 p-3.5 shadow-[0_8px_28px_rgba(26,35,126,0.05)] backdrop-blur-sm">
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#767683]">
              {t("preview.methodRange")}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#454652]">
                  {t("preview.from")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="1"
                  value={rangeStart}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      setRangeStart(value);
                      setPageRangeInput("");
                    }
                  }}
                  className="w-full rounded-2xl border border-[#d5d7e2] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,246,255,0.92))] px-4 py-2.5 text-sm font-semibold text-[#000666] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(26,35,126,0.04)] outline-none transition placeholder:text-[#9b9baa] focus:border-[#b7bccf] focus:bg-white focus:shadow-[0_0_0_4px_rgba(189,194,255,0.24)]"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#454652]">
                  {t("preview.to")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={String(totalPages)}
                  value={rangeEnd}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d+$/.test(value)) {
                      setRangeEnd(value);
                      setPageRangeInput("");
                    }
                  }}
                  className="w-full rounded-2xl border border-[#d5d7e2] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,246,255,0.92))] px-4 py-2.5 text-sm font-semibold text-[#000666] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(26,35,126,0.04)] outline-none transition placeholder:text-[#9b9baa] focus:border-[#b7bccf] focus:bg-white focus:shadow-[0_0_0_4px_rgba(189,194,255,0.24)]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/40 bg-white/65 p-3.5 shadow-[0_8px_28px_rgba(26,35,126,0.05)] backdrop-blur-sm">
            <label className="mb-2.5 block text-[11px] font-bold uppercase tracking-[0.12em] text-[#767683]">
              {t("preview.methodCustom")}
            </label>
            <input
              type="text"
              placeholder={t("preview.customPlaceholder")}
              value={pageRangeInput}
              onChange={(e) => setPageRangeInput(e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_20px_rgba(26,35,126,0.04)] outline-none transition placeholder:text-[#9b9baa] ${
                rangeError && pageRangeInput.trim()
                  ? "border-[#f1b7bd] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(255,244,245,0.96))] text-[#8f2332] focus:border-[#e1828d] focus:bg-white focus:shadow-[0_0_0_4px_rgba(241,183,189,0.28)]"
                  : "border-[#d5d7e2] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(245,246,255,0.92))] text-[#000666] focus:border-[#b7bccf] focus:bg-white focus:shadow-[0_0_0_4px_rgba(189,194,255,0.24)]"
              }`}
            />
            <p className="mt-1.5 text-[11px] leading-4.5 text-[#767683]">
              {t("preview.customHelper")}
            </p>
          </div>

          {rangeError && (
            <div className="flex items-start gap-2.5 rounded-[20px] border border-[#f3c6cb] bg-[linear-gradient(180deg,rgba(255,247,248,0.96),rgba(255,239,242,0.92))] p-3.5 shadow-[0_8px_24px_rgba(143,35,50,0.08)]">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#fff1f3] text-[#c73c4f]">
                <AlertCircle size={14} />
              </div>
              <p className="pt-0.5 text-sm font-medium leading-5 text-[#8f2332]">
                {rangeError}
              </p>
            </div>
          )}

          {!rangeError && selectedPages.length > 0 && (
            <div className="rounded-[20px] border border-[#c7e8d6] bg-[linear-gradient(180deg,rgba(244,255,249,0.96),rgba(233,250,240,0.94))] p-3.5 shadow-[0_8px_24px_rgba(0,104,118,0.08)]">
              <p className="text-sm font-semibold text-[#006876]">
                {t("preview.selected")}{" "}
                <span className="font-bold">
                  {t("common.pages", { count: selectedPagesCount })}
                </span>
              </p>
              <p className="mt-1 text-[11px] leading-4.5 text-[#2d5f57]">
                {selectedPages.slice(0, 10).join(", ")}
                {selectedPages.length > 10 ? "..." : ""}
              </p>
            </div>
          )}
        </div>
      </SettingsEditorSheet>
    </MobileShell>
  );
}
