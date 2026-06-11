import { configureStore } from "@reduxjs/toolkit";
import { userReducer } from "../../entities/user/slice/userSlice";
import { todayReducer } from "../../entities/waterToday/slice/todaySlice";
import { waterProfileReducer } from "../../entities/waterProfile/slice/waterProfileSlice";

export const store = configureStore({
  reducer: {
    user: userReducer,
    today: todayReducer,
    waterProfile: waterProfileReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
