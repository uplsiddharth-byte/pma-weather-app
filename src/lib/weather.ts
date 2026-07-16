// Open-Meteo: free, keyless geocoding + weather API. https://open-meteo.com/
// Nominatim (OSM): free, keyless reverse geocoding for "use my location".

export type GeoResult = {
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export type DailyForecastDay = {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  precipitation: number;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
};

// WMO weather interpretation codes -> human label + emoji icon
const WEATHER_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Depositing rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Dense drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Dense freezing drizzle", icon: "🌧️" },
  61: { label: "Slight rain", icon: "🌦️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌨️" },
  67: { label: "Heavy freezing rain", icon: "🌨️" },
  71: { label: "Slight snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "❄️" },
  80: { label: "Slight rain showers", icon: "🌦️" },
  81: { label: "Rain showers", icon: "🌧️" },
  82: { label: "Violent rain showers", icon: "⛈️" },
  85: { label: "Slight snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "🌨️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm w/ hail", icon: "⛈️" },
  99: { label: "Thunderstorm w/ heavy hail", icon: "⛈️" },
};

export function describeWeatherCode(code: number) {
  return WEATHER_CODES[code] ?? { label: "Unknown", icon: "❓" };
}

export class WeatherApiError extends Error {}

async function searchGeocode(name: string) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", name);
  url.searchParams.set("count", "5");

  const res = await fetch(url);
  if (!res.ok) throw new WeatherApiError("Geocoding service unavailable");
  const data = await res.json();
  return (data.results ?? []) as Record<string, unknown>[];
}

// Open-Meteo's geocoder only matches on a bare place name (or postal code),
// so "Austin, TX" or "Paris, France" need the qualifier stripped to match.
export async function geocodeLocation(query: string): Promise<GeoResult[]> {
  let results = await searchGeocode(query);
  if (!results.length && query.includes(",")) {
    results = await searchGeocode(query.split(",")[0].trim());
  }
  if (!results.length) {
    throw new WeatherApiError(`No location found matching "${query}"`);
  }
  return results.map((r) => ({
    name: r.name,
    country: r.country,
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  })) as GeoResult[];
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));
  url.searchParams.set("format", "json");

  const res = await fetch(url, {
    headers: { "User-Agent": "pma-weather-app-assessment" },
  });
  if (!res.ok) throw new WeatherApiError("Reverse geocoding unavailable");
  const data = await res.json();
  return (
    data.address?.city ||
    data.address?.town ||
    data.address?.village ||
    data.address?.county ||
    data.display_name ||
    `${lat.toFixed(2)}, ${lon.toFixed(2)}`
  );
}

export async function getCurrentAndForecast(lat: number, lon: number) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code"
  );
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum"
  );
  url.searchParams.set("forecast_days", "5");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) throw new WeatherApiError("Weather service unavailable");
  const data = await res.json();

  const current: CurrentWeather = {
    temperature: data.current.temperature_2m,
    apparentTemperature: data.current.apparent_temperature,
    humidity: data.current.relative_humidity_2m,
    windSpeed: data.current.wind_speed_10m,
    weatherCode: data.current.weather_code,
    time: data.current.time,
  };

  const forecast: DailyForecastDay[] = data.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
  }));

  return { current, forecast };
}

// Backend CRUD requirement: weather for an arbitrary date range.
// Recent/future dates -> forecast API (supports ~90 days back to 16 days ahead).
// Older dates -> historical archive API.
export async function getWeatherForRange(lat: number, lon: number, startDate: string, endDate: string) {
  const daysAgo = (Date.now() - new Date(startDate).getTime()) / 86_400_000;
  const base = daysAgo > 90 ? "https://archive-api.open-meteo.com/v1/archive" : "https://api.open-meteo.com/v1/forecast";

  const url = new URL(base);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("start_date", startDate);
  url.searchParams.set("end_date", endDate);
  url.searchParams.set("daily", "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum");
  url.searchParams.set("timezone", "auto");

  const res = await fetch(url);
  if (!res.ok) throw new WeatherApiError("Weather service unavailable for that date range");
  const data = await res.json();
  if (!data.daily?.time?.length) {
    throw new WeatherApiError("No weather data available for that date range");
  }

  const days: DailyForecastDay[] = data.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
  }));

  return days;
}
