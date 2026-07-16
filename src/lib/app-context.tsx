"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { TemperatureUnit } from "./weather";

export type SelectedLocation = { name: string; lat: number; lon: number };

const LOCATION_KEY = "weather:location";
const UNIT_KEY = "weather:unit";

type LocationContextValue = {
  location: SelectedLocation | null;
  setLocation: (loc: SelectedLocation) => void;
};

type UnitsContextValue = {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);
const UnitsContext = createContext<UnitsContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [location, setLocationState] = useState<SelectedLocation | null>(null);
  const [unit, setUnitState] = useState<TemperatureUnit>("C");

  useEffect(() => {
    try {
      const storedLocation = localStorage.getItem(LOCATION_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage is only readable client-side, after mount
      if (storedLocation) setLocationState(JSON.parse(storedLocation));
      const storedUnit = localStorage.getItem(UNIT_KEY) as TemperatureUnit | null;
      if (storedUnit) setUnitState(storedUnit);
    } catch {
      // ignore malformed localStorage state
    }
  }, []);

  function setLocation(loc: SelectedLocation) {
    setLocationState(loc);
    localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
  }

  function setUnit(next: TemperatureUnit) {
    setUnitState(next);
    localStorage.setItem(UNIT_KEY, next);
  }

  return (
    <LocationContext.Provider value={{ location, setLocation }}>
      <UnitsContext.Provider value={{ unit, setUnit }}>{children}</UnitsContext.Provider>
    </LocationContext.Provider>
  );
}

export function useSelectedLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useSelectedLocation must be used within AppProviders");
  return ctx;
}

export function useUnits() {
  const ctx = useContext(UnitsContext);
  if (!ctx) throw new Error("useUnits must be used within AppProviders");
  return ctx;
}
