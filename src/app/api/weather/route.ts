import { NextRequest, NextResponse } from "next/server";
import { getCurrentAndForecast, WeatherApiError } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "'lat' and 'lon' query params are required numbers" }, { status: 400 });
  }

  try {
    const data = await getCurrentAndForecast(lat, lon);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof WeatherApiError ? err.message : "Failed to fetch weather";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
