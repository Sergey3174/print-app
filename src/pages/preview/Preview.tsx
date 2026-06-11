import { useState, useRef, useEffect, useMemo } from "react";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import { ChevronLeft, Plus, Scan, AlertCircle } from "lucide-react";
import { SettingsEditorSheet } from "../../pages/profile/ui/SettingsEditorSheet";
import { parsePages } from "./parsePages";
import * as pdfjs from "pdfjs-dist";
import mammoth from "mammoth";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

// ==================== COMPONENT TYPES ====================

type PagePreview =
  | { type: "image"; src: string }
  | { type: "html"; html: string };

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
    <div className="flex gap-1 bg-gray-100 w-full rounded-xl p-1">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 rounded-lg flex-1 text-sm font-medium transition-colors ${
            active === opt ? "bg-white text-black shadow-sm" : "text-gray-400"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function PageCard({ preview }: { preview: PagePreview }) {
  if (preview.type === "image") {
    return (
      <img
        src={preview.src}
        className="w-full h-full object-cover rounded-lg"
        alt="page"
      />
    );
  }
  return (
    <div
      className="w-full h-full overflow-hidden rounded-lg bg-white p-1.5"
      style={{ fontSize: 4, lineHeight: 1.4 }}
      dangerouslySetInnerHTML={{ __html: preview.html }}
    />
  );
}

function Placeholder() {
  return (
    <div className="w-full h-full p-2 flex flex-col gap-1">
      <div className="h-2 w-3/4 bg-gray-200 rounded" />
      <div className="h-1.5 w-1/2 bg-gray-100 rounded" />
      <div className="flex-1 bg-gray-100 rounded mt-1" />
      <div className="h-1.5 w-full bg-gray-100 rounded" />
      <div className="h-1.5 w-4/5 bg-gray-100 rounded" />
    </div>
  );
}

export function Preview() {
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalPages = previews?.length ?? 3;
  const pricePerPage = 2;

  // ==================== COMPUTED VALUES ====================

  const selectedPages = useMemo(() => {
    if (pageMode === "all") {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Try parsing custom input first
    if (pageRangeInput.trim()) {
      const parsed = parsePages(pageRangeInput, totalPages);
      if (parsed) return parsed;
      return [];
    }

    // Fallback to range inputs
    if (!rangeStart || !rangeEnd) return [];
    
    const start = parseInt(rangeStart);
    const end = parseInt(rangeEnd);
    
    if (isNaN(start) || isNaN(end) || start > end) return [];
    
    return Array.from(
      { length: end - start + 1 },
      (_, i) => start + i,
    );
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
      // If both empty, return error
      if (!rangeStart && !rangeEnd) {
        return "Please enter a page range";
      }
      
      // If only one is empty
      if (!rangeStart || !rangeEnd) {
        return "Please fill both From and To fields";
      }
      
      const start = parseInt(rangeStart);
      const end = parseInt(rangeEnd);
      
      // Validate ranges
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

  // ==================== EVENT HANDLERS ====================

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const progress = el.scrollLeft / (el.scrollWidth - el.clientWidth);
    setScrollProgress(isNaN(progress) ? 0 : progress);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name.replace(/\.[^.]+$/, ""));
    setLoading(true);
    setPreviews(null);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buffer }).promise;
        const result: PagePreview[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.5 });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport }).promise;
          result.push({ type: "image", src: canvas.toDataURL() });
        }
        setPreviews(result);
      } else if (ext === "docx") {
        const buffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({
          arrayBuffer: buffer,
        });
        const chunkSize = 2000;
        const chunks: PagePreview[] = [];
        for (let i = 0; i < html.length; i += chunkSize) {
          chunks.push({ type: "html", html: html.slice(i, i + chunkSize) });
        }
        const finalChunks = chunks.length ? chunks : [{ type: "html", html }];
        setPreviews(finalChunks);
      } else if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext ?? "")) {
        const src = URL.createObjectURL(file);
        setPreviews([{ type: "image", src }]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col overflow-auto bg-white">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-800">
            <ChevronLeft size={18} /> Printing Preview
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-800"
          >
            <Plus size={16} /> Add File
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,image/*"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        <div className="my-2 mx-3 border border-gray-300 rounded-xl">
          {/* Document title + pages */}
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-sm font-medium text-gray-900 truncate max-w-[60%]">
              {fileName}
            </span>
            <span className="text-sm font-bold text-gray-900 shrink-0">
              {totalPages} Pages
            </span>
          </div>

          {/* Page previews */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 px-4 overflow-x-auto pb-3"
            style={{ scrollbarWidth: "none" }}
          >
            {loading ? (
              <div className="shrink-0 w-36 h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xs text-gray-400">Loading...</span>
              </div>
            ) : previews ? (
              previews.map((preview, i) => (
                <div
                  key={i}
                  className="shrink-0 w-36 h-48 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                >
                  <PageCard preview={preview} />
                </div>
              ))
            ) : (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="shrink-0 w-36 h-48 bg-gray-50 border border-gray-200 rounded-lg"
                >
                  <Placeholder />
                </div>
              ))
            )}
          </div>

          {/* Scroll indicator */}
          <div className="flex items-center justify-between px-4 pb-2 gap-3">
            <div className="flex-1 max-w-25 h-1 mx-auto bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full w-10 bg-gray-800 rounded-full transition-all duration-150"
                style={{
                  marginLeft: `calc(${scrollProgress} * (100% - 40px))`,
                }}
              />
            </div>
            <button className="w-8 h-8 shrink-0 rounded-full border border-gray-200 flex items-center justify-center text-gray-500">
              <Scan size={14} />
            </button>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-4" />

        {/* Options */}
        <div className="flex flex-col divide-y divide-gray-100 px-4">
          <div className="flex items-center gap-4 justify-between py-3.5">
            <span className="text-sm text-gray-500 w-30 shrink-0">Copy</span>
            <div className="flex gap-1 px-6 h-[44px] py-1.5 items-center justify-between bg-gray-100 w-full rounded-xl p-1">
              <button
                onClick={() => setPagesPerSheet((p) => Math.max(1, p - 1))}
                className="text-gray-800 text-lg font-semibold leading-none"
              >
                −
              </button>
              <span className="font-semibold w-4 text-lg text-center leading-none">
                {pagesPerSheet}
              </span>
              <button
                onClick={() => setPagesPerSheet((p) => Math.min(8, p + 1))}
                className="text-gray-800 text-lg font-semibold leading-none"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-between py-3">
            <span className="text-sm text-gray-500 shrink-0 w-30">Pages</span>
            <div className="flex gap-1 bg-gray-100 w-full rounded-xl p-1">
              <button
                onClick={() => {
                  setPageMode("custom");
                  setIsPageSheetOpen(true);
                }}
                className={`px-4 py-1.5 rounded-lg flex-1 text-sm font-medium transition-colors ${
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
                className={`px-4 py-1.5 rounded-lg flex-1 text-sm font-medium transition-colors ${
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
            <div className="flex items-center gap-2 px-4 py-2 text-xs text-gray-600 bg-blue-50 rounded-lg mx-4 -mt-2">
              <span className="font-medium">Selected:</span>
              <span className="font-semibold text-gray-900">
                {selectedPages.slice(0, 5).join(", ")}
                {selectedPages.length > 5 ? "..." : ""}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 justify-between py-3">
            <span className="text-sm text-gray-500 shrink-0 w-30">Type</span>
            <ToggleOption
              options={["Color", "B&W"]}
              active={type}
              onChange={setType}
            />
          </div>

          <div className="flex items-center gap-4 justify-between py-3">
            <span className="text-sm text-gray-500 shrink-0 w-30">Sides</span>
            <ToggleOption
              options={["Both Sides", "One Side"]}
              active={sides}
              onChange={setSides}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto px-4 pt-3 pb-5 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-gray-400">
              (Rs {pricePerPage} / Pg)
            </p>
            <p className="text-xl font-semibold text-gray-900">$ {totalPrice}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {selectedPagesCount} page{selectedPagesCount !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() =>
              alert(
                `Печать: ${selectedPagesCount} стр., ${type}, ${sides}, ${pagesPerSheet} на листе\nСтраницы: ${selectedPages.join(", ")}`,
              )
            }
            className="flex-1 ml-4 bg-gray-900 text-white rounded-full py-3.5 text-sm font-semibold disabled:opacity-50"
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
        onSave={() => {
          setIsPageSheetOpen(false);
        }}
        disabled={rangeError !== null && pageMode === "custom"}
      >
        <div className="flex flex-col gap-4">
          {/* Custom Range Options */}
          <div className="flex flex-col gap-4">
              {/* Option 1: Range Inputs */}
              <div className="border-b border-gray-200 pb-4">
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-3">
                  Method 1: Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      From
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1"
                      value={rangeStart}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits
                        if (value === "" || /^\d+$/.test(value)) {
                          setRangeStart(value);
                          setPageRangeInput("");
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      To
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder={String(totalPages)}
                      value={rangeEnd}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow only digits
                        if (value === "" || /^\d+$/.test(value)) {
                          setRangeEnd(value);
                          setPageRangeInput("");
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Option 2: Custom Format */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-3">
                  Method 2: Custom Format
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1-5, 1-5,8, 1-5,8,10-12"
                  value={pageRangeInput}
                  onChange={(e) => {
                    setPageRangeInput(e.target.value);
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm font-medium focus:outline-none focus:ring-2 ${
                    rangeError && pageRangeInput.trim()
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Separated by commas. Use hyphens for ranges (e.g., 1-3).
                </p>
              </div>

              {/* Error Message */}
              {rangeError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={16} />
                  <p className="text-sm text-red-900">{rangeError}</p>
                </div>
              )}

              {/* Selection Summary */}
              {!rangeError && selectedPages.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <p className="text-sm font-medium text-green-900">
                    Selected: <span className="font-bold">{selectedPagesCount}</span> page
                    {selectedPagesCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-green-800 mt-1">
                    {selectedPages.slice(0, 10).join(", ")}
                    {selectedPages.length > 10 ? "..." : ""}
                  </p>
                </div>
              )}
            </div>
        </div>
      </SettingsEditorSheet>
    </MobileShell>
  );
}
