"use client";
import { useEffect, useState } from "react";

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

  useEffect(() => {
    fetchInspections();
  }, []);

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

  const handleDownloadCSV = async () => {
    try {
      let url = "/api/inspections/download";

      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = "inspections.csv";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      }
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 text-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none text-sm [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-400 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-stone-800 border border-stone-700 text-stone-200 rounded-xl focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/50 outline-none text-sm [color-scheme:dark]"
              />
            </div>
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
