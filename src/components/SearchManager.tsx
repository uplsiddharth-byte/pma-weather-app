"use client";

import { useEffect, useState } from "react";

type SearchRecord = {
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

const todayIso = () => new Date().toISOString().slice(0, 10);

export default function SearchManager() {
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(todayIso());
  const [endDate, setEndDate] = useState(todayIso());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");

  async function refresh() {
    const res = await fetch("/api/searches");
    const data = await res.json();
    setRecords(data.results ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial data load on mount
    refresh();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location, startDate, endDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save search");
      setLocation("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function startEdit(r: SearchRecord) {
    setEditingId(r.id);
    setEditStart(r.start_date);
    setEditEnd(r.end_date);
  }

  async function handleUpdate(id: number) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/searches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: editStart, endDate: editEnd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update search");
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: number) {
    setBusy(true);
    try {
      await fetch(`/api/searches/${id}`, { method: "DELETE" });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Saved Searches (CRUD + Persistence)</h2>

      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs text-zinc-500">Location</label>
          <input
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Austin, TX"
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">Start date</label>
          <input
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-500">End date</label>
          <input
            required
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="flex gap-2 text-sm">
        {/* eslint-disable @next/next/no-html-link-for-pages -- these are file downloads from an API route, not page navigation */}
        <a href="/api/searches/export?format=csv" className="text-blue-600 hover:underline">
          Export CSV
        </a>
        <a href="/api/searches/export?format=json" className="text-blue-600 hover:underline">
          Export JSON
        </a>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4">Location</th>
              <th className="py-2 pr-4">Date range</th>
              <th className="py-2 pr-4">Updated</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b border-zinc-100 dark:border-zinc-900">
                <td className="py-2 pr-4">{r.resolved_name}</td>
                <td className="py-2 pr-4">
                  {editingId === r.id ? (
                    <div className="flex gap-1">
                      <input
                        type="date"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="rounded border border-zinc-300 px-1 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                      <input
                        type="date"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="rounded border border-zinc-300 px-1 dark:border-zinc-700 dark:bg-zinc-900"
                      />
                    </div>
                  ) : (
                    `${r.start_date} → ${r.end_date}`
                  )}
                </td>
                <td className="py-2 pr-4 text-zinc-500">{new Date(r.updated_at).toLocaleString()}</td>
                <td className="py-2 pr-4">
                  {editingId === r.id ? (
                    <div className="flex gap-2">
                      <button onClick={() => handleUpdate(r.id)} disabled={busy} className="text-blue-600 hover:underline">
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:underline">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => startEdit(r)} className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(r.id)} disabled={busy} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-zinc-400">
                  No saved searches yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
