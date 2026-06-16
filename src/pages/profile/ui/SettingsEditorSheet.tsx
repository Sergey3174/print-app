import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const SHEET_ANIMATION_MS = 300;

type SettingsEditorSheetProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  onSave?: () => void;
  disabled?: boolean;
  showActionButtons?: boolean;
  showCloseButton?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
};

export function SettingsEditorSheet({
  isOpen,
  title = "Edit setting",
  description,
  children,
  onClose,
  onSave,
  disabled = false,
  showActionButtons = true,
  showCloseButton = false,
  saveLabel = "Save",
  cancelLabel = "Cancel",
}: SettingsEditorSheetProps) {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      return;
    }

    setIsVisible(false);

    const timeoutId = window.setTimeout(() => {
      setShouldRender(false);
    }, SHEET_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!shouldRender) {
      setIsVisible(false);
      return;
    }

    if (!isOpen) {
      return;
    }

    let secondFrameId = 0;
    const firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        setIsVisible(true);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      if (secondFrameId) {
        window.cancelAnimationFrame(secondFrameId);
      }
    };
  }, [isOpen, shouldRender]);

  useEffect(() => {
    if (!shouldRender) {
      return;
    }

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [shouldRender]);

  if (!shouldRender) {
    return null;
  }

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-20 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${
          isVisible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-[28px] border-t border-[#e4e2e1] bg-[#fbf9f8] px-4 pb-6 pt-3 transition-transform duration-300 shadow-[0_-4px_12px_rgba(26,35,126,0.08)] sm:left-1/2 sm:max-w-md sm:-translate-x-1/2 sm:rounded-[28px] ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pb-1 sm:hidden">
          <div className="h-1 w-8 rounded-full bg-[#c6c5d4]" />
        </div>

        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#1b1c1c]">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[#454652]">{description}</p>
            )}
          </div>

          {showCloseButton ? (
            <button
              type="button"
              className="rounded-full p-2 text-[#454652] transition hover:bg-[#f0eded]"
              onClick={onClose}
              aria-label="Close sheet"
            >
              <X size={20} />
            </button>
          ) : null}
        </div>

        {children}

        {showActionButtons ? (
          <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
            <button
              type="button"
              className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              onClick={onClose}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(17,24,39,0.2)] transition hover:bg-black disabled:opacity-40"
              onClick={onSave}
              disabled={disabled}
            >
              {saveLabel}
            </button>
          </div>
        ) : null}
      </div>
    </>,
    document.body,
  );
}
