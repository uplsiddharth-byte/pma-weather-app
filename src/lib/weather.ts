// Open-Meteo: free, keyless geocoding + weather + air-quality API. https://open-meteo.com/
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
  precipitationProbability?: number;
  sunrise?: string;
  sunset?: string;
  uvIndexMax?: number;
};

export type HourlyForecastHour = {
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number;
  isDay: boolean;
};

export type CurrentWeather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  time: string;
  isDay: boolean;
  pressure: number;
  dewPoint: number;
  visibility: number | null;
};

export type AirQuality = {
  usAqi: number;
  europeanAqi: number;
  category: string;
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

// Codes 0-2 have an obvious sun in their icon, which reads wrong after dark.
const NIGHT_ICONS: Record<number, string> = {
  0: "🌙",
  1: "🌙",
  2: "☁️",
};

export function describeWeatherCode(code: number, isDay = true) {
  const entry = WEATHER_CODES[code] ?? { label: "Unknown", icon: "❓" };
  if (!isDay && NIGHT_ICONS[code]) {
    return { ...entry, icon: NIGHT_ICONS[code] };
  }
  return entry;
}

export type WeatherMood = "clear" | "cloudy" | "fog" | "rain" | "storm" | "snow";

export function weatherMood(code: number): WeatherMood {
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3) return "cloudy";
  if (code === 45 || code === 48) return "fog";
  if (code >= 51 && code <= 67) return "rain";
  if (code >= 80 && code <= 82) return "rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if (code >= 95) return "storm";
  return "cloudy";
}

// Maps a WMO weather code + day/night to a Tailwind gradient for the
// animated hero background.
export function weatherGradient(code: number, isDay = true): string {
  const mood = weatherMood(code);
  if (!isDay) {
    if (mood === "clear") return "from-indigo-950 via-slate-900 to-black";
    if (mood === "storm") return "from-slate-950 via-purple-950 to-black";
    return "from-slate-900 via-slate-950 to-black";
  }
  if (mood === "clear") return "from-orange-400 via-rose-400 to-purple-500";
  if (mood === "cloudy") return "from-slate-400 via-slate-500 to-slate-700";
  if (mood === "fog") return "from-slate-300 via-slate-400 to-slate-600";
  if (mood === "rain") return "from-blue-400 via-indigo-500 to-slate-700";
  if (mood === "snow") return "from-sky-200 via-blue-300 to-indigo-400";
  return "from-indigo-900 via-purple-900 to-slate-950";
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
    "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,is_day,pressure_msl,dew_point_2m,visibility"
  );
  url.searchParams.set("hourly", "temperature_2m,weather_code,precipitation_probability,is_day");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,sunrise,sunset,uv_index_max"
  );
  url.searchParams.set("forecast_days", "7");
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
    isDay: data.current.is_day === 1,
    pressure: data.current.pressure_msl,
    dewPoint: data.current.dew_point_2m,
    visibility: typeof data.current.visibility === "number" ? data.current.visibility : null,
  };

  const forecast: DailyForecastDay[] = data.daily.time.map((date: string, i: number) => ({
    date,
    weatherCode: data.daily.weather_code[i],
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    precipitation: data.daily.precipitation_sum[i],
    precipitationProbability: data.daily.precipitation_probability_max?.[i],
    sunrise: data.daily.sunrise?.[i],
    sunset: data.daily.sunset?.[i],
    uvIndexMax: data.daily.uv_index_max?.[i],
  }));

  const nowIndex = data.hourly.time.findIndex((t: string) => t >= data.current.time);
  const startIndex = Math.max(nowIndex, 0);
  const hourly: HourlyForecastHour[] = data.hourly.time
    .slice(startIndex, startIndex + 24)
    .map((time: string, i: number) => ({
      time,
      temperature: data.hourly.temperature_2m[startIndex + i],
      weatherCode: data.hourly.weather_code[startIndex + i],
      precipitationProbability: data.hourly.precipitation_probability[startIndex + i],
      isDay: data.hourly.is_day[startIndex + i] === 1,
    }));

  return { current, forecast, hourly };
}

const AQI_CATEGORIES: [number, string][] = [
  [50, "Good"],
  [100, "Moderate"],
  [150, "Unhealthy for Sensitive Groups"],
  [200, "Unhealthy"],
  [300, "Very Unhealthy"],
  [Infinity, "Hazardous"],
];

export async function getAirQuality(lat: number, lon: number): Promise<AirQuality> {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "us_aqi,european_aqi");

  const res = await fetch(url);
  if (!res.ok) throw new WeatherApiError("Air quality service unavailable");
  const data = await res.json();
  const usAqi = data.current.us_aqi;
  return {
    usAqi,
    europeanAqi: data.current.european_aqi,
    category: AQI_CATEGORIES.find(([max]) => usAqi <= max)?.[1] ?? "Unknown",
  };
}

// Pure astronomical calculation, no API needed. Returns 0=new moon,
// 0.5=full moon, 1=next new moon.
export function moonPhase(date: Date): { fraction: number; name: string; icon: string } {
  const synodicMonth = 29.530588853;
  const knownNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const daysSince = (date.getTime() - knownNewMoon) / 86_400_000;
  const fraction = ((daysSince % synodicMonth) + synodicMonth) % synodicMonth / synodicMonth;

  const phases: [number, string, string][] = [
    [0.03, "New Moon", "🌑"],
    [0.22, "Waxing Crescent", "🌒"],
    [0.28, "First Quarter", "🌓"],
    [0.47, "Waxing Gibbous", "🌔"],
    [0.53, "Full Moon", "🌕"],
    [0.72, "Waning Gibbous", "🌖"],
    [0.78, "Last Quarter", "🌗"],
    [0.97, "Waning Crescent", "🌘"],
    [1, "New Moon", "🌑"],
  ];
  const [, name, icon] = phases.find(([max]) => fraction <= max) ?? phases[phases.length - 1];
  return { fraction, name, icon };
}

export type TemperatureUnit = "C" | "F";

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  const value = unit === "F" ? celsiusToFahrenheit(celsius) : celsius;
  return `${Math.round(value)}°`;
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
