// import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

const SHEET_ANIMATION_MS = 300;

type SettingsEditorSheetProps = {
  isOpen: boolean;
  title?: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  onSave: () => void;
  disabled?: boolean;
};

export function SettingsEditorSheet({
  isOpen,
  title = "Edit setting",
  description,
  children,
  onClose,
  onSave,
  disabled = false,
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
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-[18px] border-t border-gray-200 bg-[linear-gradient(180deg,#ffffff_0%,#f7f7f7_100%)] px-5 pb-8 pt-4 transition-transform duration-300 shadow-[0_-20px_45px_rgba(15,23,42,0.16)] ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          {/* <button
            type="button"
            className="rounded-full border border-gray-200 bg-white p-2 text-gray-500 transition hover:bg-gray-50"
            onClick={onClose}
          >
            <X size={18} />
          </button> */}
        </div>

        {children}

        <div className="mt-6 flex gap-3 border-t border-gray-200 pt-4">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            onClick={onClose}
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-gray-900 px-4 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(17,24,39,0.2)] transition hover:bg-black disabled:opacity-40"
            onClick={onSave}
            disabled={disabled}
          >
            Save
          </button>
        </div>
      </div>
    </>,
    document.body,
  );
}
