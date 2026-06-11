import type { SettingsSection, SettingsValue } from "./types";

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

export const settingsSections: SettingsSection[] = [
  {
    title: "Profile Settings",
    items: [
      { id: "gender", label: "Gender", trailing: "chevron" },
      { id: "birthDate", label: "Date of Birth", trailing: "chevron" },
      { id: "weight", label: "Weight", trailing: "chevron" },
      { id: "height", label: "Height", trailing: "chevron" },
    ],
  },
  {
    title: "General Settings",
    items: [
      { id: "sound", label: "Sound", trailing: "sound" },
      { id: "activityLevel", label: "Activity Level", trailing: "chevron" },
      {
        id: "target",
        label: "Consumption Target",
        trailing: "chevron",
      },
      { id: "city", label: "City", trailing: "chevron" },
      { id: "logout", label: "Logout", trailing: "logout" },
    ],
  },
];

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
