import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { MapPin, MousePointer2 } from "lucide-react";
import { getDistance } from "../../shared/lib/getDisatnce";
import { useTranslation } from "react-i18next";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const jakarta: [number, number] = [106.8456, -6.2088];
const defaultCurrentPosition: [number, number] = jakarta;

export type PrinterPoint = {
  id: string;
  position: [number, number];
  title: string;
  is_online: boolean;
};

type MapProps = {
  points: PrinterPoint[];
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
  points,
  isExpanded,
  selectedPoint,
  onNearestPointChange,
  onSelectPoint,
}: MapProps) {
  const { t } = useTranslation();
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const defaultMarker = useRef<mapboxgl.Marker | null>(null);
  const pointMarkers = useRef<Map<string, mapboxgl.Marker>>(
    new globalThis.Map(),
  );

  const [userPosition, setUserPosition] = useState<[number, number] | null>(
    null,
  );
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

    const defaultPopup = new mapboxgl.Popup(popupOptions).setText(
      t("map.defaultLocation"),
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
  }, [t]);

  useEffect(() => {
    if (!map.current) return;

    pointMarkers.current.forEach((marker) => marker.remove());
    pointMarkers.current.clear();

    const popupOptions = { offset: 25, focusAfterOpen: false };

    points.forEach((point) => {
      const popup = new mapboxgl.Popup(popupOptions).setText(point.title);
      const markerInstance = new mapboxgl.Marker()
        .setLngLat(point.position)
        .setPopup(popup)
        .addTo(map.current!);

      markerInstance.getElement().addEventListener("click", () => {
        onSelectPoint(point);
      });
      pointMarkers.current.set(point.id, markerInstance);
    });
  }, [onSelectPoint, points]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPosition([pos.coords.longitude, pos.coords.latitude]);
      },
      (error) => console.log("Geolocation denied:", error),
      { enableHighAccuracy: true, timeout: 30000 },
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

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
      t("map.youAreHere"),
    );
    userMarker.current = new mapboxgl.Marker({ color: "#2563eb" })
      .setLngLat(userPosition)
      .setPopup(popup)
      .addTo(map.current);
  }, [t, userPosition]);

  const currentPosition = userPosition ?? defaultCurrentPosition;

  const nearestPoint = useMemo(() => {
    if (!points.length) {
      return null;
    }

    return points.reduce((nearest, marker) => {
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
  }, [currentPosition, points]);

  const nearestDistance = useMemo(() => {
    if (!nearestPoint) {
      return 0;
    }

    return getDistance(
      currentPosition[1],
      currentPosition[0],
      nearestPoint.position[1],
      nearestPoint.position[0],
    );
  }, [currentPosition, nearestPoint]);

  const activePoint =
    nearestPoint && selectedPoint && selectedPoint.id !== nearestPoint.id
      ? selectedPoint
      : nearestPoint;

  const activeDistance = useMemo(() => {
    if (!activePoint) {
      return 0;
    }

    return getDistance(
      currentPosition[1],
      currentPosition[0],
      activePoint.position[1],
      activePoint.position[0],
    );
  }, [activePoint, currentPosition]);

  useEffect(() => {
    if (!nearestPoint) return;

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
              <span className="font-normal">{t("map.printerAt")}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1 overflow-hidden">
              <div className="flex shrink-0 items-center gap-1">
                <MapPin size={16} />
                {activeDistance.toFixed(1)} km
              </div>
              <span className="shrink-0">|</span>
              <div className="truncate">
                {activePoint?.title ?? t("map.defaultLocation")}
              </div>
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
    </div>
  );
}
