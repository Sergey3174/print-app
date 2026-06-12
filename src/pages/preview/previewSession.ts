export type PagePreview =
  | { type: "image"; src: string }
  | { type: "docx-node"; node: HTMLElement };

export type PreviewSessionData = {
  fileName: string;
  previews: PagePreview[];
};

let previewSession: PreviewSessionData | null = null;

export function setPreviewSession(data: PreviewSessionData | null) {
  previewSession = data;
}

export function getPreviewSession() {
  return previewSession;
}
