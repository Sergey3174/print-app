import { configureStore } from "@reduxjs/toolkit";
// import { userReducer } from "../../entities/user/slice/userSlice";
// import { todayReducer } from "../../entities/waterToday/slice/todaySlice";
// import { waterProfileReducer } from "../../entities/waterProfile/slice/waterProfileSlice";
import { selectedPrinterReducer } from "../../entities/printer/store/selectedPrinterSlice";
import { printersReducer } from "../../entities/printer/store/printersSlice";
import { taskReducer } from "../../entities/task/store/taskSlice";

export const store = configureStore({
  reducer: {
    // user: userReducer,
    // today: todayReducer,
    // waterProfile: waterProfileReducer,
    printers: printersReducer,
    selectedPrinter: selectedPrinterReducer,
    task: taskReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
