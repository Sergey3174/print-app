import { useEffect, useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
      className="relative h-full w-full overflow-hidden bg-[#f7f7ff]"
    />
  );
}

function FullPreviewCard({ preview }: { preview: PagePreview }) {
  if (preview.type === "image") {
    return (
      <img
        src={preview.src}
        alt="full preview"
        className="h-full w-full object-contain bg-[#f7f7ff]"
      />
    );
  }

  return <FullDocxPage node={preview.node} />;
}

export function FullPreview() {
  const { t } = useTranslation();
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
        <section className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              className="flex items-center gap-1 text-sm font-semibold text-[#1b1c1c]"
              onClick={() => navigate("/app/preview")}
            >
              <ChevronLeft size={18} /> {t("common.back")}
            </button>
          </div>
          <div className="flex flex-1 items-center justify-center px-6 text-center text-sm text-[#767683]">
            {t("preview.noPreviewData")}
          </div>
        </section>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <section className="flex min-h-0 flex-1 flex-col overflow-x-hidden bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
        <div className="sticky top-0 z-10 overflow-hidden px-4 py-4 backdrop-blur-md">
          <div className="flex w-full min-w-0 items-center gap-2 overflow-hidden">
            <button
              className="flex  shrink-0 items-center justify-center text-[#1b1c1c]"
              onClick={() => navigate("/app/preview")}
              aria-label={t("common.back")}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="min-w-0 flex-1 overflow-hidden">
              <span className="block truncate text-left text-[20px] font-semibold tracking-[-0.01em] text-[#1b1c1c]">
                {session.fileName}
              </span>
            </div>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 snap-y snap-mandatory overflow-x-hidden overflow-y-auto px-4 py-3"
        >
          <div className="mx-auto flex w-full min-w-0 max-w-[430px] flex-col gap-4">
            {session.previews.map((preview, index) => (
              <div
                key={index}
                data-preview-page
                className="snap-start rounded-[22px] border border-white/30 bg-white/70 p-3 shadow-[0_10px_32px_rgba(26,35,126,0.08)] backdrop-blur-xl"
              >
                <div
                  className="w-full overflow-hidden rounded-[16px] bg-white shadow-[inset_0_0_0_1px_rgba(26,35,126,0.04)]"
                  style={{ aspectRatio: `${A4_RATIO}` }}
                >
                  <FullPreviewCard preview={preview} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center justify-between rounded-[22px] border border-white/30 bg-white/70 px-4 py-3 text-sm font-medium text-[#454652] shadow-[0_8px_32px_rgba(26,35,126,0.05)] backdrop-blur-xl">
            <span>
              {currentIndex + 1} / {session.previews.length}
            </span>
            <button
              type="button"
              onClick={() => navigate("/app/preview")}
              className="rounded-full bg-[#1a237e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(26,35,126,0.18)]"
            >
              {t("preview.fullPreviewCta")}
            </button>
          </div>
        </div>
      </section>
    </MobileShell>
  );
}
