import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, MousePointer2 } from "lucide-react";
import { getDistance } from "../../shared/lib/getDisatnce";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const jakarta: [number, number] = [106.8456, -6.2088];
const defaultCurrentPosition: [number, number] = jakarta;

export type PrinterPoint = {
  id: number;
  position: [number, number];
  title: string;
};

export const printerPoints: PrinterPoint[] = [
  { id: 2, position: [106.865, -6.1751] as [number, number], title: "Monas" },
  {
    id: 3,
    position: [106.809, -6.224] as [number, number],
    title: "South Jakarta",
  },
  { id: 4, position: [106.814, -6.137] as [number, number], title: "Old Town" },
  {
    id: 5,
    position: [106.652, -6.302] as [number, number],
    title: "West Jakarta",
  },
];

type MapProps = {
  isExpanded: boolean;
  selectedPoint: PrinterPoint | null;
  onToggleExpanded?: () => void;
  onNearestPointChange: (
    point: PrinterPoint,
    distance: number,
    currentPosition: [number, number],
  ) => void;
  onSelectPoint: (point: PrinterPoint) => void;
};

export function Map({
  isExpanded,
  selectedPoint,
  onNearestPointChange,
  onSelectPoint,
}: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const defaultMarker = useRef<mapboxgl.Marker | null>(null);
  const pointMarkers = useRef<Map<number, mapboxgl.Marker>>(
    new globalThis.Map(),
  );

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const mapViewportHeight = isExpanded
    ? "clamp(100px, calc(100vh - 350px), 350px)"
    : "clamp(75px, calc(100vh - 450px), 200px)";

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: jakarta,
      zoom: 13,
    });

    const popupOptions = { offset: 25, focusAfterOpen: false };

    printerPoints.forEach((marker) => {
      const popup = new mapboxgl.Popup(popupOptions).setText(marker.title);
      const markerInstance = new mapboxgl.Marker()
        .setLngLat(marker.position)
        .setPopup(popup)
        .addTo(map.current!);

      markerInstance.getElement().addEventListener("click", () => {
        onSelectPoint(marker);
      });
      pointMarkers.current.set(marker.id, markerInstance);
    });

    const defaultPopup = new mapboxgl.Popup(popupOptions).setText(
      "Jakarta (default location)",
    );
    defaultMarker.current = new mapboxgl.Marker({ color: "#6b7280" })
      .setLngLat(jakarta)
      .setPopup(defaultPopup)
      .addTo(map.current);

    return () => {
      pointMarkers.current.clear();
      map.current?.remove();
      map.current = null;
    };
  }, [onSelectPoint]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeolocationError("Geolocation is not supported on this device");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeolocationError(null);
        setUserPosition([pos.coords.longitude, pos.coords.latitude]);
      },
      (error) => {
        console.log("Geolocation denied:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setGeolocationError("Location access denied");
          return;
        }

        if (error.code === error.TIMEOUT) {
          setGeolocationError("Location request timed out");
          return;
        }

        setGeolocationError("Could not determine your location");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 30000 },
    );
  }, []);

  useEffect(() => {
    if (!userPosition || !map.current) return;

    defaultMarker.current?.remove();
    defaultMarker.current = null;

    map.current.flyTo({ center: userPosition, zoom: 15, duration: 2000 });

    if (userMarker.current) {
      userMarker.current.setLngLat(userPosition);
      return;
    }

    const popup = new mapboxgl.Popup({ offset: 25 }).setText("You are here");
    userMarker.current = new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat(userPosition)
      .setPopup(popup)
      .addTo(map.current);
  }, [userPosition]);

  const currentPosition = userPosition ?? defaultCurrentPosition;

  const nearestPoint = useMemo(() => {
    return printerPoints.reduce((nearest, marker) => {
      const currentDistance = getDistance(
        currentPosition[1],
        currentPosition[0],
        marker.position[1],
        marker.position[0],
      );
      const nearestDistance = getDistance(
        currentPosition[1],
        currentPosition[0],
        nearest.position[1],
        nearest.position[0],
      );

      return currentDistance < nearestDistance ? marker : nearest;
    });
  }, [currentPosition]);

  const nearestDistance = useMemo(() => {
    return getDistance(
      currentPosition[1],
      currentPosition[0],
      nearestPoint.position[1],
      nearestPoint.position[0],
    );
  }, [currentPosition, nearestPoint]);

  const activePoint =
    selectedPoint && selectedPoint.id !== nearestPoint.id
      ? selectedPoint
      : nearestPoint;

  const activeDistance = useMemo(() => {
    return getDistance(
      currentPosition[1],
      currentPosition[0],
      activePoint.position[1],
      activePoint.position[0],
    );
  }, [activePoint, currentPosition]);

  useEffect(() => {
    onNearestPointChange(nearestPoint, nearestDistance, currentPosition);
  }, [currentPosition, nearestDistance, nearestPoint, onNearestPointChange]);

  useEffect(() => {
    if (!selectedPoint || !map.current) return;

    map.current.flyTo({
      center: selectedPoint.position,
      zoom: 14,
      duration: 800,
    });
    pointMarkers.current.get(selectedPoint.id)?.togglePopup();
  }, [selectedPoint]);

  useEffect(() => {
    if (!map.current) return;

    requestAnimationFrame(() => {
      map.current?.resize();
    });
  }, [isExpanded]);

  return (
    <div className="relative shrink-0">
      <div
        style={{ height: mapViewportHeight }}
        className="overflow-hidden h-full transition-all duration-300"
      >
        <div
          ref={mapContainer}
          style={{
            width: "100%",
            height: mapViewportHeight,
          }}
        />
      </div>
      <div className="flex min-h-[40px] w-full items-center justify-between gap-3 border-b border-gray-400/20 py-1 px-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 overflow-hidden font-bold text-gray-700">
            <div className="flex shrink-0 items-center gap-1">
              <span className="font-normal">Printer at</span>
            </div>
            <div className="flex min-w-0 items-center gap-1 overflow-hidden">
              <div className="flex shrink-0 items-center gap-1">
                <MapPin size={16} />
                {activeDistance.toFixed(1)} km
              </div>
              <span className="shrink-0">|</span>
              <div className="truncate">{activePoint.title}</div>
            </div>
          </div>
        </div>

        <button
          className="shrink-0"
          onClick={() =>
            map.current?.flyTo({
              center: currentPosition,
              zoom: 15,
              duration: 1000,
            })
          }
        >
          <MousePointer2 fill="black" size={16} />
        </button>
      </div>
      {geolocationError ? (
        <div className="px-3 py-2 text-sm text-red-600">{geolocationError}</div>
      ) : null}
    </div>
  );
}
