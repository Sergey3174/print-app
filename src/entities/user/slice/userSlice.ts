import { createSlice } from "@reduxjs/toolkit";
import { getUserThunkPwa, type UserInfo } from "../api/userApi";

type UserState = {
  user: UserInfo | null;
  isLoading: boolean;
  error: string | null;
  isAuth: boolean;
  isInitialized: boolean;
};

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
  isInitialized: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.isAuth = false;
      state.error = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      localStorage.removeItem("location");
      localStorage.removeItem("pwa-hide-install");
    },
    initializeUserFromStorage: (state) => {
      const authToken = localStorage.getItem("authToken");
      const userInfo = localStorage.getItem("userInfo");

      if (authToken && userInfo) {
        state.isAuth = true;
        state.user = JSON.parse(userInfo);
      }

      state.isInitialized = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserThunkPwa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserThunkPwa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        localStorage.setItem("userInfo", JSON.stringify(action.payload));
        state.isAuth = true;
        state.isInitialized = true;
      })
      .addCase(getUserThunkPwa.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          typeof action.payload === "string"
            ? action.payload
            : "Failed to load user";
        state.isInitialized = true;
      });
  },
});

export const { clearUser, initializeUserFromStorage } = userSlice.actions;
export const userReducer = userSlice.reducer;
