import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

export type TaskHistoryItem = {
  tid: string;
  pid: string | null;
  printer_name: string | null;
  status: string;
  document_type: string;
  pages_count: number;
  copies: number;
  printed_pages_count: number;
  selected_pages: string | null;
  color_mode: string;
  duplex: boolean;
  amount: number;
  ipp_job_id: number | null;
  created_at: string;
  updated_at: string;
  document_name: string;
};

export type TaskHistoryResponse = {
  // cid: string;
  total_items: number;
  current_page: number;
  per_page: number;
  total_pages: number;
  // has_next: boolean;
  // has_prev: boolean;
  items: TaskHistoryItem[];
};

export type LoadTaskHistoryParams = {
  page?: number;
  page_size?: number;
};

type TaskHistoryState = {
  data: TaskHistoryResponse | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: TaskHistoryState = {
  data: null,
  isLoading: false,
  error: null,
};

export const loadTaskHistoryThunk = createAsyncThunk<
  TaskHistoryResponse,
  LoadTaskHistoryParams | void,
  { rejectValue: string }
>("taskHistory/loadTaskHistory", async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get<TaskHistoryResponse>(
      "/api/task/history",
      {
        params: {
          page: params?.page ?? 1,
          per_page: params?.page_size ?? 20,
        },
      },
    );

    if (!Array.isArray(data?.items)) {
      return rejectWithValue("Invalid task history response");
    }

    return data;
  } catch {
    return rejectWithValue("Failed to load task history");
  }
});

const taskHistorySlice = createSlice({
  name: "taskHistory",
  initialState,
  reducers: {
    clearTaskHistory: (state) => {
      state.data = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTaskHistoryThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadTaskHistoryThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const requestedPage = action.meta.arg?.page ?? 1;

        if (!state.data || requestedPage <= 1) {
          state.data = action.payload;
          return;
        }

        state.data = {
          ...action.payload,
          items: [...state.data.items, ...action.payload.items],
        };
      })
      .addCase(loadTaskHistoryThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load task history";
      });
  },
});

export const { clearTaskHistory } = taskHistorySlice.actions;
export const taskHistoryReducer = taskHistorySlice.reducer;
