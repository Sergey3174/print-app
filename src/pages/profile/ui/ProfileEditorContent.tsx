import Picker from "react-mobile-picker";
import {
  activityLevelOptions,
  birthDateMonths,
  birthDateYears,
  genderOptions,
  heightFractionValues,
  heightWholeValues,
  weightFractionValues,
  weightWholeValues,
} from "../model/settingsData";
import type {
  BirthDatePickerValue,
  HeightPickerValue,
  SettingsItem,
  WeightPickerValue,
} from "../model/types";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store/store";
import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

type ProfileEditorContentProps = {
  activeItem: (SettingsItem & { value?: string }) | null;
  availableBirthDateDays: string[];
  birthDateValue: BirthDatePickerValue;
  onBirthDateChange: (value: BirthDatePickerValue) => void;
  weightValue: WeightPickerValue;
  onWeightChange: (value: WeightPickerValue) => void;
  heightValue: HeightPickerValue;
  onHeightChange: (value: HeightPickerValue) => void;
  genderValue: (typeof genderOptions)[number];
  onGenderChange: (value: (typeof genderOptions)[number]) => void;
  activityLevelValue: (typeof activityLevelOptions)[number];
  onActivityLevelChange: (value: (typeof activityLevelOptions)[number]) => void;
  draftValue: string;
  onDraftValueChange: (value: string) => void;
  handleResetCustomDailyGoal: () => void;
};

export function ProfileEditorContent({
  activeItem,
  availableBirthDateDays,
  birthDateValue,
  onBirthDateChange,
  weightValue,
  onWeightChange,
  heightValue,
  onHeightChange,
  genderValue,
  onGenderChange,
  activityLevelValue,
  onActivityLevelChange,
  draftValue,
  onDraftValueChange,
  handleResetCustomDailyGoal,
}: ProfileEditorContentProps) {
  const { t } = useTranslation();
  const { profile } = useSelector((state: RootState) => state.waterProfile);

  const isCustom = !!profile?.daily_goal_is_custom;

  if (!activeItem) {
    return null;
  }

  if (activeItem.id === "sound") {
    return (
      <div className="rounded-3xl bg-[#F6FBFF] p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-base font-semibold text-[#20415F]">
            {t("profile.notificationSound")}
          </span>
          <button
            type="button"
            className={`relative inline-flex h-7 w-[52px] rounded-full transition-colors ${
              draftValue === "On" ? "bg-[#61C3FF]" : "bg-[#D8E5EF]"
            }`}
            onClick={() =>
              onDraftValueChange(draftValue === "On" ? "Off" : "On")
            }
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                draftValue === "On" ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        <p className="mt-3 text-sm text-[#6E8AA4]">
          {t("profile.currentState", {
            value: draftValue === "On" ? t("common.on") : t("common.off"),
          })}
        </p>
      </div>
    );
  }

  if (activeItem.id === "gender") {
    return (
      <div className="grid grid-cols-2 gap-3">
        {genderOptions.map((option) => {
          const isSelected = genderValue === option;

          return (
            <button
              key={option}
              type="button"
              className={`rounded-2xl capitalize border px-4 py-4 text-center text-base font-semibold transition ${
                isSelected
                  ? "border-[#61C3FF] bg-[#EAF7FF] text-[#183C59]"
                  : "border-[#D8E5EF] bg-white text-[#7A97AF]"
              }`}
              onClick={() => onGenderChange(option)}
            >
              {t(`profile.options.gender.${option}`)}
            </button>
          );
        })}
      </div>
    );
  }

  if (activeItem.id === "activityLevel") {
    return (
      <div className="grid grid-cols-1 gap-3">
        {activityLevelOptions.map((option) => {
          const isSelected = activityLevelValue === option;

          return (
            <button
              key={option}
              type="button"
              className={`rounded-2xl border px-4 py-4 text-left text-base font-semibold transition ${
                isSelected
                  ? "border-[#61C3FF] bg-[#EAF7FF] text-[#183C59]"
                  : "border-[#D8E5EF] bg-white text-[#7A97AF]"
              }`}
              onClick={() => onActivityLevelChange(option)}
            >
              {t(`profile.options.activityLevel.${option}`)}
            </button>
          );
        })}
      </div>
    );
  }

  if (activeItem.id === "birthDate") {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-white px-2 py-4">
        <Picker
          value={birthDateValue}
          onChange={(nextValue) =>
            onBirthDateChange(nextValue as BirthDatePickerValue)
          }
          wheelMode="natural"
          height={180}
          itemHeight={40}
        >
          <Picker.Column name="day">
            {availableBirthDateDays.map((day) => (
              <Picker.Item key={day} value={day}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    {day}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
          <Picker.Column name="month">
            {birthDateMonths.map((month) => (
              <Picker.Item key={month} value={month}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    {t(`profile.months.${month}`)}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
          <Picker.Column name="year">
            {birthDateYears.map((year) => (
              <Picker.Item key={year} value={year}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    {year}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>
      </div>
    );
  }

  if (activeItem.id === "weight") {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-white px-2 py-4">
        <Picker
          value={weightValue}
          onChange={(nextValue) =>
            onWeightChange(nextValue as WeightPickerValue)
          }
          wheelMode="natural"
          height={180}
          itemHeight={40}
        >
          <Picker.Column name="whole">
            {weightWholeValues.map((whole) => (
              <Picker.Item key={whole} value={whole}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    {whole}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
          <Picker.Column name="fraction">
            {weightFractionValues.map((fraction) => (
              <Picker.Item key={fraction} value={fraction}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    .{fraction}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>
      </div>
    );
  }

  if (activeItem.id === "height") {
    return (
      <div className="relative overflow-hidden rounded-[28px] bg-white px-2 py-4">
        <Picker
          value={heightValue}
          onChange={(nextValue) =>
            onHeightChange(nextValue as HeightPickerValue)
          }
          wheelMode="natural"
          height={180}
          itemHeight={40}
        >
          <Picker.Column name="whole">
            {heightWholeValues.map((whole) => (
              <Picker.Item key={whole} value={whole}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    {whole}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
          <Picker.Column name="fraction">
            {heightFractionValues.map((fraction) => (
              <Picker.Item key={fraction} value={fraction}>
                {({ selected }) => (
                  <div
                    className={`text-center text-base transition-colors ${
                      selected
                        ? "font-bold text-[#183C59]"
                        : "font-medium text-[#8AA3B8]"
                    }`}
                  >
                    .{fraction}
                  </div>
                )}
              </Picker.Item>
            ))}
          </Picker.Column>
        </Picker>
      </div>
    );
  }

  if (activeItem.id === "target") {
    return (
      <label className="block">
        <div className="relative">
          <input
            value={draftValue}
            onChange={(event) =>
              onDraftValueChange(event.target.value.replace(/\D/g, ""))
            }
            inputMode="numeric"
            placeholder={t("profile.targetPlaceholder")}
            className="w-full rounded-2xl border border-[#D8E5EF] bg-[#F9FCFF] px-4 py-3 pr-14 text-[#20415F] outline-none transition focus:border-[#61C3FF] focus:bg-white"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#6E8AA4]">
            ml
          </span>
        </div>
        {isCustom && (
          <div className="w-full mt-2 text-right">
            <button
              className="px-2 text-[#6E8AA4]"
              onClick={handleResetCustomDailyGoal}
            >
              <RotateCcw />
            </button>
          </div>
        )}
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[#35607F]">
        {t("common.value")}
      </span>
      <input
        value={draftValue}
        onChange={(event) => onDraftValueChange(event.target.value)}
        placeholder={t("profile.newValuePlaceholder")}
        className="w-full rounded-2xl border border-[#D8E5EF] bg-[#F9FCFF] px-4 py-3 text-[#20415F] outline-none transition focus:border-[#61C3FF] focus:bg-white"
      />
    </label>
  );
}
