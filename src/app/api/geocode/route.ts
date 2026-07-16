import { NextRequest, NextResponse } from "next/server";
import { geocodeLocation, WeatherApiError } from "@/lib/weather";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q || !q.trim()) {
    return NextResponse.json({ error: "Query param 'q' is required" }, { status: 400 });
  }
  try {
    const results = await geocodeLocation(q);
    return NextResponse.json({ results });
  } catch (err) {
    const message = err instanceof WeatherApiError ? err.message : "Failed to look up location";
    return NextResponse.json({ error: message }, { status: err instanceof WeatherApiError ? 404 : 502 });
  }
}
