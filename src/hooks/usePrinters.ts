import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../app/store/store";
import { loadPrintersThunk } from "../entities/printer/store/printersSlice";

type UsePrintersOptions = {
  delay?: number;
};

export function usePrinters(options: UsePrintersOptions = {}) {
  const { delay = 1200 } = options;
  const dispatch = useDispatch<AppDispatch>();
  const { data, isLoading, error } = useSelector(
    (state: RootState) => state.printers,
  );

  useEffect(() => {
    if (data || isLoading || error) {
      return;
    }

    dispatch(loadPrintersThunk());
  }, [data, delay, dispatch, error, isLoading]);

  return {
    data,
    printers: data?.printers ?? [],
    isLoading,
    error,
  };
}
