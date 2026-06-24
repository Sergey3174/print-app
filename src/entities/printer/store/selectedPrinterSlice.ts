import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Printer } from "../../../mock/printers";

type SelectedPrinterState = {
  printer: Printer | null;
};

const initialState: SelectedPrinterState = {
  printer: null,
};

const selectedPrinterSlice = createSlice({
  name: "selectedPrinter",
  initialState,
  reducers: {
    setSelectedPrinter: (state, action: PayloadAction<Printer>) => {
      state.printer = action.payload;
    },
    clearSelectedPrinter: (state) => {
      state.printer = null;
    },
  },
});

export const { setSelectedPrinter, clearSelectedPrinter } =
  selectedPrinterSlice.actions;
export const selectedPrinterReducer = selectedPrinterSlice.reducer;
