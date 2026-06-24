import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { PrintersMock } from "../../../mock/printers";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

type PrintersState = {
  data: PrintersMock | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: PrintersState = {
  data: null,
  isLoading: false,
  error: null,
};

export const loadPrintersThunk = createAsyncThunk(
  "printers/loadPrinters",
  async () => {
    const { data } = await axiosInstance.post("/api/printers");

    if (Array.isArray(data?.printers)) {
      return data as PrintersMock;
    }

    throw new Error("Invalid printers response");
  },
);

const printersSlice = createSlice({
  name: "printers",
  initialState,
  reducers: {
    setPrinters: (state, action: PayloadAction<PrintersMock>) => {
      state.data = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    clearPrinters: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPrintersThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadPrintersThunk.fulfilled, (state, action) => {
        state.data = action.payload;
        state.isLoading = false;
      })
      .addCase(loadPrintersThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to load printers";
      });
  },
});

export const { setPrinters, clearPrinters } = printersSlice.actions;
export const printersReducer = printersSlice.reducer;
