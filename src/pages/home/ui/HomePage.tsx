import { useCallback, useMemo, useState } from "react";
import { Clock3, File, MapPin } from "lucide-react";
import {
  Map,
  printerPoints,
  type PrinterPoint,
} from "../../../widgets/map/Map";
import { useRecentFiles } from "../../../widgets/app-layout/model/recentFilesContext";
import { getDistance } from "../../../shared/lib/getDisatnce";

export type WaterAmount = number;
const PRINT_PRICE_PER_PAGE = 2;

function FileIcon() {
  return (
    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center shrink-0">
      <svg width="24" height="24" viewBox="0 0 20 24" fill="none">
        <path
          d="M2 0h11l7 7v15a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2z"
          fill="#c5d0e0"
        />
        <path d="M13 0l7 7h-5a2 2 0 0 1-2-2V0z" fill="#a0b0c8" />
        <rect x="4" y="12" width="12" height="1.5" rx="0.75" fill="#8899b0" />
        <rect x="4" y="15" width="9" height="1.5" rx="0.75" fill="#8899b0" />
      </svg>
    </div>
  );
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
      nearestPoint.position[1],
      nearestPoint.position[0],
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
          basePosition[0],
          basePosition[1],
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
    <section
      className={`flex flex-col flex-1 w-full min-h-0 overflow-hidden bg-white pb-18`}
    >
      <Map
        isExpanded={isMapExpanded}
        selectedPoint={selectedPoint}
        onToggleExpanded={() => setIsMapExpanded((prev) => !prev)}
        onNearestPointChange={handleNearestPointChange}
        onSelectPoint={setSelectedPoint}
      />

      <div className="min-h-0 flex-1 overflow-auto px-4 pt-5">
        {isMapExpanded ? (
          <>
            <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
              <span className="text-[15px]">
                <Clock3 size={16} />
              </span>
              Nearby Print Points
            </p>

            <div className="flex flex-col gap-3 pb-4">
              {printerCards.map(({ point, distance }) => {
                const isSelected = selectedPoint?.id === point.id;

                return (
                  <button
                    key={point.id}
                    type="button"
                    onClick={() => setSelectedPoint(point)}
                    className={`flex items-center justify-between border-b border-gray-200  px-1 py-3 text-left transition ${
                      isSelected ? " bg-gray-50 rounded-xl" : " bg-white"
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {point.title}
                        </p>
                        <div className="flex items-center gap-3 text-sm font-medium ">
                          {/* {isNearest && <span>Nearest</span>} */}
                          <span className="flex items-center gap-1">
                            <MapPin size={12} />
                            {Math.round(distance * 1000)} mtrs
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="ml-3 rounded-full bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
                      Go
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <p className="mb-3 flex items-center gap-1.5 text-[13px] font-semibold text-gray-900">
              <span className="text-[15px]">
                <File size={16} />
              </span>
              History
            </p>

            <div className="flex flex-col">
              {recentFiles.length ? (
                recentFiles.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 border-b border-gray-100 py-3"
                  >
                    <FileIcon />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {doc.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {doc.type} · {doc.pages}{" "}
                        {doc.pages === 1 ? "Page" : "Pages"}
                      </p>
                    </div>

                    <p className="shrink-0 px-5 py-2 font-bold">
                      ${doc.pages * PRINT_PRICE_PER_PAGE}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  No print history yet.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
