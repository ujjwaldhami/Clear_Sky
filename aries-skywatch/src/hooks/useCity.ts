import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const DEFAULT_CITY = "Delhi";
const STORAGE_KEY = "aries-clearsky-city";

export function useCity() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCity = searchParams.get("city");

  const [city, setCity] = useState<string>(
    urlCity ||
      localStorage.getItem(STORAGE_KEY) ||
      DEFAULT_CITY
  );

  useEffect(() => {
    setSearchParams({ city }, { replace: true });
    localStorage.setItem(STORAGE_KEY, city);
  }, [city, setSearchParams]);

  useEffect(() => {
    if (urlCity && urlCity !== city) {
      setCity(urlCity);
    }
  }, [urlCity]);

  return [city, setCity] as const;
}
