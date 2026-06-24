import * as pdfjs from "pdfjs-dist";
import type { PagePreview } from "../previewSession";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDF_RENDER_SCALE = 2;

export async function buildPdfPreviews(
  source: Blob | ArrayBuffer,
): Promise<PagePreview[]> {
  const buffer =
    source instanceof ArrayBuffer ? source : await source.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const result: PagePreview[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d")!;

    await page.render({ canvas, canvasContext: ctx, viewport }).promise;
    result.push({ type: "image", src: canvas.toDataURL() });
  }

  return result;
}
