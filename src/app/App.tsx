import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/auth/ui/LoginPage";
import { HomePage } from "../pages/home/ui/HomePage";
import { ProfilePage } from "../pages/profile/ui/ProfilePage";
import { StatsPage } from "../pages/stats/ui/StatsPage";
import { AppLayout } from "../widgets/app-layout/ui/AppLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { OauthPage } from "../pages/auth/ui/OauthPage";
import { Provider, useDispatch } from "react-redux";
import { initializeUserFromStorage } from "../entities/user/slice/userSlice";
import { type AppDispatch, store } from "./store/store";
import "@khmyznikov/pwa-install";
import { Preview } from "../pages/preview/Preview";
import { FullPreview } from "../pages/preview/FullPreview";
import { PaymentPreview } from "../pages/preview/PaymentPreview";
import { PrintSuccess } from "../pages/preview/PrintSuccess";
import { RecentFilesProvider } from "../widgets/app-layout/model/recentFilesContext";

function RequireAuth({ children }: { children: React.ReactNode }) {
  // const { isAuth, isInitialized } = useSelector(
  //   (state: RootState) => state.user,
  // );

  // if (!isInitialized) {
  //   return null;
  // }

  // if (!isAuth) {
  //   return <Navigate to="/login" replace />;
  // }

  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  // const { isAuth, isInitialized } = useSelector(
  //   (state: RootState) => state.user,
  // );

  // if (!isInitialized) {
  //   return null;
  // }

  // if (isAuth) {
  //   return <Navigate to="/app/today" replace />;
  // }

  return <>{children}</>;
}

function AppRouter() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeUserFromStorage());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route
          path="/login"
          element={
            <RequireGuest>
              <LoginPage />
            </RequireGuest>
          }
        />
        <Route
          path="/oauth/redirect"
          element={
            <RequireGuest>
              <OauthPage />
            </RequireGuest>
          }
        />
        <Route
          path="/oauth"
          element={
            <RequireGuest>
              <OauthPage />
            </RequireGuest>
          }
        />
        <Route
          path="/app/preview"
          element={
            <RequireAuth>
              <Preview />
            </RequireAuth>
          }
        />
        <Route
          path="/app/full-preview"
          element={
            <RequireAuth>
              <FullPreview />
            </RequireAuth>
          }
        />
        <Route
          path="/app/payment-preview"
          element={
            <RequireAuth>
              <PaymentPreview />
            </RequireAuth>
          }
        />
        <Route
          path="/app/print-success"
          element={
            <RequireAuth>
              <PrintSuccess />
            </RequireAuth>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
      </Routes>
      <ToastContainer position="top-center" autoClose={5000} />
    </BrowserRouter>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <RecentFilesProvider>
      {/* <pwa-install
        use-local-storage
        // install-description="Custom call to install text"
        disable-screenshots
        disable-screenshots-apple
        disable-screenshots-chrome
        disable-android-fallback
        name="Water tracker"
        description="Tracking water"
        icon="/android-chrome-192x192.png"
      ></pwa-install> */}
        <AppRouter />
      </RecentFilesProvider>
    </Provider>
  );
}
