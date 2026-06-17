import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "./i18n.ts";

// function syncAppViewportHeight() {
//   document.documentElement.style.setProperty(
//     "--app-height",
//     `${window.innerHeight}px`,
//   );
// }

// syncAppViewportHeight();

// window.addEventListener("resize", syncAppViewportHeight, { passive: true });
// window.visualViewport?.addEventListener("resize", syncAppViewportHeight, {
//   passive: true,
// });
// window.visualViewport?.addEventListener("scroll", syncAppViewportHeight, {
//   passive: true,
// });

if ("serviceWorker" in navigator) {
  const swUrl = import.meta.env.DEV
    ? "/dev-sw.js?dev-sw"
    : `/sw.js?v=${encodeURIComponent(__SW_VERSION__)}`;
  const swType: WorkerType = import.meta.env.DEV ? "module" : "classic";

  void navigator.serviceWorker
    .register(swUrl, {
      scope: "/",
      type: swType,
    })
    .then((registration) => registration.update())
    .catch((error) => {
      console.error("Service worker registration failed", error);
    });
}

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App />,
  // </StrictMode>,
);
