import { renderAsync } from "docx-preview";

const DOCX_DEFAULT_PAGE_HEIGHT = 1123;
const DOCX_PAGE_WIDTH = 794;

export async function getDocxPageCount(file: File) {
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
      return renderedPages.length;
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

    return Math.max(1, Math.ceil(totalContentHeight / visiblePageHeight));
  } finally {
    document.body.removeChild(container);
  }
}
