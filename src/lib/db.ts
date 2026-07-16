import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data.sqlite");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS searches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_query TEXT NOT NULL,
    resolved_name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    weather_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

export type SearchRecord = {
  id: number;
  location_query: string;
  resolved_name: string;
  latitude: number;
  longitude: number;
  start_date: string;
  end_date: string;
  weather_json: string;
  created_at: string;
  updated_at: string;
};

export function createSearch(input: {
  locationQuery: string;
  resolvedName: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  weather: unknown;
}): SearchRecord {
  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO searches (location_query, resolved_name, latitude, longitude, start_date, end_date, weather_json, created_at, updated_at)
    VALUES (@locationQuery, @resolvedName, @latitude, @longitude, @startDate, @endDate, @weatherJson, @now, @now)
  `);
  const result = stmt.run({
    locationQuery: input.locationQuery,
    resolvedName: input.resolvedName,
    latitude: input.latitude,
    longitude: input.longitude,
    startDate: input.startDate,
    endDate: input.endDate,
    weatherJson: JSON.stringify(input.weather),
    now,
  });
  return getSearchById(Number(result.lastInsertRowid))!;
}

export function listSearches(): SearchRecord[] {
  return db.prepare(`SELECT * FROM searches ORDER BY created_at DESC`).all() as SearchRecord[];
}

export function getSearchById(id: number): SearchRecord | undefined {
  return db.prepare(`SELECT * FROM searches WHERE id = ?`).get(id) as SearchRecord | undefined;
}

export function updateSearch(
  id: number,
  input: { startDate: string; endDate: string; weather: unknown }
): SearchRecord | undefined {
  const now = new Date().toISOString();
  db.prepare(`
    UPDATE searches SET start_date = ?, end_date = ?, weather_json = ?, updated_at = ?
    WHERE id = ?
  `).run(input.startDate, input.endDate, JSON.stringify(input.weather), now, id);
  return getSearchById(id);
}

export function deleteSearch(id: number): boolean {
  const result = db.prepare(`DELETE FROM searches WHERE id = ?`).run(id);
  return result.changes > 0;
}

export default db;
