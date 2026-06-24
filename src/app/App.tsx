import { useEffect } from "react";
import { Provider, useDispatch, useSelector } from "react-redux";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { HomePage } from "../pages/home/ui/HomePage";
import { AppLayout } from "../widgets/app-layout/ui/AppLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store, type AppDispatch, type RootState } from "./store/store";
import "@khmyznikov/pwa-install";
import { Preview } from "../pages/preview/Preview";
import { FullPreview } from "../pages/preview/FullPreview";
import { PaymentPreview } from "../pages/preview/PaymentPreview";
import { PrintSuccess } from "../pages/preview/PrintSuccess";
import { RecentFilesProvider } from "../widgets/app-layout/model/recentFilesContext";
import { PrinterScanner } from "../pages/printer-scanner/PrinterScanner";
import { usePrinters } from "../hooks/usePrinters";
import { setSelectedPrinter } from "../entities/printer/store/selectedPrinterSlice";

function QueryPrinterSync() {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { printers } = usePrinters();
  const selectedPrinter = useSelector(
    (state: RootState) => state.selectedPrinter.printer,
  );

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const printerPid = params.get("pid");

    if (!printerPid || !printers.length) {
      return;
    }

    const printerFromQuery =
      printers.find((printer) => printer.pid === printerPid) ?? null;

    if (!printerFromQuery || selectedPrinter?.pid === printerFromQuery.pid) {
      return;
    }

    dispatch(setSelectedPrinter(printerFromQuery));
  }, [dispatch, location.search, printers, selectedPrinter]);

  return null;
}

function RootRedirect() {
  const location = useLocation();

  return <Navigate to={`/app${location.search}`} replace />;
}

function AppRouter() {
  return (
    <BrowserRouter>
      <QueryPrinterSync />
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/app/printer-scanner" element={<PrinterScanner />} />
        <Route path="/app/preview" element={<Preview />} />
        <Route path="/app/full-preview" element={<FullPreview />} />
        <Route path="/app/payment-preview" element={<PaymentPreview />} />
        <Route path="/app/print-success" element={<PrintSuccess />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<HomePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
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
