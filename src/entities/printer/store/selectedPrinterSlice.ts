import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Printer } from "../../../mock/printers";
import i18n from "../../../i18n";
import { toast } from "react-toastify";

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

export function selectPrinterWithStatus(printer: Printer) {
  return (dispatch: (action: ReturnType<typeof setSelectedPrinter>) => void) => {
    if (!printer.is_online) {
      toast.error(
        i18n.t("printer.offlineUnavailable", { printerName: printer.name }),
      );
      return false;
    }

    dispatch(setSelectedPrinter(printer));
    return true;
  };
}

export const { setSelectedPrinter, clearSelectedPrinter } =
  selectedPrinterSlice.actions;
export const selectedPrinterReducer = selectedPrinterSlice.reducer;
