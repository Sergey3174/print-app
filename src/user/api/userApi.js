import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

import i18n from "../../../i18n.js";

export const getUserThunk = createAsyncThunk(
  "user/getUser",
  async (telegramData, { rejectWithValue }) => {
    console.log(telegramData);
    try {
      const invite = localStorage.getItem("invite");
      const { headers } = await axiosInstance.post(`/auth`, telegramData, {
        withCredentials: true,
        params: invite ? { invite } : {},
      });

      // const headers = {
      //   authorization:
      //     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTZ9.TQ8LdLiPKTME_72Dr-CjkEuZ6v58V8gtKJc92pxzMkI",
      //   "accept-language": "en",
      // };

      if (headers.authorization) {
        localStorage.setItem("authToken", headers.authorization);
        // const tokencoocie = headers.authorization.replace(/^Bearer\s+/i, "");

        // document.cookie = `access_token_cookie=${tokencoocie}; path=/; Secure; SameSite=None`;
      }

      if (headers["accept-language"]) {
        const serverLang = headers["accept-language"];
        const langMap = { en: "en_US", ru: "ru_RU" };
        const mappedLang = langMap[serverLang] || "en_US";

        if (!localStorage.getItem("userLang")) {
          localStorage.setItem("userLang", serverLang);
          i18n.changeLanguage(mappedLang);
        }
      }

      if (!telegramData.user) {
        return {
          id: telegramData.id,
          first_name: telegramData.first_name,
          last_name: telegramData?.last_name || "",
          username: telegramData?.username || "",
          language_code: "ru",
          allows_write_to_pm: true,
          photo_url: telegramData.photo_url,
        };
      }

      return telegramData?.user;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getReferralLink = createAsyncThunk(
  "user/referral",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/user/referral");
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

export const getUserThunkPwa = createAsyncThunk(
  "user/getUserPwa",
  async ({ code, state }, { rejectWithValue }) => {
    try {
      const invite = localStorage.getItem("invite");
      const { headers, data } = await axiosInstance.get(`/auth/oauth`, {
        withCredentials: true,
        params: {
          code,
          state,
          ...(invite ? { invite } : {}),
        },
      });

      // const headers = {
      //   authorization:
      //     "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTZ9.TQ8LdLiPKTME_72Dr-CjkEuZ6v58V8gtKJc92pxzMkI",
      //   "accept-language": "en",
      // };

      if (headers.authorization) {
        localStorage.setItem("authToken", headers.authorization);
        // const tokencoocie = headers.authorization.replace(/^Bearer\s+/i, "");

        // document.cookie = `access_token_cookie=${tokencoocie}; path=/; Secure; SameSite=None`;
      }

      if (headers["accept-language"]) {
        const serverLang = headers["accept-language"];
        const langMap = { en: "en_US", ru: "ru_RU" };
        const mappedLang = langMap[serverLang] || "en_US";

        if (!localStorage.getItem("userLang")) {
          localStorage.setItem("userLang", serverLang);
          i18n.changeLanguage(mappedLang);
        }
      }

      return {
        id: data?.id,
        first_name: data?.name,
        username: data?.username,
        photo_url: data?.photo,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);
