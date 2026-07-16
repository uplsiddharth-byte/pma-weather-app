import { NextRequest, NextResponse } from "next/server";
import { createSearch, listSearches } from "@/lib/db";
import { geocodeLocation, getWeatherForRange, WeatherApiError } from "@/lib/weather";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateDateRange(startDate: string, endDate: string): string | null {
  if (!DATE_RE.test(startDate) || !DATE_RE.test(endDate)) {
    return "Dates must be in YYYY-MM-DD format";
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Dates must be valid calendar dates";
  }
  if (start > end) {
    return "Start date must be on or before end date";
  }
  const spanDays = (end.getTime() - start.getTime()) / 86_400_000;
  if (spanDays > 92) {
    return "Date range cannot exceed 92 days";
  }
  return null;
}

export async function GET() {
  return NextResponse.json({ results: listSearches() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.location || !body?.startDate || !body?.endDate) {
    return NextResponse.json(
      { error: "'location', 'startDate', and 'endDate' are required" },
      { status: 400 }
    );
  }

  const dateError = validateDateRange(body.startDate, body.endDate);
  if (dateError) {
    return NextResponse.json({ error: dateError }, { status: 400 });
  }

  try {
    // Fuzzy match: take the top geocoding result for the free-text location.
    const [match] = await geocodeLocation(body.location);
    const weather = await getWeatherForRange(match.latitude, match.longitude, body.startDate, body.endDate);

    const record = createSearch({
      locationQuery: body.location,
      resolvedName: [match.name, match.admin1, match.country].filter(Boolean).join(", "),
      latitude: match.latitude,
      longitude: match.longitude,
      startDate: body.startDate,
      endDate: body.endDate,
      weather,
    });

    return NextResponse.json({ result: record }, { status: 201 });
  } catch (err) {
    const message = err instanceof WeatherApiError ? err.message : "Failed to create search";
    return NextResponse.json({ error: message }, { status: err instanceof WeatherApiError ? 404 : 502 });
  }
}
