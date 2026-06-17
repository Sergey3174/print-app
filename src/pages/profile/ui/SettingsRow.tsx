import { ChevronRight, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SettingsItem } from "../model/types";

type SettingsRowProps = {
  item: SettingsItem & { value?: string };
  onClick: () => void;
  onToggleSound: () => void;
};

export function SettingsRow({
  item,
  onClick,
  onToggleSound,
}: SettingsRowProps) {
  const { t } = useTranslation();
  const { label, value, trailing = "chevron" } = item;
  const translatedBirthDate = (() => {
    if (!value || item.id !== "birthDate" || value === "Not set") {
      return value;
    }

    const parts = value.split(" ");
    if (parts.length !== 3) {
      return value;
    }

    const [day, month, year] = parts;
    return `${day} ${t(`profile.months.${month}`)} ${year}`;
  })();

  const displayValue =
    item.id === "gender" && value
      ? t(`profile.options.gender.${value.toLowerCase()}`)
      : item.id === "birthDate" && translatedBirthDate
        ? translatedBirthDate
      : item.id === "activityLevel" && value
        ? t(`profile.options.activityLevel.${value}`)
        : item.id === "sound" && value
          ? value === "On"
            ? t("common.on")
            : t("common.off")
          : value === "Not set"
            ? t("common.notSet")
            : value;

  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 py-2 text-left"
      onClick={onClick}
    >
      <span className="flex-1 text-[15px] font-semibold text-[#20415F]">
        {label}
      </span>
      {value && trailing !== "sound" ? (
        <span
          className={`text-sm font-medium text-[#6E8AA4] ${item.id === "gender" ? "capitalize" : ""}`}
        >
          {displayValue}
        </span>
      ) : null}
      {trailing === "sound" ? (
        <span
          className="flex items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <span className="text-sm font-semibold text-[#6E8AA4]">
            {displayValue}
          </span>
          <span
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              value === "On" ? "bg-[#61C3FF]" : "bg-[#D8E5EF]"
            }`}
          >
            <button
              type="button"
              aria-label={t("profile.toggleSound")}
              className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                value === "On" ? "translate-x-[21px]" : "translate-x-[3px]"
              }`}
              onClick={onToggleSound}
            />
          </span>
        </span>
      ) : trailing === "logout" ? (
        <LogOut size={18} className="shrink-0 text-[#7A97AF]" />
      ) : (
        <ChevronRight size={18} className="shrink-0 text-[#7A97AF]" />
      )}
    </button>
  );
}
