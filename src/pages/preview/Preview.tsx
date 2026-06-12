import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, Scan, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import { SettingsEditorSheet } from "../../pages/profile/ui/SettingsEditorSheet";
import { getFileBaseName } from "../../shared/lib/file/getFileBaseName";
import { getFileExtension } from "../../shared/lib/file/getFileExtension";
import { useRecentFiles } from "../../widgets/app-layout/model/recentFilesContext";
import { parsePages } from "./parsePages";
import { setPreviewSession, type PagePreview } from "./previewSession";
import { buildDocxPreviews } from "./lib/buildDocxPreviews";
import { buildPdfPreviews } from "./lib/buildPdfPreviews";
import { isPreviewImageExtension } from "./lib/isPreviewImageExtension";

const DOCX_PAGE_WIDTH = 794;
const DOCX_DEFAULT_PAGE_HEIGHT = 1123;

function ToggleOption({
  options,
  active,
  onChange,
}: {
  options: string[];
  active: string;
  onChange: (val: string) => void;
}) {
  return (
    <div className="flex w-full gap-1 rounded-xl bg-gray-100 p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            active === opt ? "bg-white text-black shadow-sm" : "text-gray-400"
          }`}
        >
          {opt}
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
      className="relative h-full w-full overflow-hidden rounded-lg bg-white"
    />
  );
}

function PageCard({ preview }: { preview: PagePreview }) {
  if (preview.type === "image") {
    return (
      <img
        src={preview.src}
        className="h-full w-full rounded-lg object-contain bg-white"
        alt="page"
      />
    );
  }

  return <DocxPageCard node={preview.node} />;
}

function Placeholder() {
  return (
    <div className="flex h-full w-full flex-col gap-1 p-2">
      <div className="h-2 w-3/4 rounded bg-gray-200" />
      <div className="h-1.5 w-1/2 rounded bg-gray-100" />
      <div className="mt-1 flex-1 rounded bg-gray-100" />
      <div className="h-1.5 w-full rounded bg-gray-100" />
      <div className="h-1.5 w-4/5 rounded bg-gray-100" />
    </div>
  );
}

export function Preview() {
  const { activeRecentFile } = useRecentFiles();
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

  const totalPages = previews?.length ?? activeRecentFile?.pages ?? 0;
  const pricePerPage = 2;

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

  const rangeError = useMemo(() => {
    if (pageMode === "all") return null;

    if (pageRangeInput.trim()) {
      const parsed = parsePages(pageRangeInput, totalPages);
      if (parsed === null) {
        return "Invalid format. Use: 1-5, 1-5,8, or 1-5,8,10-12";
      }
      if (parsed.length === 0) {
        return "No valid pages in range";
      }
    } else {
      if (!rangeStart && !rangeEnd) {
        return "Please enter a page range";
      }
      if (!rangeStart || !rangeEnd) {
        return "Please fill both From and To fields";
      }

      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);

      if (start < 1 || start > totalPages) {
        return `Start page must be between 1 and ${totalPages}`;
      }
      if (end < 1 || end > totalPages) {
        return `End page must be between 1 and ${totalPages}`;
      }
      if (start > end) {
        return "Start page must be less than or equal to end page";
      }
    }

    return null;
  }, [pageMode, pageRangeInput, rangeStart, rangeEnd, totalPages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollProgress(isNaN(progress) ? 0 : progress);
  };

  useEffect(() => {
    let isCancelled = false;

    async function loadPreviewFromContext() {
      if (!activeRecentFile) {
        setFileName("No file selected");
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

      setLoading(true);
      setPreviews(null);
      setPreviewSession(null);

      try {
        let result: PagePreview[] | null = null;

        if (extension === "pdf") {
          result = await buildPdfPreviews(file);
        } else if (extension === "docx") {
          result = await buildDocxPreviews(file);
        } else if (isPreviewImageExtension(extension)) {
          result = [{ type: "image", src: URL.createObjectURL(file) }];
        }

        if (isCancelled || !result) {
          return;
        }

        setPreviews(result);
        setPreviewSession({
          fileName: fileBaseName,
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
  }, [activeRecentFile]);

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <button
            className="flex items-center gap-1 text-sm font-medium text-gray-800"
            onClick={() => navigate("/app")}
          >
            <ChevronLeft size={18} /> Printing Preview
          </button>
          <div className="w-[76px]" />
        </div>

        <div className="mx-3 my-2 rounded-xl border border-gray-300">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="max-w-[60%] truncate text-sm font-medium text-gray-900">
              {fileName}
            </span>
            <span className="shrink-0 text-sm font-bold text-gray-900">
              {totalPages} Pages
            </span>
          </div>

          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto px-4 pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {loading ? (
              <div className="flex h-48 w-36 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : previews ? (
              previews.map((preview, i) => (
                <div
                  key={i}
                  className="h-48 w-36 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
                >
                  <PageCard preview={preview} />
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 w-36 shrink-0 rounded-lg border border-gray-200 bg-gray-50"
                >
                  <Placeholder />
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between gap-3 px-4 pb-2">
            <div className="mx-auto h-1 max-w-25 flex-1 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full w-10 rounded-full bg-gray-800 transition-all duration-150"
                style={{
                  marginLeft: `calc(${scrollProgress} * (100% - 40px))`,
                }}
              />
            </div>
            <button
              type="button"
              onClick={() => navigate("/app/full-preview")}
              disabled={!previews?.length}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 disabled:opacity-40"
            >
              <Scan size={14} />
            </button>
          </div>
        </div>

        <div className="mx-4 h-px bg-gray-100" />

        <div className="flex flex-col divide-y divide-gray-100 px-4">
          <div className="flex items-center justify-between gap-4 py-3.5">
            <span className="w-30 shrink-0 text-sm text-gray-500">Copy</span>
            <div className="flex h-[44px] w-full items-center justify-between gap-1 rounded-xl bg-gray-100 px-6 py-1.5 p-1">
              <button
                onClick={() => setPagesPerSheet((p) => Math.max(1, p - 1))}
                className="text-lg font-semibold leading-none text-gray-800"
              >
                -
              </button>
              <span className="w-4 text-center text-lg font-semibold leading-none">
                {pagesPerSheet}
              </span>
              <button
                onClick={() => setPagesPerSheet((p) => Math.min(8, p + 1))}
                className="text-lg font-semibold leading-none text-gray-800"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <span className="w-30 shrink-0 text-sm text-gray-500">Pages</span>
            <div className="flex w-full gap-1 rounded-xl bg-gray-100 p-1">
              <button
                onClick={() => {
                  setPageMode("custom");
                  setIsPageSheetOpen(true);
                }}
                className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  pageMode === "custom"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400"
                }`}
              >
                Custom
              </button>
              <button
                onClick={() => {
                  setPageMode("all");
                  setIsPageSheetOpen(false);
                }}
                className={`flex-1 rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                  pageMode === "all"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray-400"
                }`}
              >
                All Pages
              </button>
            </div>
          </div>

          {pageMode === "custom" && selectedPages.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-xs text-gray-600">
              <span className="font-medium">Selected:</span>
              <span className="font-semibold text-gray-900">
                {selectedPages.slice(0, 5).join(", ")}
                {selectedPages.length > 5 ? "..." : ""}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 py-3">
            <span className="w-30 shrink-0 text-sm text-gray-500">Type</span>
            <ToggleOption
              options={["Color", "B&W"]}
              active={type}
              onChange={setType}
            />
          </div>

          <div className="flex items-center justify-between gap-4 py-3">
            <span className="w-30 shrink-0 text-sm text-gray-500">Sides</span>
            <ToggleOption
              options={["Both Sides", "One Side"]}
              active={sides}
              onChange={setSides}
            />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between px-4 pb-5 pt-3">
          <div>
            <p className="text-[10px] text-gray-400">
              (Rs {pricePerPage} / Pg)
            </p>
            <p className="text-xl font-semibold text-gray-900">
              $ {totalPrice}
            </p>
            <p className="mt-0.5 text-[10px] text-gray-400">
              {selectedPagesCount} page{selectedPagesCount !== 1 ? "s" : ""}
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
            className="ml-4 max-w-[200px] flex-1 rounded-full bg-gray-900 py-3.5 text-sm font-semibold text-white disabled:opacity-50"
            disabled={rangeError !== null && pageMode === "custom"}
          >
            Continue
          </button>
        </div>
      </section>

      <SettingsEditorSheet
        isOpen={isPageSheetOpen}
        title="Select Pages"
        description={`Total pages: ${totalPages}`}
        onClose={() => setIsPageSheetOpen(false)}
        onSave={() => setIsPageSheetOpen(false)}
        disabled={rangeError !== null && pageMode === "custom"}
      >
        <div className="flex flex-col gap-4">
          <div className="border-b border-gray-200 pb-4">
            <label className="mb-3 block text-xs font-semibold uppercase text-gray-600">
              Method 1: Range
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  From
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-900">
                  To
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-xs font-semibold uppercase text-gray-600">
              Method 2: Custom Format
            </label>
            <input
              type="text"
              placeholder="e.g., 1-5, 1-5,8, 1-5,8,10-12"
              value={pageRangeInput}
              onChange={(e) => setPageRangeInput(e.target.value)}
              className={`w-full rounded-lg border px-3 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 ${
                rangeError && pageRangeInput.trim()
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
            />
            <p className="mt-2 text-xs text-gray-500">
              Separated by commas. Use hyphens for ranges (e.g., 1-3).
            </p>
          </div>

          {rangeError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
              <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
              <p className="text-sm text-red-900">{rangeError}</p>
            </div>
          )}

          {!rangeError && selectedPages.length > 0 && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-900">
                Selected:{" "}
                <span className="font-bold">{selectedPagesCount}</span> page
                {selectedPagesCount !== 1 ? "s" : ""}
              </p>
              <p className="mt-1 text-xs text-green-800">
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
