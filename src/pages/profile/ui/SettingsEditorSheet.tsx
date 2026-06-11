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
        className={`fixed inset-0 z-20 bg-[#0F2E46]/35 transition-opacity duration-300 ${
          isVisible
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-[32px] bg-white px-5 pb-8 pt-4 transition-transform duration-300 shadow-[0_-18px_48px_rgba(22,71,107,0.28)] ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-[#183C59]">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-[#7A97AF]">{description}</p>
            )}
          </div>
          <button
            type="button"
            className="rounded-full bg-[#EEF7FD] p-2 text-[#5D7890]"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {children}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-[#D8E5EF] px-4 py-3 font-semibold text-[#5D7890]"
            onClick={onClose}
            disabled={disabled}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`flex-1 rounded-2xl bg-[#0F9BFF] px-4 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(15,155,255,0.28)] ${disabled ? "opacity-40" : ""}`}
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
