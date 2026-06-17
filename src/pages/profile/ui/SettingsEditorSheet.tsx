import { X } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

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
  title,
  description,
  children,
  onClose,
  onSave,
  disabled = false,
  showActionButtons = true,
  showCloseButton = false,
  saveLabel,
  cancelLabel,
}: SettingsEditorSheetProps) {
  const { t } = useTranslation();
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isVisible, setIsVisible] = useState(false);
  const resolvedTitle = title ?? t("settingsSheet.editSetting");
  const resolvedSaveLabel = saveLabel ?? t("common.save");
  const resolvedCancelLabel = cancelLabel ?? t("common.cancel");

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
        className={`fixed inset-x-0 bottom-0 z-30 rounded-t-[28px] border-t border-[#e4e2e1] bg-[#fbf9f8] px-4 pb-6 pt-3 transition-transform duration-300 shadow-[0_-4px_12px_rgba(26,35,126,0.08)]  ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="flex justify-center pb-1 sm:hidden">
          <div className="h-1 w-8 rounded-full bg-[#bdc2ff]" />
        </div>

        <div className="mb-5 flex items-start justify-between gap-4 border-b border-[#f0eded] pb-4">
          <div>
            <h3 className="text-xl font-bold text-[#1a237e]">{resolvedTitle}</h3>
            {description && (
              <p className="mt-1 text-sm text-[#454652]">{description}</p>
            )}
          </div>

          {showCloseButton ? (
            <button
              type="button"
              className="rounded-full p-2 text-[#4c56af] transition hover:bg-[#e0e0ff]/60"
              onClick={onClose}
              aria-label={t("settingsSheet.close")}
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
              className="flex-1 rounded-2xl border border-[#bdc2ff] bg-white px-4 py-3 font-semibold text-[#4c56af] transition hover:bg-[#f7f7ff] disabled:opacity-50"
              onClick={onClose}
            >
              {resolvedCancelLabel}
            </button>
            <button
              type="button"
              className="flex-1 rounded-2xl bg-[#1a237e] px-4 py-3 font-semibold text-white shadow-[0_12px_24px_rgba(26,35,126,0.22)] transition hover:bg-[#111a63] disabled:opacity-40"
              onClick={onSave}
              disabled={disabled}
            >
              {resolvedSaveLabel}
            </button>
          </div>
        ) : null}
      </div>
    </>,
    document.body,
  );
}
