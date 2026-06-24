import { useCallback, useEffect, useMemo, useState } from "react";
import { FileText, MapPin, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Map, type PrinterPoint } from "../../../widgets/map/Map";
import { usePrinters } from "../../../hooks/usePrinters";
import { useRecentFiles } from "../../../widgets/app-layout/model/recentFilesContext";
import { getDistance } from "../../../shared/lib/getDisatnce";
import { formatCurrency } from "../../../shared/lib/formatCurrency";
import { type AppDispatch, type RootState } from "../../../app/store/store";
import {
  clearSelectedPrinter,
  setSelectedPrinter,
} from "../../../entities/printer/store/selectedPrinterSlice";

export type WaterAmount = number;

const PRINT_PRICE_PER_PAGE = 2000;

function formatHistoryDate(
  timestamp: number,
  locale: string,
  todayLabel: string,
  yesterdayLabel: string,
) {
  const diffMs = Date.now() - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs < oneDay) {
    return todayLabel;
  }

  if (diffMs < oneDay * 2) {
    return yesterdayLabel;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
  }).format(timestamp);
}

function getHistoryBadge(type: string) {
  if (type === "PDF" || type === "DOCX" || type === "DOC") {
    return {
      label: type,
      className: "bg-emerald-100 text-emerald-700",
      icon: <FileText size={14} />,
    };
  }

  return {
    label: type,
    className: "bg-indigo-100 text-indigo-700",
    icon: <Printer size={14} />,
  };
}

function getPrintMode(type: string, colorLabel: string, bwLabel: string) {
  if (["JPG", "JPEG", "PNG", "WEBP"].includes(type)) {
    return colorLabel;
  }

  return bwLabel;
}

export function HomePage() {
  const { t, i18n } = useTranslation();
  const { printers } = usePrinters();
  const dispatch = useDispatch<AppDispatch>();
  const selectedPrinter = useSelector(
    (state: RootState) => state.selectedPrinter.printer,
  );
  const { recentFiles } = useRecentFiles();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [nearestPoint, setNearestPoint] = useState<PrinterPoint | null>(null);
  const [nearestDistance, setNearestDistance] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);

  const dateLocale = i18n.resolvedLanguage === "id_ID" ? "id-ID" : "en-US";

  const printerPoints = useMemo<PrinterPoint[]>(
    () =>
      printers.map((printer) => ({
        id: printer.pid,
        position: [printer.longitude, printer.latitude],
        title: printer.name,
        is_online: printer.is_online,
      })),
    [printers],
  );

  const selectedPoint = useMemo(
    () =>
      selectedPrinter
        ? (printerPoints.find((point) => point.id === selectedPrinter.pid) ??
          null)
        : null,
    [printerPoints, selectedPrinter],
  );

  useEffect(() => {
    if (!selectedPrinter) {
      return;
    }

    const hasSelectedPrinter = printers.some(
      (printer) => printer.pid === selectedPrinter.pid,
    );

    if (!hasSelectedPrinter) {
      dispatch(clearSelectedPrinter());
    }
  }, [dispatch, printers, selectedPrinter]);

  const printerCards = useMemo(() => {
    if (!nearestPoint) return [];

    const basePosition: [number, number] = currentPosition ?? [
      nearestPoint.position[0],
      nearestPoint.position[1],
    ];

    const nearestCard = {
      point: nearestPoint,
      distance: nearestDistance,
      isNearest: true,
    };

    const otherCards = printerPoints
      .filter((point) => point.id !== nearestPoint.id)
      .map((point) => ({
        point,
        distance: getDistance(
          basePosition[1],
          basePosition[0],
          point.position[1],
          point.position[0],
        ),
        isNearest: false,
      }))
      .sort((a, b) => a.distance - b.distance);

    return [nearestCard, ...otherCards];
  }, [currentPosition, nearestDistance, nearestPoint]);

  const handleNearestPointChange = useCallback(
    (point: PrinterPoint, distance: number, position: [number, number]) => {
      setNearestPoint((prev) => (prev?.id === point.id ? prev : point));
      setNearestDistance((prev) => (prev === distance ? prev : distance));
      setCurrentPosition((prev) =>
        prev && prev[0] === position[0] && prev[1] === position[1]
          ? prev
          : position,
      );
    },
    [],
  );

  const handleSelectPoint = useCallback(
    (point: PrinterPoint) => {
      const printer = printers.find((item) => item.pid === point.id);

      if (!printer) {
        return;
      }

      dispatch(setSelectedPrinter(printer));
    },
    [dispatch, printers],
  );

  return (
    <section className="flex w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-20">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          <div className="overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_28px_rgba(17,24,39,0.08)]">
            <Map
              points={printerPoints}
              isExpanded={isMapExpanded}
              selectedPoint={selectedPoint}
              onToggleExpanded={() => setIsMapExpanded((prev) => !prev)}
              onNearestPointChange={handleNearestPointChange}
              onSelectPoint={handleSelectPoint}
            />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#101828]">
                {t("home.nearbyPrintPoints")}
              </h2>

              <button
                type="button"
                onClick={() => setIsMapExpanded((prev) => !prev)}
                className="shrink-0 text-xs font-semibold uppercase leading-none tracking-[0.14em] text-[#1d4ed8]"
              >
                {isMapExpanded ? t("home.collapseMap") : t("home.viewMap")}
              </button>
            </div>

            <div className="flex flex-col gap-1.5">
              {printerCards.map(({ point, distance, isNearest }) => {
                const isSelected = selectedPoint?.id === point.id;
                const distanceLabel =
                  distance < 1
                    ? `${Math.round(distance * 1000)} m`
                    : `${distance.toFixed(1)} km`;

                return (
                  <button
                    key={point.id}
                    type="button"
                    tabIndex={-1}
                    onPointerDown={(event) => event.preventDefault()}
                    onTouchStart={(event) => event.preventDefault()}
                    onMouseDown={(event) => event.preventDefault()}
                    onFocus={(event) => event.currentTarget.blur()}
                    onClick={() => handleSelectPoint(point)}
                    className={`flex items-center gap-4 rounded-[12px] border px-3 py-3 text-left shadow-[0_4px_12px_rgba(26,35,126,0.08)] transition ${
                      isSelected
                        ? "border-[#c6c5d4] bg-[#f5f3f3]"
                        : "border-transparent bg-white"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
                        isNearest
                          ? "bg-[#dbe5ff] text-[#1d4ed8]"
                          : "bg-[#f2f4f7] text-[#667085]"
                      }`}
                    >
                      <Printer size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-[#1b1c1c]">
                        {point.title}
                      </p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-[#454652]">
                        <MapPin size={12} />
                        {isNearest
                          ? t("home.nearestPrinter")
                          : t("home.printerPoint")}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`text-xs font-bold ${
                          point.is_online ? "text-[#006876]" : "text-[#454652]"
                        }`}
                      >
                        {distanceLabel}
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          point.is_online ? "text-[#006876]" : "text-[#ba1a1a]"
                        }`}
                      >
                        {point.is_online ? t("home.online") : t("home.offline")}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              {/* <Clock3 size={18} className="text-[#667085]" /> */}
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#101828]">
                {t("home.printHistory")}
              </h2>
            </div>

            {recentFiles.length ? (
              <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-24">
                {recentFiles.map((doc) => {
                  const badge = getHistoryBadge(doc.type);
                  const printMode = getPrintMode(
                    doc.type,
                    t("home.color"),
                    t("home.bw"),
                  );

                  return (
                    <article
                      key={doc.id}
                      className="min-w-[280px] snap-start rounded-[22px] border border-black/5 bg-white p-4 shadow-[0_6px_22px_rgba(17,24,39,0.06)]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[#1a237e]">{badge.icon}</span>
                          <span
                            className={`rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        </div>
                        <span className="text-xs text-[#667085]">
                          {formatHistoryDate(
                            doc.createdAt,
                            dateLocale,
                            t("home.today"),
                            t("home.yesterday"),
                          )}
                        </span>
                      </div>

                      <h3 className="mt-4 truncate text-base font-semibold text-[#101828]">
                        {doc.title}
                      </h3>

                      <div className="mt-4 flex items-center justify-between border-t border-black/6 pt-3">
                        <span className="text-xs text-[#667085]">
                          {t("common.pages", { count: doc.pages })} /{" "}
                          {printMode}
                        </span>
                        <span className="text-lg font-bold text-[#1a237e]">
                          {formatCurrency(doc.pages * PRINT_PRICE_PER_PAGE)}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-black/10 bg-white px-5 py-10 text-center text-sm text-[#667085]">
                {t("home.noPrintHistory")}
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
