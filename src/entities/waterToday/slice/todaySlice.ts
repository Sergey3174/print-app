import { createSlice } from "@reduxjs/toolkit";
import {
  deleteIntakeWaterThunk,
  getTodayThunk,
  intakeWaterThunk,
  updateReminderThunk,
  type TodayInfo,
} from "../api/todayApi";

type TodayState = {
  today: null | TodayInfo;
  isLoading: boolean;
  error: string | null;
};

const initialState: TodayState = {
  today: null,
  isLoading: false,
  error: null,
};

const todaySlice = createSlice({
  name: "today",
  initialState,
  reducers: {
    clearToday: (state) => {
      state.today = null;
      state.error = null;
    },
    clearReminder: (state) => {
      if (state.today) {
        state.today.next_reminder = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getTodayThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTodayThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.today = action.payload;
      })
      .addCase(getTodayThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load today data";
      })
      .addCase(intakeWaterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(intakeWaterThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(intakeWaterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load today data";
      })

      .addCase(deleteIntakeWaterThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteIntakeWaterThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(deleteIntakeWaterThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load today data";
      })

      .addCase(updateReminderThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReminderThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(updateReminderThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load today data";
      });
  },
});

export const { clearToday, clearReminder } = todaySlice.actions;
export const todayReducer = todaySlice.reducer;
