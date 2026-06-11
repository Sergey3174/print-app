import { createAsyncThunk } from "@reduxjs/toolkit";
import { axiosInstance } from "../../../shared/lib/axiosInstance";

type GetUserThunkPwaArgs = {
  code: string;
  state: string;
};

export type UserInfo = {
  id: number;
  role: number;
  tg_id: number;
  name: string;
  username: string;
  photo: string;
};

type GetUserResponse = {
  user: UserInfo;
};

// const mockData = {
//   user: {
//     id: 2,
//     role: 0,
//     tg_id: 235297144,
//     name: "Alexandr",
//     username: "qualienty",
//     photo:
//       "https://t.me/i/userpic/320/PYAbF4lBe38W0fplzZMYwYW3GFU5ho9hrM2z3nMO6ek.jpg",
//   },
// };

export const getUserThunkPwa = createAsyncThunk<
  UserInfo,
  GetUserThunkPwaArgs,
  { rejectValue: string }
>(
  "user/getUserPwa",
  async ({ code, state }: GetUserThunkPwaArgs, { rejectWithValue }) => {
    try {
      const { headers, data } = await axiosInstance.get<GetUserResponse>(
        `/api/oauth`,
        {
          withCredentials: true,
          params: {
            code,
            state,
          },
        },
      );

      if (headers.authorization) {
        localStorage.setItem("authToken", headers.authorization);
      }

      return data.user;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }

      return rejectWithValue("Authentication failed");
    }
  },
);
