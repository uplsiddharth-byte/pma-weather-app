import { NextRequest, NextResponse } from "next/server";
import { deleteSearch, getSearchById, updateSearch } from "@/lib/db";
import { getWeatherForRange, WeatherApiError } from "@/lib/weather";

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

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const record = getSearchById(Number(id));
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ result: record });
}

// Only the date range is editable here — location/coordinates stay fixed to
// the record that was created (editing location is "create a new search").
export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const existing = getSearchById(Number(id));
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  if (!body?.startDate || !body?.endDate) {
    return NextResponse.json({ error: "'startDate' and 'endDate' are required" }, { status: 400 });
  }

  const dateError = validateDateRange(body.startDate, body.endDate);
  if (dateError) {
    return NextResponse.json({ error: dateError }, { status: 400 });
  }

  try {
    const weather = await getWeatherForRange(existing.latitude, existing.longitude, body.startDate, body.endDate);
    const record = updateSearch(Number(id), { startDate: body.startDate, endDate: body.endDate, weather });
    return NextResponse.json({ result: record });
  } catch (err) {
    const message = err instanceof WeatherApiError ? err.message : "Failed to update search";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteSearch(Number(id));
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
