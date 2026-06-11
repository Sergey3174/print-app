import { createSlice } from "@reduxjs/toolkit";
import {
  customDailyGoalThunk,
  getWaterProfileThunk,
  resetDailyCustomThunk,
  updateWaterProfileThunk,
  type WaterProfileInfo,
} from "../api/waterProfileApi";

type ProfileWaterState = {
  profile: WaterProfileInfo | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
};

const initialState: ProfileWaterState = {
  profile: null,
  isLoading: false,
  isInitialized: false,
  error: null,
};

const waterProfileSlice = createSlice({
  name: "waterProfile",
  initialState,
  reducers: {
    clearWaterProfile: (state) => {
      state.profile = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getWaterProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getWaterProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.profile = action.payload;
      })
      .addCase(getWaterProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load water profile";
      })
      .addCase(updateWaterProfileThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateWaterProfileThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(updateWaterProfileThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update water profile";
      })
      .addCase(customDailyGoalThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(customDailyGoalThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(customDailyGoalThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update water profile";
      })
      .addCase(resetDailyCustomThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetDailyCustomThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(resetDailyCustomThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to update water profile";
      });
  },
});

export const { clearWaterProfile } = waterProfileSlice.actions;
export const waterProfileReducer = waterProfileSlice.reducer;
