import { NextRequest, NextResponse } from "next/server";
import { listSearches } from "@/lib/db";

function toCsv(rows: ReturnType<typeof listSearches>): string {
  const headers = [
    "id",
    "location_query",
    "resolved_name",
    "latitude",
    "longitude",
    "start_date",
    "end_date",
    "created_at",
    "updated_at",
  ];
  const escape = (v: unknown) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h as keyof typeof row])).join(","));
  }
  return lines.join("\n");
}

export async function GET(req: NextRequest) {
  const format = (req.nextUrl.searchParams.get("format") || "json").toLowerCase();
  const rows = listSearches();

  if (format === "csv") {
    return new NextResponse(toCsv(rows), {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=searches.csv",
      },
    });
  }

  if (format === "json") {
    return new NextResponse(JSON.stringify(rows, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": "attachment; filename=searches.json",
      },
    });
  }

  return NextResponse.json({ error: "Supported formats: json, csv" }, { status: 400 });
}
