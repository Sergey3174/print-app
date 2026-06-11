import { createSlice } from "@reduxjs/toolkit";
import { getReferralLink, getUserThunk, getUserThunkPwa } from "../api/userApi";

const initialState = {
  user: null,
  isLoading: false,
  error: null,
  isAuth: false,
  referral_code: null,
  referral_link: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
    },
    initializeUserFromStorage: (state) => {
      const userData = localStorage.getItem("userData");
      const authToken = localStorage.getItem("authToken");
      if (userData && authToken) {
        try {
          state.user = JSON.parse(userData);
          state.isAuth = true;
        } catch (error) {
          console.error("Error parsing user data from localStorage:", error);
          localStorage.removeItem("userData");
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      //getUserThunk
      .addCase(getUserThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem("userData", JSON.stringify(action.payload));
      })
      .addCase(getUserThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Ошибка при загрузке пользователя";
      })
      //getUserThunkPwa
      .addCase(getUserThunkPwa.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserThunkPwa.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuth = true;
        // Сохраняем данные пользователя в localStorage
        localStorage.setItem("userData", JSON.stringify(action.payload));
      })
      .addCase(getUserThunkPwa.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Ошибка при загрузке пользователя";
      })
      //getReferralLink
      .addCase(getReferralLink.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getReferralLink.fulfilled, (state, action) => {
        state.referral_code = action.payload?.referral_code;
        state.referral_link = action.payload?.referral_link;
        state.isLoading = false;
      })
      .addCase(getReferralLink.rejected, (state, action) => {
        state.isLoading = false;
        state.error =
          action.payload || "Ошибка при получении реферальной ссылки";
      });
  },
});

export const { setUser, clearUser, initializeUserFromStorage } =
  userSlice.actions;
export const userReducer = userSlice.reducer;
