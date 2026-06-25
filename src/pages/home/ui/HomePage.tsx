import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Printer } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { Map, type PrinterPoint } from "../../../widgets/map/Map";
import { getDistance } from "../../../shared/lib/getDisatnce";
import { type AppDispatch, type RootState } from "../../../app/store/store";
import {
  clearSelectedPrinter,
  setSelectedPrinter,
} from "../../../entities/printer/store/selectedPrinterSlice";
import { PrintHistorySection } from "./PrintHistorySection";

export type WaterAmount = number;

export function HomePage() {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const printers = useSelector(
    (state: RootState) => state.printers.data?.printers ?? [],
  );
  const selectedPrinter = useSelector(
    (state: RootState) => state.selectedPrinter.printer,
  );

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
                        ? "border-[#1d4ed880] bg-[#1d4ed820]"
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

          <PrintHistorySection dateLocale={dateLocale} t={t} />
        </div>
      </div>
    </section>
  );
}
