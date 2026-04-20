"use client";
import { useEffect, useRef, useState } from "react";

function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const toStr = (y: number, m: number, d: number) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const todayStr = toStr(today.getFullYear(), today.getMonth(), today.getDate());
  const isToday = (day: number) => toStr(viewYear, viewMonth, day) === todayStr;

  const handleDay = (day: number) => {
    const str = toStr(viewYear, viewMonth, day);
    if (!startDate || (startDate && endDate)) {
      onChange(str, "");
    } else {
      if (str < startDate) onChange(str, startDate);
      else onChange(startDate, str);
      setOpen(false);
    }
  };

  const inRange = (day: number) => {
    const str = toStr(viewYear, viewMonth, day);
    const end = endDate || hovered || "";
    if (!startDate || !end) return false;
    const lo = startDate < end ? startDate : end;
    const hi = startDate < end ? end : startDate;
    return str > lo && str < hi;
  };

  const isStart = (day: number) => toStr(viewYear, viewMonth, day) === startDate;
  const isEnd = (day: number) => toStr(viewYear, viewMonth, day) === endDate;

  const label = startDate && endDate
    ? `${startDate} → ${endDate}`
    : startDate
    ? `${startDate} → ...`
    : "Select date range";

  const clearRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-stone-800 border border-stone-700 hover:border-stone-600 rounded-xl text-sm transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} className="w-4 h-4 text-stone-400 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 2v2M14 2v2M3 8h14M5 4h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V6a2 2 0 012-2z" />
        </svg>
        <span className={`flex-1 text-left ${startDate ? "text-stone-200" : "text-stone-500"}`}>{label}</span>
        {(startDate || endDate) && (
          <span onClick={clearRange} className="text-stone-500 hover:text-stone-300 ml-1 transition-colors">✕</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl shadow-black/40 p-4 w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
            <span className="text-white text-sm font-semibold">{monthNames[viewMonth]} {viewYear}</span>
            <button
              type="button"
              onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => (
              <div key={d} className="text-center text-xs text-stone-600 font-medium py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
              const str = toStr(viewYear, viewMonth, day);
              const start = isStart(day);
              const end = isEnd(day);
              const range = inRange(day);
              const isTodayDay = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDay(day)}
                  onMouseEnter={() => startDate && !endDate && setHovered(str)}
                  onMouseLeave={() => setHovered(null)}
                  className={`relative h-8 text-xs font-medium transition-colors
                    ${start || end ? "bg-amber-500 text-stone-900 rounded-full z-10" : ""}
                    ${range ? "bg-amber-500/15 text-amber-300 rounded-none" : ""}
                    ${!start && !end && !range && isTodayDay ? "text-amber-400 ring-1 ring-amber-500/50 rounded-full" : ""}
                    ${!start && !end && !range && !isTodayDay ? "text-stone-300 hover:bg-stone-800 rounded-full" : ""}
                  `}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {startDate && !endDate && (
            <p className="text-stone-500 text-xs text-center mt-3">Click a second date to complete range</p>
          )}

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={() => { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()); }}
              className="text-xs text-stone-500 hover:text-amber-400 transition-colors"
            >
              Today
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { onChange("", ""); }}
                className="text-xs text-stone-500 hover:text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPanel({
  activeTab = "all",
  stats = { total: 0, completed: 0, pending: 0 },
}: {
  activeTab?: string;
  stats?: { total: number; completed: number; pending: number };
}) {
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/inspections");
      if (response.ok) {
        const data = await response.json();
        setInspections(data);
      }
    } catch (error) {
      console.error("Failed to fetch inspections:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, []);

  const handleDownloadCSV = async () => {
    try {
      let url = "/api/inspections/download";
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";

      if (!response.ok || !contentType.includes("text/csv")) {
        const data = await response.json().catch(() => ({}));
        alert(data.message || data.error || "No data found for the selected range.");
        return;
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const suffix = startDate && endDate ? `_${startDate}_to_${endDate}` : "";
      link.download = `inspections${suffix}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download CSV:", error);
    }
  };

  const statusColors: Record<string, string> = {
    Completed: "bg-green-500/15 text-green-400 border border-green-500/20",
    "In Progress": "bg-blue-500/15 text-blue-400 border border-blue-500/20",
    Pending: "bg-orange-500/15 text-orange-400 border border-orange-500/20",
    Failed: "bg-red-500/15 text-red-400 border border-red-500/20",
  };

  if (activeTab === "dashboard") {
    const failed = inspections.filter((i: any) => i.statusOfInspection === "Failed").length;
    return (
      <div className="space-y-6 animate-fadeInUp">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: stats.total, bg: "bg-amber-500/15", ic: "text-amber-400", path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "Completed", value: stats.completed, bg: "bg-green-500/15", ic: "text-green-400", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "In Progress / Pending", value: stats.pending, bg: "bg-blue-500/15", ic: "text-blue-400", path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Failed", value: failed, bg: "bg-red-500/15", ic: "text-red-400", path: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
          ].map((s) => (
            <div key={s.label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-5 h-5 ${s.ic}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
                </svg>
              </div>
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-stone-500 text-sm mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Recent Submissions */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
            <h3 className="text-white font-semibold">Recent Submissions</h3>
            <span className="text-stone-500 text-sm">{inspections.length} total</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-12">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-stone-400 text-sm">Loading...</span>
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-400 font-medium">No submissions yet</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {(inspections as any[]).slice(0, 8).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-800/30 transition-colors">
                  <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold font-mono">#{item.serialNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">Villa {item.villaNumber} – {item.villaType}</p>
                    <p className="text-stone-500 text-xs mt-0.5">{item.activityType} · {new Date(item.dateTime).toLocaleDateString("en-GB")} · {item.user?.email}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${statusColors[item.statusOfInspection] ?? "bg-stone-700 text-stone-300 border border-stone-600"}`}>
                    {item.statusOfInspection}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Download Section */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-base mb-5">Download Data</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-400 mb-1.5">Date Range</label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
            />
          </div>

          <button
            onClick={handleDownloadCSV}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-xl text-sm transition-colors"
          >
            Download as CSV
          </button>
        </div>
      </div>

      {/* All Submissions Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-base mb-5">All Submissions</h3>

        {loading ? (
          <div className="flex items-center gap-2 py-6">
            <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-stone-500 text-sm">Loading submissions...</p>
          </div>
        ) : inspections.length === 0 ? (
          <p className="text-stone-500 text-sm py-6 text-center">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Serial #</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">CHEC Inspector</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Villa Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wide">Submitted By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {inspections.map((inspection: any) => (
                  <tr key={inspection.id} className="hover:bg-stone-800/50 transition-colors">
                    <td className="px-4 py-3 text-stone-300 font-medium">{inspection.serialNumber}</td>
                    <td className="px-4 py-3 text-stone-400">
                      {new Date(inspection.dateTime).toLocaleDateString("en-GB")}
                    </td>
                    <td className="px-4 py-3 text-stone-300">{inspection.checInspectorName}</td>
                    <td className="px-4 py-3 text-stone-400">{inspection.villaType}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-medium ${statusColors[inspection.statusOfInspection] ?? "bg-stone-700 text-stone-300 border border-stone-600"}`}>
                        {inspection.statusOfInspection}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-stone-400">{inspection.department}</td>
                    <td className="px-4 py-3 text-stone-400">{inspection.user.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
