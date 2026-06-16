import { useCallback, useMemo, useState } from "react";
import { Clock3, FileText, MapPin, Printer } from "lucide-react";
import {
  Map,
  printerPoints,
  type PrinterPoint,
} from "../../../widgets/map/Map";
import { useRecentFiles } from "../../../widgets/app-layout/model/recentFilesContext";
import { getDistance } from "../../../shared/lib/getDisatnce";
import { formatCurrency } from "../../../shared/lib/formatCurrency";

export type WaterAmount = number;

const PRINT_PRICE_PER_PAGE = 2000;

function formatHistoryDate(timestamp: number) {
  const diffMs = Date.now() - timestamp;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diffMs < oneDay) {
    return "Today";
  }

  if (diffMs < oneDay * 2) {
    return "Yesterday";
  }

  return new Intl.DateTimeFormat("en-US", {
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

function getPrintMode(type: string) {
  if (["JPG", "JPEG", "PNG", "WEBP"].includes(type)) {
    return "Color";
  }

  return "B&W";
}

export function HomePage() {
  const { recentFiles } = useRecentFiles();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<PrinterPoint | null>(null);
  const [nearestPoint, setNearestPoint] = useState<PrinterPoint | null>(null);
  const [nearestDistance, setNearestDistance] = useState(0);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);

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

  return (
    <section className="flex w-full flex-1 flex-col overflow-hidden bg-[linear-gradient(135deg,#fbf9f8_0%,#e0e0ff_100%)]">
      <div className="min-h-0 flex-1 overflow-auto px-4 pt-20">
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-6">
          <div className="overflow-hidden rounded-[22px] border border-black/5 bg-white shadow-[0_8px_28px_rgba(17,24,39,0.08)]">
            <Map
              isExpanded={isMapExpanded}
              selectedPoint={selectedPoint}
              onToggleExpanded={() => setIsMapExpanded((prev) => !prev)}
              onNearestPointChange={handleNearestPointChange}
              onSelectPoint={setSelectedPoint}
            />
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-[22px] font-bold leading-none tracking-[-0.02em] text-[#101828]">
                Nearby Print Points
              </h2>

              <button
                type="button"
                onClick={() => setIsMapExpanded((prev) => !prev)}
                className="shrink-0 text-xs font-semibold uppercase leading-none tracking-[0.14em] text-[#1d4ed8]"
              >
                {isMapExpanded ? "Collapse Map" : "View Map"}
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
                    onClick={() => setSelectedPoint(point)}
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
                          ? "Nearest self-service printer"
                          : "Self-service printer point"}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div
                        className={`text-xs font-bold ${
                          isNearest ? "text-[#006876]" : "text-[#454652]"
                        }`}
                      >
                        {distanceLabel}
                      </div>
                      <div
                        className={`mt-1 text-xs ${
                          isNearest ? "text-[#006876]" : "text-[#ba1a1a]"
                        }`}
                      >
                        {isNearest ? "Online" : "Offline"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock3 size={18} className="text-[#667085]" />
              <h2 className="text-[22px] font-bold tracking-[-0.02em] text-[#101828]">
                Print History
              </h2>
            </div>

            {recentFiles.length ? (
              <div className="hide-scrollbar flex snap-x gap-4 overflow-x-auto pb-24">
                {recentFiles.map((doc) => {
                  const badge = getHistoryBadge(doc.type);
                  const printMode = getPrintMode(doc.type);

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
                          {formatHistoryDate(doc.createdAt)}
                        </span>
                      </div>

                      <h3 className="mt-4 truncate text-base font-semibold text-[#101828]">
                        {doc.title}
                      </h3>

                      <div className="mt-4 flex items-center justify-between border-t border-black/6 pt-3">
                        <span className="text-xs text-[#667085]">
                          {doc.pages} {doc.pages === 1 ? "page" : "pages"} •{" "}
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
                No print history yet.
              </div>
            )}
          </section>
        </div>
      </div>
    </section>
  );
}
