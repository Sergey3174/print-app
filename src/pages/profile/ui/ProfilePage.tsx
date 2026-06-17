import { useEffect, useMemo, useState } from "react";
import BG_HEADER from "../../../assets/bg-header1.png";
import {
  activityLevelOptions,
  genderOptions,
  getSettingsSections,
} from "../model/settingsData";
import {
  buildSectionsWithValues,
  formatBirthDate,
  formatBirthDateForApi,
  getAvailableBirthDateDays,
  parseBirthDate,
  parseHeight,
  parseTarget,
  parseWeight,
} from "../model/settingsUtils";
import type {
  BirthDatePickerValue,
  HeightPickerValue,
  SettingsItem,
  SettingsValue,
  WeightPickerValue,
} from "../model/types";
import { ProfileEditorContent } from "./ProfileEditorContent";
import { ProfileHeader } from "./ProfileHeader";
import { SettingsEditorSheet } from "./SettingsEditorSheet";
import { SettingsRow } from "./SettingsRow";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../app/store/store";
import {
  customDailyGoalThunk,
  getWaterProfileThunk,
  resetDailyCustomThunk,
  updateWaterProfileThunk,
  type UpdateWaterProfilePayload,
} from "../../../entities/waterProfile/api/waterProfileApi";
import { clearUser } from "../../../entities/user/slice/userSlice";
import { useResolvedCity } from "../../../shared/lib/useResolvedCity";
import { useTranslation } from "react-i18next";
const NOTIFICATIONS_ENABLED_KEY = "notifications-enabled";

const activityLevelToApiValue: Record<
  (typeof activityLevelOptions)[number],
  number
> = {
  Low: 1,
  Medium: 2,
  High: 3,
};

const apiValueToActivityLevel: Record<
  number,
  (typeof activityLevelOptions)[number]
> = {
  1: "Low",
  2: "Medium",
  3: "High",
};

function getNotificationsEnabledState() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  return (
    localStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === "true" &&
    Notification.permission === "granted"
  );
}

async function showTestNotification(
  title: string,
  body: string,
) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(title, {
      body,
      icon: "/android-chrome-192x192.png",
    });
    return;
  }

  new Notification(title, {
    body,
  });
}

function buildSettingsValuesFromProfile(
  profile: RootState["waterProfile"]["profile"],
  resolvedCity: string | null,
  notificationsEnabled: boolean,
) {
  return [
    { id: "gender", value: profile?.gender ?? "Not set" },
    {
      id: "birthDate",
      value: profile?.birth_date
        ? formatBirthDate(parseBirthDate(profile.birth_date))
        : "Not set",
    },
    {
      id: "weight",
      value: profile?.weight_kg != null ? `${profile.weight_kg} kg` : "Not set",
    },
    {
      id: "height",
      value: profile?.height_cm != null ? `${profile.height_cm} cm` : "Not set",
    },
    {
      id: "sound",
      value: notificationsEnabled ? "On" : "Off",
    },
    {
      id: "activityLevel",
      value:
        profile?.activity_level != null
          ? apiValueToActivityLevel[profile.activity_level]
          : "Not set",
    },
    {
      id: "target",
      value:
        profile?.daily_goal_ml != null
          ? `${profile.daily_goal_ml} ml`
          : "Not set",
    },
    { id: "city", value: profile?.city ?? resolvedCity ?? "Not set" },
  ] satisfies SettingsValue[];
}

export function ProfilePage() {
  const { t } = useTranslation();
  const [settingsValues, setSettingsValues] = useState<SettingsValue[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState("");
  const [birthDateValue, setBirthDateValue] = useState<BirthDatePickerValue>(
    parseBirthDate("1 January 2000"),
  );
  const [weightValue, setWeightValue] = useState<WeightPickerValue>(
    parseWeight("60 kg"),
  );
  const [heightValue, setHeightValue] = useState<HeightPickerValue>(
    parseHeight("180 cm"),
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    getNotificationsEnabledState(),
  );

  const dispatch: AppDispatch = useDispatch();
  const { profile, isInitialized, isLoading } = useSelector(
    (state: RootState) => state.waterProfile,
  );

  const { resolvedCity } = useResolvedCity({
    enabled: isInitialized,
    serverCity: profile?.city,
    onResolvedCity: async (city) => {
      await dispatch(updateWaterProfileThunk({ city }));
    },
  });

  useEffect(() => {
    dispatch(getWaterProfileThunk());
  }, [dispatch]);

  const [genderValue, setGenderValue] =
    useState<(typeof genderOptions)[number]>("female");
  const [activityLevelValue, setActivityLevelValue] =
    useState<(typeof activityLevelOptions)[number]>("Medium");

  const navigate = useNavigate();

  const sections = useMemo(
    () => buildSectionsWithValues(getSettingsSections(t), settingsValues),
    [settingsValues, t],
  );

  const activeItem = useMemo(
    () =>
      sections
        .flatMap((section) => section.items)
        .find((item) => item.id === activeItemId) ?? null,
    [activeItemId, sections],
  );

  const availableBirthDateDays = useMemo(
    () => getAvailableBirthDateDays(birthDateValue.month, birthDateValue.year),
    [birthDateValue.month, birthDateValue.year],
  );

  useEffect(() => {
    if (!availableBirthDateDays.includes(birthDateValue.day)) {
      setBirthDateValue((prev) => ({
        ...prev,
        day: availableBirthDateDays[availableBirthDateDays.length - 1],
      }));
    }
  }, [availableBirthDateDays, birthDateValue.day]);

  useEffect(() => {
    setSettingsValues(
      buildSettingsValuesFromProfile(
        profile,
        resolvedCity,
        notificationsEnabled,
      ),
    );
  }, [notificationsEnabled, profile, resolvedCity]);

  const openEditor = (item: SettingsItem & { value?: string }) => {
    if (item.id === "logout") {
      navigate("/login");
      dispatch(clearUser());
      return;
    }

    if (item.id === "sound" || item.id === "city") {
      return;
    }

    setActiveItemId(item.id);
    setDraftValue(item.value ?? "");

    if (item.id === "birthDate") {
      setBirthDateValue(parseBirthDate(item.value));
    }

    if (item.id === "weight") {
      setWeightValue(parseWeight(item.value));
    }

    if (item.id === "height") {
      setHeightValue(parseHeight(item.value));
    }

    if (item.id === "gender") {
      setGenderValue(
        genderOptions.includes(item.value as (typeof genderOptions)[number])
          ? (item.value as (typeof genderOptions)[number])
          : "female",
      );
    }

    if (item.id === "activityLevel") {
      setActivityLevelValue(
        activityLevelOptions.includes(
          item.value as (typeof activityLevelOptions)[number],
        )
          ? (item.value as (typeof activityLevelOptions)[number])
          : "Medium",
      );
    }

    if (item.id === "target" || item.id === "sound") {
      setDraftValue(
        item.id === "target" ? parseTarget(item.value) : (item.value ?? "Off"),
      );
    }
  };

  const closeEditor = () => {
    setActiveItemId(null);
    setDraftValue("");
  };

  const saveActiveItem = async () => {
    if (!activeItemId) return;

    const patchPayloadByItemId: Partial<
      Record<string, UpdateWaterProfilePayload>
    > = {
      gender: {
        gender: genderValue.toLowerCase(),
      },
      activityLevel: {
        activity_level: activityLevelToApiValue[activityLevelValue],
      },
      birthDate: {
        birth_date: formatBirthDateForApi(birthDateValue),
      },
      weight: {
        weight_kg: Number(`${weightValue.whole}.${weightValue.fraction}`),
      },
      height: {
        height_cm: Number(`${heightValue.whole}.${heightValue.fraction}`),
      },
      city: {
        city: draftValue.trim() || null,
      },
    };

    const patchPayload = patchPayloadByItemId[activeItemId];

    if (patchPayload) {
      await dispatch(updateWaterProfileThunk(patchPayload));
    }

    if (activeItemId === "target") {
      await dispatch(customDailyGoalThunk(Number(draftValue)));
    }

    closeEditor();
  };

  const toggleSound = async () => {
    if (!("Notification" in window)) {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
      return;
    }

    if (notificationsEnabled) {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
      return;
    }

    const permission =
      Notification.permission === "granted"
        ? "granted"
        : await Notification.requestPermission();

    if (permission !== "granted") {
      setNotificationsEnabled(false);
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "false");
      return;
    }

    setNotificationsEnabled(true);
    localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, "true");
    await showTestNotification(
      t("profile.testNotificationTitle"),
      t("profile.testNotificationBody"),
    );
  };

  const handleResetCustomDailyGoal = async () => {
    await dispatch(resetDailyCustomThunk());
    closeEditor();
  };

  return (
    <section className="min-h-0 w-full overflow-auto bg-[#F8FCFF] pb-[18px]">
      <div
        className="flex h-[175px] w-full flex-col px-4"
        style={{
          backgroundImage: `url(${BG_HEADER})`,
          backgroundSize: "100% 175px",
        }}
      >
        <ProfileHeader onBack={() => navigate("/app/today")} />
      </div>

      <div className="px-3">
        <div className="space-y-1">
          {sections.map((section) => (
            <div key={section.title}>
              <div className="rounded-2xl bg-[#D8F0FF] px-4 py-2.5 text-sm font-bold text-[#35607F]">
                {section.title}
              </div>
              <div className="px-4">
                {section.items.map((item) => (
                  <SettingsRow
                    key={item.id}
                    item={item}
                    onClick={() => openEditor(item)}
                    onToggleSound={toggleSound}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SettingsEditorSheet
        isOpen={Boolean(activeItem)}
        title={activeItem?.label}
        onClose={closeEditor}
        onSave={saveActiveItem}
        disabled={isLoading}
      >
        <ProfileEditorContent
          activeItem={activeItem}
          availableBirthDateDays={availableBirthDateDays}
          birthDateValue={birthDateValue}
          onBirthDateChange={setBirthDateValue}
          weightValue={weightValue}
          onWeightChange={setWeightValue}
          heightValue={heightValue}
          onHeightChange={setHeightValue}
          genderValue={genderValue}
          onGenderChange={setGenderValue}
          activityLevelValue={activityLevelValue}
          onActivityLevelChange={setActivityLevelValue}
          draftValue={draftValue}
          onDraftValueChange={setDraftValue}
          handleResetCustomDailyGoal={handleResetCustomDailyGoal}
        />
      </SettingsEditorSheet>
    </section>
  );
}
