"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Pencil, Trash2, Download } from "lucide-react";
import { useSelectedLocation } from "@/lib/app-context";

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

export default function SavedScreen() {
  const router = useRouter();
  const { setLocation } = useSelectedLocation();

  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [location, setLocationInput] = useState("");
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
      if (!res.ok) throw new Error(data.error || "Failed to save city");
      setLocationInput("");
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
      if (!res.ok) throw new Error(data.error || "Failed to update");
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

  function viewWeather(r: SearchRecord) {
    setLocation({ name: r.resolved_name, lat: r.latitude, lon: r.longitude });
    router.push("/");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-semibold">Saved Cities</h1>

      <form onSubmit={handleCreate} className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-xs text-zinc-400">Location</label>
          <input
            required
            value={location}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="e.g. Austin"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400">Start date</label>
          <input
            required
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400">End date</label>
          <input
            required
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Save
        </button>
      </form>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-4 text-sm">
        {/* eslint-disable @next/next/no-html-link-for-pages -- these are file downloads from an API route, not page navigation */}
        <a href="/api/searches/export?format=csv" className="flex items-center gap-1 text-blue-400 transition hover:underline">
          <Download className="h-3.5 w-3.5" /> Export CSV
        </a>
        <a href="/api/searches/export?format=json" className="flex items-center gap-1 text-blue-400 transition hover:underline">
          <Download className="h-3.5 w-3.5" /> Export JSON
        </a>
        {/* eslint-enable @next/next/no-html-link-for-pages */}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {records.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -3 }}
            className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur-xl"
          >
            <button onClick={() => viewWeather(r)} className="flex items-center gap-2 text-left font-medium">
              <MapPin className="h-4 w-4 text-blue-400" />
              {r.resolved_name}
            </button>

            {editingId === r.id ? (
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <input
                  type="date"
                  value={editStart}
                  onChange={(e) => setEditStart(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                />
                <input
                  type="date"
                  value={editEnd}
                  onChange={(e) => setEditEnd(e.target.value)}
                  className="rounded-lg border border-white/10 bg-black/20 px-2 py-1"
                />
                <button onClick={() => handleUpdate(r.id)} disabled={busy} className="text-blue-400 hover:underline">
                  Save
                </button>
                <button onClick={() => setEditingId(null)} className="text-zinc-500 hover:underline">
                  Cancel
                </button>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">
                {r.start_date} → {r.end_date}
              </p>
            )}

            <div className="mt-auto flex items-center justify-between text-xs text-zinc-500">
              <span>Updated {new Date(r.updated_at).toLocaleDateString()}</span>
              {editingId !== r.id && (
                <div className="flex gap-3">
                  <button onClick={() => startEdit(r)} aria-label="Edit" className="text-zinc-400 hover:text-white">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(r.id)} aria-label="Delete" className="text-zinc-400 hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {records.length === 0 && <p className="col-span-2 py-8 text-center text-zinc-500">No saved cities yet.</p>}
      </div>
    </div>
  );
}
