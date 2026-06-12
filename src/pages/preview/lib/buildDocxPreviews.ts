import { renderAsync } from "docx-preview";
import type { PagePreview } from "../previewSession";

const DOCX_PAGE_WIDTH = 794;
const DOCX_DEFAULT_PAGE_HEIGHT = 1123;

function createDocxPageNode(content: HTMLElement, pageHeight: number) {
  const wrapper = document.createElement("div");
  wrapper.style.cssText = [
    `width:${DOCX_PAGE_WIDTH}px`,
    `height:${pageHeight}px`,
    "overflow:hidden",
    "position:relative",
    "flex-shrink:0",
    "background:white",
  ].join(";");

  const clone = content.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.left = "0";
  clone.style.top = "0";
  clone.style.width = `${DOCX_PAGE_WIDTH}px`;
  clone.style.margin = "0";
  clone.style.background = "white";
  clone.style.boxShadow = "none";

  wrapper.appendChild(clone);
  return wrapper;
}

export async function buildDocxPreviews(
  file: File,
): Promise<PagePreview[]> {
  const buffer = await file.arrayBuffer();
  const container = document.createElement("div");
  container.style.cssText = [
    "position:fixed",
    "top:-10000px",
    "left:-10000px",
    `width:${DOCX_PAGE_WIDTH}px`,
    "pointer-events:none",
    "opacity:0",
    "background:white",
  ].join(";");
  document.body.appendChild(container);

  try {
    await renderAsync(new Uint8Array(buffer), container, undefined, {
      inWrapper: true,
      ignoreWidth: false,
      ignoreHeight: false,
      breakPages: true,
      ignoreLastRenderedPageBreak: false,
      useBase64URL: true,
    });

    await new Promise((resolve) => window.setTimeout(resolve, 150));

    const renderedPages = Array.from(
      container.querySelectorAll<HTMLElement>("section.docx"),
    );

    if (renderedPages.length > 1) {
      return renderedPages.map((page) => ({
        type: "docx-node",
        node: createDocxPageNode(
          page,
          Math.max(page.clientHeight, DOCX_DEFAULT_PAGE_HEIGHT),
        ),
      }));
    }

    const fullDocument =
      renderedPages[0] ??
      container.querySelector<HTMLElement>(".docx") ??
      container;

    const visiblePageHeight =
      fullDocument.clientHeight || DOCX_DEFAULT_PAGE_HEIGHT;
    const totalContentHeight =
      fullDocument.scrollHeight ||
      visiblePageHeight ||
      DOCX_DEFAULT_PAGE_HEIGHT;
    const pageCount = Math.max(
      1,
      Math.ceil(totalContentHeight / visiblePageHeight),
    );

    return Array.from({ length: pageCount }, (_, index) => {
      const wrapper = createDocxPageNode(fullDocument, visiblePageHeight);
      const inner = wrapper.firstElementChild as HTMLElement | null;

      if (inner) {
        inner.style.top = `-${index * visiblePageHeight}px`;
      }

      return { type: "docx-node", node: wrapper };
    });
  } finally {
    document.body.removeChild(container);
  }
}
