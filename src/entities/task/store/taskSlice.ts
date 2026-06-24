import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";
import type { RootState } from "../../../app/store/store";

type CreateTaskResponse = {
  tid: string;
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
      });
  },
});

export const { clearTask } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;
