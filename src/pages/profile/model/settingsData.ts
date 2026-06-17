import type { SettingsSection, SettingsValue } from "./types";
import type { TFunction } from "i18next";

export const genderOptions = ["female", "male"] as const;
export const activityLevelOptions = ["Low", "Medium", "High"] as const;

export const birthDateMonths = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const birthDateYears = Array.from({ length: 80 }, (_, index) =>
  String(2025 - index),
);

export const weightWholeValues = Array.from({ length: 121 }, (_, index) =>
  String(30 + index),
);

export const weightFractionValues = Array.from({ length: 10 }, (_, index) =>
  String(index),
);

export const heightWholeValues = Array.from({ length: 151 }, (_, index) =>
  String(70 + index),
);

export const heightFractionValues = Array.from({ length: 10 }, (_, index) =>
  String(index),
);

export function getSettingsSections(t: TFunction): SettingsSection[] {
  return [
    {
      title: t("profile.sectionProfile"),
      items: [
        { id: "gender", label: t("profile.gender"), trailing: "chevron" },
        { id: "birthDate", label: t("profile.birthDate"), trailing: "chevron" },
        { id: "weight", label: t("profile.weight"), trailing: "chevron" },
        { id: "height", label: t("profile.height"), trailing: "chevron" },
      ],
    },
    {
      title: t("profile.sectionGeneral"),
      items: [
        { id: "sound", label: t("profile.sound"), trailing: "sound" },
        {
          id: "activityLevel",
          label: t("profile.activityLevel"),
          trailing: "chevron",
        },
        {
          id: "target",
          label: t("profile.target"),
          trailing: "chevron",
        },
        { id: "city", label: t("profile.city"), trailing: "chevron" },
        { id: "logout", label: t("profile.logout"), trailing: "logout" },
      ],
    },
  ];
}

export const settingsValuesFromApi: SettingsValue[] = [
  { id: "gender", value: "Male" },
  { id: "birthDate", value: "19 January 2000" },
  { id: "weight", value: "60.3 kg" },
  { id: "height", value: "180.3 cm" },
  { id: "sound", value: "Off" },
  { id: "activityLevel", value: "Medium" },
  { id: "target", value: "2427 ml" },
  { id: "city", value: "Moscow" },
];
