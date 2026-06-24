import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

type CreateTaskResponse = {
  tid: string;
};

type TaskState = {
  tid: string | null;
  isLoading: boolean;
  error: string | null;
  uploadedFileName: string | null;
};

const initialState: TaskState = {
  tid: null,
  isLoading: false,
  error: null,
  uploadedFileName: null,
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

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    clearTask: (state) => {
      state.tid = null;
      state.isLoading = false;
      state.error = null;
      state.uploadedFileName = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createTaskThunk.pending, (state, action) => {
        state.isLoading = true;
        state.error = null;
        state.tid = null;
        state.uploadedFileName = action.meta.arg.name;
      })
      .addCase(createTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tid = action.payload.tid;
      })
      .addCase(createTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Failed to create task";
      });
  },
});

export const { clearTask } = taskSlice.actions;
export const taskReducer = taskSlice.reducer;
