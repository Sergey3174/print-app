import {
  birthDateMonths,
  birthDateYears,
  heightFractionValues,
  heightWholeValues,
  weightFractionValues,
  weightWholeValues,
} from "./settingsData";
import type {
  BirthDatePickerValue,
  HeightPickerValue,
  SettingsSection,
  SettingsSectionWithValues,
  SettingsValue,
  WeightPickerValue,
} from "./types";

const birthDateDays = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export function updateItemValue(
  values: SettingsValue[],
  itemId: string,
  nextValue: string,
) {
  const hasItem = values.some((item) => item.id === itemId);

  if (!hasItem) {
    return [...values, { id: itemId, value: nextValue }];
  }

  return values.map((item) =>
    item.id === itemId ? { ...item, value: nextValue } : item,
  );
}

export function buildSectionsWithValues(
  sections: SettingsSection[],
  values: SettingsValue[],
): SettingsSectionWithValues[] {
  const valuesMap = new Map(values.map((item) => [item.id, item.value]));

  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      value: valuesMap.get(item.id),
    })),
  }));
}

export function parseBirthDate(value?: string): BirthDatePickerValue {
  const fallback: BirthDatePickerValue = {
    day: "19",
    month: "January",
    year: "2000",
  };

  if (!value) {
    return fallback;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    const monthIndex = Number(month) - 1;
    const monthName = birthDateMonths[monthIndex];

    if (!day || !monthName || !year) {
      return fallback;
    }

    return {
      day: birthDateDays.includes(day) ? day : fallback.day,
      month: monthName,
      year: birthDateYears.includes(year) ? year : fallback.year,
    };
  }

  const [day, month, year] = value.split(" ");

  if (!day || !month || !year) {
    return fallback;
  }

  return {
    day: birthDateDays.includes(day) ? day : fallback.day,
    month: birthDateMonths.includes(month as (typeof birthDateMonths)[number])
      ? month
      : fallback.month,
    year: birthDateYears.includes(year) ? year : fallback.year,
  };
}

export function formatBirthDate(value: BirthDatePickerValue) {
  return `${value.day} ${value.month} ${value.year}`;
}

export function formatBirthDateForApi(value: BirthDatePickerValue) {
  const monthIndex = birthDateMonths.indexOf(
    value.month as (typeof birthDateMonths)[number],
  );
  const month = String(monthIndex + 1).padStart(2, "0");

  return `${value.year}-${month}-${value.day}`;
}

export function getDaysInMonth(month: string, year: string) {
  const monthIndex = birthDateMonths.indexOf(
    month as (typeof birthDateMonths)[number],
  );

  if (monthIndex === -1) {
    return 31;
  }

  return new Date(Number(year), monthIndex + 1, 0).getDate();
}

export function parseWeight(value?: string): WeightPickerValue {
  const fallback: WeightPickerValue = {
    whole: "60",
    fraction: "3",
  };

  if (!value) {
    return fallback;
  }

  const normalizedValue = value.replace(" kg", "");
  const [whole, fraction = "0"] = normalizedValue.split(".");

  return {
    whole: weightWholeValues.includes(whole) ? whole : fallback.whole,
    fraction: weightFractionValues.includes(fraction)
      ? fraction
      : fallback.fraction,
  };
}

export function formatWeight(value: WeightPickerValue) {
  return `${value.whole}.${value.fraction} kg`;
}

export function parseHeight(value?: string): HeightPickerValue {
  const fallback: HeightPickerValue = {
    whole: "180",
    fraction: "3",
  };

  if (!value) {
    return fallback;
  }

  const normalizedValue = value.replace(" cm", "");
  const [whole, fraction = "0"] = normalizedValue.split(".");

  return {
    whole: heightWholeValues.includes(whole) ? whole : fallback.whole,
    fraction: heightFractionValues.includes(fraction)
      ? fraction
      : fallback.fraction,
  };
}

export function formatHeight(value: HeightPickerValue) {
  return `${value.whole}.${value.fraction} cm`;
}

export function parseTarget(value?: string) {
  return value?.replace(" ml", "") ?? "";
}

export function getAvailableBirthDateDays(
  month: string,
  year: string,
): string[] {
  const daysInMonth = getDaysInMonth(month, year);

  return Array.from({ length: daysInMonth }, (_, index) =>
    String(index + 1).padStart(2, "0"),
  );
}
