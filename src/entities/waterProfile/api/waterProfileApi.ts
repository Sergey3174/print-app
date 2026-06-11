import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

export type WaterProfileInfo = {
  id: number;
  height_cm: number | null;
  weight_kg: number | null;
  birth_date: string | null;
  activity_level: number | null;
  gender: string | null;
  city: string | null;
  daily_goal_ml: number | null;
  daily_goal_is_custom: boolean;
};

export type UpdateWaterProfilePayload = {
  height_cm?: number | null;
  weight_kg?: number | null;
  birth_date?: string | null;
  activity_level?: number | null;
  gender?: string | null;
  city?: string | null;
};

export const getWaterProfileThunk = createAsyncThunk<
  WaterProfileInfo,
  void,
  { rejectValue: string }
>("waterProfile/getWaterProfile", async (_, { rejectWithValue }) => {
  try {
    const { data } =
      await axiosInstance.get<WaterProfileInfo>(`/api/water/profile`);

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Authentication failed");
  }
});

export const updateWaterProfileThunk = createAsyncThunk<
  WaterProfileInfo,
  UpdateWaterProfilePayload,
  { rejectValue: string }
>("waterProfile/updateWaterProfile", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.patch<WaterProfileInfo>(
      `/api/water/profile`,
      null,
      {
        params,
      },
    );

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Failed to update water profile");
  }
});

export const customDailyGoalThunk = createAsyncThunk<
  WaterProfileInfo,
  number,
  { rejectValue: string }
>(
  "waterProfile/customDailyGoal",
  async (daily_goal_ml, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.patch<WaterProfileInfo>(
        `/api/water/profile/daily-goal`,
        null,
        {
          params: {
            daily_goal_ml,
          },
        },
      );

      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Failed to update water profile");
    }
  },
);

export const resetDailyCustomThunk = createAsyncThunk<
  WaterProfileInfo,
  void,
  { rejectValue: string }
>("waterProfile/resetDailyCustom", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post<WaterProfileInfo>(
      `/api/water/profile/daily-goal/reset`,
    );

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Failed to update water profile");
  }
});
