import axios from "axios";
import { useEffect, useRef, useState } from "react";

const LOCATION_STORAGE_KEY = "location";

function readStoredCity() {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem(LOCATION_STORAGE_KEY);
}

type UseResolvedCityOptions = {
  serverCity?: string | null;
  enabled?: boolean;
  onResolvedCity?: (city: string) => void | Promise<void>;
};

export function useResolvedCity({
  serverCity,
  enabled = true,
  onResolvedCity,
}: UseResolvedCityOptions) {
  const [resolvedCity, setResolvedCity] = useState<string | null>(readStoredCity);
  const syncedCityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (serverCity) {
      syncedCityRef.current = serverCity;
      setResolvedCity(serverCity);
      localStorage.setItem(LOCATION_STORAGE_KEY, serverCity);
      return;
    }

    if (resolvedCity) {
      if (syncedCityRef.current === resolvedCity) {
        return;
      }

      syncedCityRef.current = resolvedCity;
      void onResolvedCity?.(resolvedCity);
      return;
    }

    const loadLocation = async () => {
      try {
        const { data } = await axios.get<{ city?: string }>(
          "https://ipapi.co/json/",
        );
        const city = data.city?.trim();

        if (!city) {
          return;
        }

        localStorage.setItem(LOCATION_STORAGE_KEY, city);
        setResolvedCity(city);
      } catch (error) {
        console.error("Failed to resolve city", error);
      }
    };

    void loadLocation();
  }, [enabled, onResolvedCity, resolvedCity, serverCity]);

  return { resolvedCity };
}
