import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type { RootState } from "../../../app/store/store";

type CreateTaskResponse = {
  tid: string;
};

export type EstimateTaskPayload = {
  pid: string;
  tid: string;
  copies: number;
  pages: string | null;
  color_mode: "black_white" | "color";
  duplex: boolean;
};

export type EstimateTaskResponse = {
  pid: string;
  tid: string;
  total_pages_count: number;
  selected_pages_count: number;
  printed_pages_count: number;
  copies: number;
  selected_pages: string | null;
  color_mode: "black_white" | "color";
  duplex: boolean;
  price_page: number;
  amount: number;
  status: string;
  payment_expires_at: string;
};

export type PaymentTaskResponse = unknown;
export type PaymentCallbackResponse = {
  tid: string;
  status: string;
};

export type PrintTaskStateResponse = {
  id: number;
  tid: string;
  pid: string;
  status: string;
  pages_count: number;
  document_type: string;
  amount: number;
  color_mode: string;
  duplex: boolean;
  copies: number;
  selected_pages: string;
  ipp_job_id: number;
};

type TaskStatus = "processing" | "ready" | "failed" | string;

type FileStatus = "processing" | "ready" | "failed" | string;

type InkCoverageItem = {
  page: number;
  coverage: number;
};

type TaskStateResponse = {
  tid: string;
  status: TaskStatus;
  file_status: FileStatus;
  error_message: string | null;
  original_format: string | null;
  original_file_name: string | null;
  pdf_file_url: string | null;
  pages_count: number | null;
  average_ink_coverage: number | null;
  ink_coverage: InkCoverageItem[];
};

type TaskState = {
  tid: string | null;
  isLoading: boolean;
  error: string | null;
  uploadedFileName: string | null;
  status: TaskStatus | null;
  fileStatus: FileStatus | null;
  errorMessage: string | null;
  originalFormat: string | null;
  originalFileName: string | null;
  pdfFileUrl: string | null;
  pagesCount: number | null;
  averageInkCoverage: number | null;
  inkCoverage: InkCoverageItem[];
  estimate: EstimateTaskResponse | null;
  paymentStatus: string | null;
  printState: PrintTaskStateResponse | null;
};

const initialState: TaskState = {
  tid: null,
  isLoading: false,
  error: null,
  uploadedFileName: null,
  status: null,
  fileStatus: null,
  errorMessage: null,
  originalFormat: null,
  originalFileName: null,
  pdfFileUrl: null,
  pagesCount: null,
  averageInkCoverage: null,
  inkCoverage: [],
  estimate: null,
  paymentStatus: null,
  printState: null,
};

export const createTaskThunk = createAsyncThunk<
  CreateTaskResponse,
  File,
  { rejectValue: string }
>("task/createTask", async (file, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosInstance.post<CreateTaskResponse>(
      "/api/task/create",
      formData,
    );

    if (!data?.tid) {
      return rejectWithValue("Invalid task response");
    }

    return data;
  } catch (error) {
    return rejectWithValue("Failed to create task");
  }
});

export const fetchTaskStateThunk = createAsyncThunk<
  TaskStateResponse,
  void,
  { state: RootState; rejectValue: string }
>("task/fetchTaskState", async (_, { getState, rejectWithValue }) => {
  const tid = getState().task.tid;

  if (!tid) {
    return rejectWithValue("Task id is missing");
  }

  try {
    const { data } = await axiosInstance.get<TaskStateResponse>("/api/task/state", {
      params: { tid },
    });

    if (!data?.tid) {
      return rejectWithValue("Invalid task state response");
    }

    return data;
  } catch {
    return rejectWithValue("Failed to load task state");
  }
});

export const estimateTaskThunk = createAsyncThunk<
  EstimateTaskResponse,
  EstimateTaskPayload,
  { rejectValue: string }
>("task/estimateTask", async (payload, { rejectWithValue }) => {
  if (!payload.pid || !payload.tid) {
    return rejectWithValue("Printer id or task id is missing");
  }

  try {
    const { data } = await axiosInstance.post<EstimateTaskResponse>(
      "/api/task/estimate",
      null,
      {
      params: payload,
      },
    );

    if (!data?.tid || !data?.pid) {
      return rejectWithValue("Invalid estimate response");
    }

    return data;
  } catch {
    return rejectWithValue("Failed to estimate task");
  }
});

export const payTaskThunk = createAsyncThunk<
  PaymentTaskResponse,
  void,
  { state: RootState; rejectValue: string }
>("task/payTask", async (_, { getState, rejectWithValue }) => {
  const tid = getState().task.tid;

  if (!tid) {
    return rejectWithValue("Task id is missing");
  }

  try {
    const { data } = await axiosInstance.post("/api/payment", null, {
      params: { tid },
    });

    return data;
  } catch {
    return rejectWithValue("Failed to create payment");
  }
});

export const paymentCallbackThunk = createAsyncThunk<
  PaymentCallbackResponse,
  void,
  { state: RootState; rejectValue: string }
>("task/paymentCallback", async (_, { getState, rejectWithValue }) => {
  const tid = getState().task.tid;

  if (!tid) {
    return rejectWithValue("Task id is missing");
  }

  try {
    const { data } = await axiosInstance.get<PaymentCallbackResponse>(
      "/api/payment/callback",
      {
        params: { tid },
      },
    );

    if (!data?.tid) {
      return rejectWithValue("Invalid payment callback response");
    }

    return data;
  } catch {
    return rejectWithValue("Failed to get payment callback");
  }
});

export const fetchPrintTaskStateThunk = createAsyncThunk<
  PrintTaskStateResponse,
  void,
  { state: RootState; rejectValue: string }
>("task/fetchPrintTaskState", async (_, { getState, rejectWithValue }) => {
  const tid = getState().task.tid;

  if (!tid) {
    return rejectWithValue("Task id is missing");
  }

  try {
    const { data } = await axiosInstance.get<PrintTaskStateResponse>(
      "/api/task/print/state",
      {
        params: { tid },
      },
    );

    if (!data?.tid) {
      return rejectWithValue("Invalid print state response");
    }

    return data;
  } catch {
    return rejectWithValue("Failed to load print state");
  }
});

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTask: (state) => {
      state.tid = null;
      state.isLoading = false;
      state.error = null;
      state.uploadedFileName = null;
      state.status = null;
      state.fileStatus = null;
      state.errorMessage = null;
      state.originalFormat = null;
      state.originalFileName = null;
      state.pdfFileUrl = null;
      state.pagesCount = null;
      state.averageInkCoverage = null;
      state.inkCoverage = [];
      state.estimate = null;
      state.paymentStatus = null;
      state.printState = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTaskThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.tid = null;
        state.uploadedFileName = action.meta.arg.name;
        state.status = null;
        state.fileStatus = null;
        state.errorMessage = null;
        state.originalFormat = null;
        state.originalFileName = null;
        state.pdfFileUrl = null;
        state.pagesCount = null;
        state.averageInkCoverage = null;
        state.inkCoverage = [];
        state.estimate = null;
        state.paymentStatus = null;
        state.printState = null;
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tid = action.payload.tid;
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create task";
      })
      .addCase(fetchTaskStateThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskStateThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tid = action.payload.tid;
        state.status = action.payload.status;
        state.fileStatus = action.payload.file_status;
        state.errorMessage = action.payload.error_message;
        state.originalFormat = action.payload.original_format;
        state.originalFileName = action.payload.original_file_name;
        state.pdfFileUrl = action.payload.pdf_file_url;
        state.pagesCount = action.payload.pages_count;
        state.averageInkCoverage = action.payload.average_ink_coverage;
        state.inkCoverage = action.payload.ink_coverage;
      })
      .addCase(fetchTaskStateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load task state";
      })
      .addCase(estimateTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(estimateTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.estimate = action.payload;
      })
      .addCase(estimateTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to estimate task";
      })
      .addCase(payTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(payTaskThunk.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(payTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create payment";
      })
      .addCase(paymentCallbackThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(paymentCallbackThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentStatus = action.payload.status;
      })
      .addCase(paymentCallbackThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to get payment callback";
      })
      .addCase(fetchPrintTaskStateThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPrintTaskStateThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.printState = action.payload;
      })
      .addCase(fetchPrintTaskStateThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to load print state";
      });
  },
});

export const { clearTask } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;
