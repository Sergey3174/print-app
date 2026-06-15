import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MobileShell } from "../../widgets/mobile-shell/ui/MobileShell";
import { getPreviewSession, type PagePreview } from "./previewSession";

const DOCX_PAGE_WIDTH = 794;
const A4_RATIO = 210 / 297;

function FullDocxPage({ node }: { node: HTMLElement }) {
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frameRef.current) return;

    const frame = frameRef.current;
    frame.innerHTML = "";

    const clone = node.cloneNode(true) as HTMLElement;
    clone.style.pointerEvents = "none";
    clone.style.position = "absolute";
    clone.style.top = "0";
    clone.style.left = "0";
    clone.style.transformOrigin = "top left";
    frame.appendChild(clone);

    const applyScale = () => {
      const pageHeight = node.clientHeight || 1123;
      const containerW = frame.clientWidth;
      const containerH = frame.clientHeight;
      const scale = Math.min(
        containerW / DOCX_PAGE_WIDTH,
        containerH / pageHeight,
      );
      const scaledW = DOCX_PAGE_WIDTH * scale;
      const scaledH = pageHeight * scale;
      const offsetX = (containerW - scaledW) / 2;
      const offsetY = Math.max(0, (containerH - scaledH) / 2);

      clone.style.width = `${DOCX_PAGE_WIDTH}px`;
      clone.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
    };

    applyScale();

    const observer = new ResizeObserver(() => {
      applyScale();
    });
    observer.observe(frame);

    return () => {
      observer.disconnect();
    };
  }, [node]);

  return (
    <div
      ref={frameRef}
      className="relative h-full w-full overflow-hidden bg-[#f3f3f3]"
    />
  );
}

function FullPreviewCard({ preview }: { preview: PagePreview }) {
  if (preview.type === "image") {
    return (
      <img
        src={preview.src}
        alt="full preview"
        className="h-full w-full object-contain bg-[#f3f3f3]"
      />
    );
  }

  return <FullDocxPage node={preview.node} />;
}

export function FullPreview() {
  const navigate = useNavigate();
  const session = getPreviewSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const handleScroll = () => {
      const items = Array.from(
        container.querySelectorAll<HTMLElement>("[data-preview-page]"),
      );
      if (!items.length) return;

      const containerTop = container.getBoundingClientRect().top;
      let closestIndex = 0;
      let closestDistance = Number.POSITIVE_INFINITY;

      items.forEach((item, index) => {
        const distance = Math.abs(
          item.getBoundingClientRect().top - containerTop,
        );
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = index;
        }
      });

      setCurrentIndex(closestIndex);
    };

    handleScroll();
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [session]);

  if (!session || !session.previews.length) {
    return (
      <MobileShell>
        <section className="flex min-h-0 flex-1 flex-col bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
            <button
              className="flex items-center gap-1 text-sm font-medium text-gray-800"
              onClick={() => navigate("/app/preview")}
            >
              <ChevronLeft size={18} /> Back
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-gray-500">
            No preview data yet. Open a document in Printing Preview first.
          </div>
        </section>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-4">
          <button
            className="flex min-w-0 items-center gap-1 text-sm font-medium text-gray-800"
            onClick={() => navigate("/app/preview")}
          >
            <ChevronLeft size={18} className="shrink-0" />
            <span className="min-w-0 break-all text-left">
              {session.fileName}
            </span>
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 snap-y snap-mandatory overflow-y-auto px-3 py-3"
        >
          <div className="mx-auto flex w-full max-w-[430px] flex-col gap-4">
            {session.previews.map((preview, index) => (
              <div
                key={index}
                data-preview-page
                className="snap-start rounded-[28px] border border-gray-200 bg-[#ececec] p-2 shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
              >
                <div
                  className="w-full overflow-hidden rounded-[22px] bg-white"
                  style={{ aspectRatio: `${A4_RATIO}` }}
                >
                  <FullPreviewCard preview={preview} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-600">
          <span>
            {currentIndex + 1} / {session.previews.length}
          </span>
          <button
            type="button"
            onClick={() => navigate("/app/preview")}
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
          >
            View Printing Options
          </button>
        </div>
      </section>
    </MobileShell>
  );
}
