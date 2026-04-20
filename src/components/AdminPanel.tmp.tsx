"use client";
import { useEffect, useState } from "react";

interface AdminPanelProps {
  activeTab: string;
  stats: { total: number; pending: number; completed: number };
}

const statusColors: Record<string, string> = {
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Pending: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Failed: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function AdminPanel({ activeTab, stats }: AdminPanelProps) {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchInspections();
  }, []);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/inspections");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setInspections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    setDownloadMsg("");
    try {
      let url = "/api/inspections/download";
      if (startDate && endDate) url += `?startDate=${startDate}&endDate=${endDate}`;
      const res = await fetch(url);
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          const json = await res.json();
          setDownloadMsg(json.message || "No data found");
          return;
        }
        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `inspections-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(link.href);
        setDownloadMsg("Downloaded successfully!");
      }
    } catch (e) {
      setDownloadMsg("Download failed. Please try again.");
    } finally {
      setDownloading(false);
      setTimeout(() => setDownloadMsg(""), 3000);
    }
  };

  const filtered = inspections.filter((i) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      i.checInspectorName?.toLowerCase().includes(s) ||
      i.ececInspectorName?.toLowerCase().includes(s) ||
      i.villaType?.toLowerCase().includes(s) ||
      i.department?.toLowerCase().includes(s) ||
      String(i.villaNumber).includes(s) ||
      i.statusOfInspection?.toLowerCase().includes(s)
    );
  });

  if (activeTab === "dashboard") {
    return <AdminOverview stats={stats} inspections={inspections} loading={loading} />;
  }

  return (
    <div className="space-y-5 animate-fadeInUp">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by inspector, villa, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-2.5 bg-stone-900 border border-stone-800 text-stone-300 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all [color-scheme:dark]"
          />
          <span className="text-stone-600 text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-2.5 bg-stone-900 border border-stone-800 text-stone-300 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all [color-scheme:dark]"
          />
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-semibold rounded-xl text-sm transition-all hover:shadow-md hover:shadow-amber-500/20"
          >
            {downloading ? (
              <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
            ) : (
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
            Export CSV
          </button>
        </div>
      </div>

      {downloadMsg && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn ${
          downloadMsg.includes("success") || downloadMsg.includes("Downloaded")
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
        }`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {downloadMsg}
        </div>
      )}

      {/* Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">All Submissions</h3>
          <span className="text-stone-500 text-sm">{filtered.length} of {inspections.length} records</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 justify-center py-20">
            <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400">Loading inspections...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-stone-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-8 h-8 text-stone-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-stone-400 font-medium">No records found</p>
            <p className="text-stone-600 text-sm mt-1">{search ? "Try a different search term" : "No submissions yet"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800/40">
                  {["#", "Date & Time", "CHEC Inspector", "ECEC Inspector", "Villa", "Activity", "Status", "Department", "Submitted By"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-stone-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="px-4 py-4 text-amber-400 font-mono font-semibold whitespace-nowrap">#{item.serialNumber}</td>
                    <td className="px-4 py-4 text-stone-300 whitespace-nowrap">
                      <div>{new Date(item.dateTime).toLocaleDateString()}</div>
                      <div className="text-stone-600 text-xs">{new Date(item.dateTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                    </td>
                    <td className="px-4 py-4 text-white font-medium whitespace-nowrap">{item.checInspectorName}</td>
                    <td className="px-4 py-4 text-stone-300 whitespace-nowrap">{item.ececInspectorName}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="text-white font-medium">#{item.villaNumber}</span>
                      <span className="text-stone-500 ml-1.5 text-xs">{item.villaType}</span>
                    </td>
                    <td className="px-4 py-4 text-stone-400 whitespace-nowrap">{item.activityType}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusColors[item.statusOfInspection] || "bg-stone-700 text-stone-300 border-stone-600"}`}>
                        {item.statusOfInspection}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-stone-400 whitespace-nowrap">{item.department}</td>
                    <td className="px-4 py-4 text-stone-500 whitespace-nowrap text-xs">{item.user?.email}</td>
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

function AdminOverview({
  stats,
  inspections,
  loading,
}: {
  stats: { total: number; pending: number; completed: number };
  inspections: any[];
  loading: boolean;
}) {
  const failed = inspections.filter((i) => i.statusOfInspection === "Failed").length;

  const statCards = [
    { label: "Total Reports", value: stats.total, bg: "bg-amber-500/15", ic: "text-amber-400", path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "In Progress", value: stats.pending, bg: "bg-blue-500/15", ic: "text-blue-400", path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Completed", value: stats.completed, bg: "bg-green-500/15", ic: "text-green-400", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Failed", value: failed, bg: "bg-red-500/15", ic: "text-red-400", path: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-6 animate-fadeInUp">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={`w-5 h-5 ${s.ic}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d={s.path} />
              </svg>
            </div>
            <div className="text-3xl font-black text-white">{s.value}</div>
            <div className="text-stone-500 text-sm mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">Recent Submissions</h3>
          <span className="text-stone-500 text-xs">Latest 10</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 justify-center py-12">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400 text-sm">Loading...</span>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-16 text-stone-500">No submissions yet</div>
        ) : (
          <div className="divide-y divide-stone-800">
            {inspections.slice(0, 10).map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-800/30 transition-colors">
                <div className="w-10 h-10 bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-amber-400 text-xs font-bold font-mono">#{item.serialNumber}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">
                    Villa {item.villaNumber} – {item.villaType}
                  </p>
                  <p className="text-stone-500 text-xs mt-0.5">
                    {item.checInspectorName} · {item.department} · {new Date(item.dateTime).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusColors[item.statusOfInspection] || "bg-stone-700 text-stone-300 border-stone-600"}`}>
                    {item.statusOfInspection}
                  </span>
                  <span className="text-stone-600 text-xs hidden sm:block">{item.user?.email}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
