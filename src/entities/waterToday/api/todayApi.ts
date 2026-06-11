import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type { WaterAmount } from "../../../pages/home/ui/HomePage";

export type TodayInfo = {
  date: string;
  total_ml: number;
  daily_goal_ml: number;
  remaining_ml: number;
  progress_percent: number;
  intakes: TodayIntake[];
  next_reminder: string | null;
  city: string | null;
  temperature_c: number | null;
};

export type TodayIntake = {
  id: number;
  amount_ml: WaterAmount;
  drink_type: string;
  daily_goal_ml: number;
  consumed_at: string;
  created_at: string;
};

export const getTodayThunk = createAsyncThunk<
  TodayInfo,
  void,
  { rejectValue: string }
>("today/getToday", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<TodayInfo>(`/api/water/today`);

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Authentication failed");
  }
});

export const intakeWaterThunk = createAsyncThunk<
  unknown,
  WaterAmount,
  { rejectValue: string }
>("today/intakeWater", async (amount_ml, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post(
      `/api/water/intake`,
      {},
      {
        params: {
          amount_ml,
        },
      },
    );

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Authentication failed");
  }
});

export const deleteIntakeWaterThunk = createAsyncThunk<
  unknown,
  number,
  { rejectValue: string }
>("today/deleteWater", async (intake_id, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete(
      `/api/water/intake/${intake_id}`,
    );

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Authentication failed");
  }
});

export const updateReminderThunk = createAsyncThunk<
  unknown,
  string,
  { rejectValue: string }
>("today/updateReminde", async (start_time, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.patch(`/api/water/reminders`, null, {
      params: {
        start_time,
      },
    });

    return data;
  } catch (error) {
    if (error instanceof Error) {
      return rejectWithValue(error.message);
    }

    return rejectWithValue("Authentication failed");
  }
});
