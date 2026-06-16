import { useEffect, useRef, useState } from "react";
import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  NotFoundException,
} from "@zxing/library";
import { ArrowLeft, Camera, CheckCircle2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useRecentFiles } from "../../widgets/app-layout/model/recentFilesContext";

const REAR_CAMERA_PATTERNS = [
  /back/i,
  /rear/i,
  /environment/i,
  /world/i,
  /основ/i,
  /задн/i,
];

const WIDE_CAMERA_PATTERNS = [
  /wide/i,
  /ultra/i,
  /uw/i,
  /0\.5x/i,
  /0,5x/i,
  /широк/i,
];

function getCameraScore(device: MediaDeviceInfo) {
  const label = device.label || "";
  let score = 0;
  const cameraNumberMatch = label.match(/camera\s+(\d+)/i);
  const cameraNumber = cameraNumberMatch
    ? Number.parseInt(cameraNumberMatch[1], 10)
    : null;

  if (REAR_CAMERA_PATTERNS.some((pattern) => pattern.test(label))) {
    score += 10;
  }

  if (WIDE_CAMERA_PATTERNS.some((pattern) => pattern.test(label))) {
    score -= 20;
  }

  if (cameraNumber === 0) {
    score += 15;
  } else if (cameraNumber !== null) {
    score -= cameraNumber;
  }

  return score;
}

async function getPreferredCamera() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    return null;
  }

  let permissionStream: MediaStream | null = null;

  try {
    permissionStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
      audio: false,
    });

    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoInputs = devices.filter(
      (device) => device.kind === "videoinput",
    );

    if (!videoInputs.length) {
      return null;
    }

    const sorted = [...videoInputs].sort(
      (first, second) => getCameraScore(second) - getCameraScore(first),
    );

    return sorted[0] ?? null;
  } catch {
    return null;
  } finally {
    permissionStream?.getTracks().forEach((track) => track.stop());
  }
}

export function PrinterScanner() {
  const navigate = useNavigate();
  const { activeRecentFile } = useRecentFiles();

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const hasHandledResultRef = useRef(false);

  const [statusText, setStatusText] = useState("Preparing camera");
  const [cameraLabel, setCameraLabel] = useState("");
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const stopScanner = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const goToPreview = (printerQr?: string) => {
    navigate("/app/preview", {
      state: printerQr ? { printerQr } : undefined,
    });
  };

  const startScanner = async () => {
    stopScanner();
    setScannerError(null);
    setScanResult(null);
    setIsCameraReady(false);
    setCameraLabel("");
    setStatusText("Requesting camera access");
    hasHandledResultRef.current = false;

    if (!activeRecentFile?.file) {
      toast.error("No file selected yet. Please upload a document first.");
      navigate("/app");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      const errorMessage = "Camera is not supported on this device.";
      setScannerError(errorMessage);
      setStatusText("Camera unavailable");
      toast.error(errorMessage);
      return;
    }

    try {
      const preferredCamera = await getPreferredCamera();
      const stream = preferredCamera
        ? await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: preferredCamera.deviceId },
            },
            audio: false,
          })
        : await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: "environment" },
            },
            audio: false,
          });

      streamRef.current = stream;

      if (!videoRef.current) {
        return;
      }

      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      const activeTrack = stream.getVideoTracks()[0];
      const resolvedCameraLabel =
        preferredCamera?.label || activeTrack?.label || "";

      setCameraLabel(resolvedCameraLabel);
      setStatusText("Point the camera at the printer QR code");
      setIsCameraReady(true);

      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
      codeReaderRef.current = new BrowserMultiFormatReader(hints);

      await codeReaderRef.current.decodeFromVideoDevice(
        preferredCamera?.deviceId ?? null,
        videoRef.current,
        (result, error) => {
          if (result && !hasHandledResultRef.current) {
            const qrValue = result.getText().trim();

            if (!qrValue) {
              return;
            }

            hasHandledResultRef.current = true;
            setScanResult(qrValue);
            setStatusText("Printer found");
            setScannerError(null);
            toast.success("Printer QR scanned successfully.");
            stopScanner();
            window.setTimeout(() => goToPreview(qrValue), 500);
            return;
          }

          if (error && !(error instanceof NotFoundException)) {
            setScannerError(
              "Unable to recognize the QR code. Try moving the camera closer.",
            );
            setStatusText("Scanner is active");
          }
        },
      );
    } catch {
      const errorMessage =
        "Unable to open the camera. Check permissions and try again.";
      setScannerError(errorMessage);
      setStatusText("Camera unavailable");
      toast.error(errorMessage);
    }
  };

  useEffect(() => {
    void startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  return (
    <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-black text-white">
      <video
        ref={videoRef}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
          isCameraReady ? "opacity-100" : "opacity-0"
        }`}
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,transparent_18%,rgba(26,35,126,0.24)_42%,rgba(5,8,22,0.76)_100%)]" />
      {/* <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,22,0.72),rgba(5,8,22,0.18)_35%,rgba(5,8,22,0.68))]" /> */}

      <div className="relative z-10 flex h-full min-h-[100dvh] flex-col">
        <header className="flex h-16 shrink-0 items-center border-b border-white/10 bg-[#1a237e]/35 px-4 backdrop-blur-xl">
          <button
            type="button"
            aria-label="Back"
            onClick={() => {
              stopScanner();
              navigate("/app");
            }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="flex-1 pr-10 text-center text-[20px] font-semibold">
            Scanner
          </h1>
        </header>

        <main className="relative flex flex-1 flex-col items-center justify-center px-4 pb-10 pt-6">
          <div className="absolute top-6 left-1/2 w-full max-w-[320px] -translate-x-1/2 px-4 text-center">
            <p className="inline-flex rounded-full border border-white/20 bg-[#1a237e]/75 px-4 py-2 text-sm leading-5 text-white shadow-lg backdrop-blur-md">
              Point the camera at the printer QR code
            </p>
          </div>

          <div className="relative mt-10 flex-1 flex w-full max-w-[320px] items-center justify-center">
            <div className="absolute inset-0 rounded-[34px] bg-[#58e6ff]/15 blur-2xl" />

            <div className="relative h-[280px] w-[280px] overflow-hidden rounded-[28px] border border-white/25 bg-transparent shadow-[0_0_0_999px_rgba(26,35,126,0.34)]">
              {!scanResult ? (
                <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,#58e6ff,transparent)] shadow-[0_0_20px_rgba(88,230,255,0.9)] animate-[scannerSweep_2.5s_ease-in-out_infinite]" />
              ) : null}

              <div className="absolute left-0 top-0 h-10 w-10 rounded-tl-[28px] border-l-4 border-t-4 border-white " />
              <div className="absolute right-0 top-0 h-10 w-10 rounded-tr-[28px] border-r-4 border-t-4 border-white " />
              <div className="absolute bottom-0 left-0 h-10 w-10 rounded-bl-[28px] border-b-4 border-l-4 border-white " />
              <div className="absolute bottom-0 right-0 h-10 w-10 rounded-br-[28px] border-b-4 border-r-4 border-white " />

              {!isCameraReady ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55">
                  <Camera size={30} className="text-[#58e6ff]" />
                  <p className="px-6 text-center text-sm text-white/80">
                    {statusText}
                  </p>
                </div>
              ) : null}

              {scanResult ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#0e172f]/72 backdrop-blur-sm">
                  <CheckCircle2 size={38} className="text-[#58e6ff]" />
                  <p className="text-sm font-semibold text-white">
                    QR code detected
                  </p>
                  <p className="max-w-[220px] break-all px-4 text-center text-xs text-white/70">
                    {scanResult}
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="mt-8 w-full max-w-xs space-y-3">
            <button
              type="button"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-white text-base font-semibold text-[#1a237e] shadow-xl transition active:scale-95"
              onClick={() => {
                stopScanner();
                goToPreview();
              }}
            >
              <RefreshCw
                size={18}
                className={!scanResult ? "animate-spin" : undefined}
              />
              {scanResult ? "Opening preview" : "Recognition in progress"}
            </button>

            {/* <div className="rounded-2xl border border-white/12 bg-white/8 px-4 py-3 backdrop-blur-md"> */}
            {/* <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
                Selected camera
              </p>
              <p className="mt-2 text-sm text-white/88">
                {cameraLabel || "Choosing the best rear camera automatically"}
              </p> */}
            {scannerError ? (
              <p className="mt-2 text-xs leading-5 text-[#f4b4b4]">
                {scannerError}
              </p>
            ) : null}
            {/* </div> */}

            {/* <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => void startScanner()}
                className="h-12 rounded-xl border border-white/20 bg-white/10 text-sm font-semibold text-white transition active:scale-95"
              >
                Retry scan
              </button>
              <button
                type="button"
                onClick={() => {
                  stopScanner();
                  goToPreview();
                }}
                className="h-12 rounded-xl bg-[#1a237e] text-sm font-semibold text-white shadow-[0_16px_28px_rgba(26,35,126,0.32)] transition active:scale-95"
              >
                Open preview
              </button>
            </div> */}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes scannerSweep {
          0% { transform: translateY(0); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(276px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
