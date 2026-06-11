export type SettingsItem = {
  id: string;
  label: string;
  trailing?: "chevron" | "sound" | "logout";
};

export type SettingsSection = {
  title: string;
  items: SettingsItem[];
};

export type SettingsValue = {
  id: string;
  value: string;
};

export type SettingsSectionWithValues = {
  title: string;
  items: Array<SettingsItem & { value?: string }>;
};

export type BirthDatePickerValue = {
  day: string;
  month: string;
  year: string;
};

export type WeightPickerValue = {
  whole: string;
  fraction: string;
};

export type HeightPickerValue = {
  whole: string;
  fraction: string;
};
