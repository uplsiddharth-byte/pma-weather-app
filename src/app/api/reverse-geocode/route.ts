import { NextRequest, NextResponse } from "next/server";
import { reverseGeocode, WeatherApiError } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const lat = Number(req.nextUrl.searchParams.get("lat"));
  const lon = Number(req.nextUrl.searchParams.get("lon"));
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return NextResponse.json({ error: "'lat' and 'lon' query params are required numbers" }, { status: 400 });
  }
  try {
    const name = await reverseGeocode(lat, lon);
    return NextResponse.json({ name });
  } catch (err) {
    const message = err instanceof WeatherApiError ? err.message : "Failed to reverse geocode";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
