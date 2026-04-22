"use client";
import AdminPanel from "@/components/AdminPanel";
import InspectionForm from "@/components/InspectionForm";
import UsersPanel from "@/components/UsersPanel";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Inspection {
  id: string;
  serialNumber: number;
  dateTime: string;
  checInspectorName: string;
  ececInspectorName: string;
  villaType: string;
  villaNumber: string;
  activityType: string;
  statusOfInspection: string;
  remarks: string;
  department: string;
  engineerDecision?: string;
  engineerComments?: string;
}

const statusColors: Record<string, string> = {
  Completed: "bg-green-500/15 text-green-400 border-green-500/20",
  "In Progress": "bg-blue-500/15 text-blue-400 border-blue-500/20",
  Pending: "bg-orange-500/15 text-orange-400 border-orange-500/20",
  Rejected: "bg-red-500/15 text-red-400 border-red-500/20",
};

export default function Dashboard() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push("/signin");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const res = await fetch("/api/inspections");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setInspections(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-stone-400">Loading...</span>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === "admin";
  const total = inspections.length;
  const completed = inspections.filter((i) => i.statusOfInspection === "Completed").length;
  const pending = inspections.filter((i) => ["In Progress", "Pending"].includes(i.statusOfInspection)).length;
  const stats = { total, completed, pending };

  const userNavItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "form", label: "New Inspection", icon: "form" },
    { id: "reports", label: "My Reports", icon: "reports" },
  ];

  const adminNavItems = [
    { id: "dashboard", label: "Overview", icon: "dashboard" },
    { id: "form", label: "New Inspection", icon: "form" },
    { id: "all", label: "All Reports", icon: "all" },
    { id: "users", label: "Manage Users", icon: "users" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const pageTitles: Record<string, string> = {
    dashboard: isAdmin ? "Admin Overview" : "Dashboard",
    form: "New Inspection",
    reports: "My Reports",
    all: "All Reports",
    users: "Manage Users",
  };

  const handleFormSuccess = () => {
    fetchData();
    setActiveTab(isAdmin ? "all" : "reports");
    setEditingInspection(null);
  };

  const handleNav = (id: string) => {
    setActiveTab(id);
    setEditingInspection(null);
    setSidebarOpen(false);
  };

  const handleEditInspection = (inspection: Inspection) => {
    setEditingInspection(inspection);
    setActiveTab("form");
  };



  const iconPaths: Record<string, string> = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    form: "M12 4v16m8-8H4",
    reports: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
    all: "M4 6h16M4 10h16M4 14h16M4 18h16",
    users: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
  };

  const NavIcon = ({ name }: { name: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d={iconPaths[name] || iconPaths.dashboard} />
    </svg>
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-stone-950 border-r border-stone-800">
      <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-500/40">
            <img src="/logo.jpeg" alt="Sedra Logo" className="w-12 h-12 rounded-lg object-cover" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-none">Sedra</p>
            <p className="text-stone-600 text-xs mt-0.5">Inspection Platform</p>
          </div>
        </div>
        <button
          onClick={() => { setDesktopSidebarOpen(false); setSidebarOpen(false); }}
          className="text-stone-500 hover:text-stone-300 transition-colors lg:hidden"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              activeTab === item.id
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                : "text-stone-400 hover:text-white hover:bg-stone-800"
            }`}
          >
            <NavIcon name={item.icon} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-stone-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-stone-900 mb-2">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-stone-900 font-bold text-sm">
              {user?.email?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs font-medium truncate">{user?.email}</p>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${isAdmin ? "bg-amber-500/20 text-amber-400" : "bg-stone-700 text-stone-400"}`}>
              {isAdmin ? "Admin" : "Inspector"}
            </span>
          </div>
        </div>
        <button
          onClick={() => { logout(); router.push("/signin"); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 text-stone-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-sm"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex lg:flex-col lg:fixed lg:left-0 lg:top-0 lg:bottom-0 lg:z-30 bg-stone-950 transition-all duration-300 ${desktopSidebarOpen ? "lg:w-64" : "lg:w-0 lg:overflow-hidden"}`}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="relative w-72 flex flex-col animate-slideInLeft">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-h-screen overflow-x-hidden transition-all duration-300 ${desktopSidebarOpen ? "lg:ml-64" : "lg:ml-0"}`}>
        <header className="sticky top-0 z-20 bg-stone-950/90 backdrop-blur-sm border-b border-stone-800 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-stone-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button
              onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
              className="hidden lg:block text-stone-400 hover:text-white transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className={`w-6 h-6 transition-transform ${desktopSidebarOpen ? "rotate-180" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">{pageTitles[activeTab]}</h1>
              <p className="text-stone-500 text-xs mt-0.5">
                {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          {activeTab !== "form" && (
            <button
              onClick={() => handleNav("form")}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-xl text-sm transition-all hover:shadow-md hover:shadow-amber-500/20"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span className="hidden sm:inline">New Report</span>
            </button>
          )}
        </header>

        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden w-full">
          {activeTab === "form" ? (
            <InspectionForm 
              onSuccess={handleFormSuccess}
              {...(editingInspection && { inspectionData: editingInspection })}
            />
          ) : isAdmin && activeTab === "users" ? (
            <UsersPanel />
          ) : isAdmin ? (
            <AdminPanel 
              activeTab={activeTab} 
              stats={stats}
              onEditInspection={handleEditInspection}
            />
          ) : (
            <UserView
              activeTab={activeTab}
              inspections={inspections}
              loading={dataLoading}
              stats={stats}
              onNewReport={() => handleNav("form")}
              onEditInspection={handleEditInspection}
            />
          )}
        </main>
      </div>
    </div>
  );
}

function UserView({
  activeTab,
  inspections,
  loading,
  stats,
  onNewReport,
  onEditInspection,
}: {
  activeTab: string;
  inspections: Inspection[];
  loading: boolean;
  stats: { total: number; completed: number; pending: number };
  onNewReport: () => void;
  onEditInspection?: (inspection: Inspection) => void;
}) {
  if (activeTab === "dashboard") {
    return (
      <div className="space-y-6 animate-fadeInUp">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Reports", value: stats.total, bg: "bg-amber-500/15", ic: "text-amber-400", path: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
            { label: "In Progress", value: stats.pending, bg: "bg-blue-500/15", ic: "text-blue-400", path: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
            { label: "Completed", value: stats.completed, bg: "bg-green-500/15", ic: "text-green-400", path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
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

        <div
          onClick={onNewReport}
          className="bg-stone-900 border border-stone-800 hover:border-amber-500/30 rounded-2xl p-6 cursor-pointer transition-all group hover:shadow-lg hover:shadow-amber-500/5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/15 rounded-xl flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-amber-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Submit New Report</p>
                <p className="text-stone-500 text-sm">Log a new villa inspection</p>
              </div>
            </div>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-stone-800">
            <h3 className="text-white font-semibold text-sm sm:text-base">Recent Submissions</h3>
          </div>
          {loading ? (
            <div className="flex items-center gap-3 justify-center py-12">
              <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-stone-400 text-sm">Loading...</span>
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-stone-400 font-medium">No submissions yet</p>
              <p className="text-stone-600 text-sm mt-1">Submit your first inspection report</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-800">
              {inspections.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 hover:bg-stone-800/30 transition-colors">
                  <div className="w-9 h-9 bg-stone-800 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-400 text-xs font-bold font-mono">#{item.serialNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">Villa {item.villaNumber} – {item.villaType}</p>
                    <p className="text-stone-500 text-xs mt-0.5">{item.activityType} · {new Date(item.dateTime).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex-shrink-0 ${statusColors[item.statusOfInspection] || "bg-stone-700 text-stone-300 border-stone-600"}`}>
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
    <div className="space-y-5 animate-fadeInUp">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-b border-stone-800 flex items-center justify-between gap-2">
          <h3 className="text-white font-semibold text-sm sm:text-base">My Inspection Reports</h3>
          <span className="text-stone-500 text-xs sm:text-sm">{inspections.length} total</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 justify-center py-12">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400 text-sm">Loading...</span>
          </div>
        ) : inspections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-stone-400 font-medium">No reports yet</p>
            <p className="text-stone-600 text-sm mt-1">Submit your first inspection to see it here</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800/40">
                  {["#", "Date", "CHEC Inspector", "Villa", "Activity", "Status", "Decision", "Notes", "Dept", "Action"].map((h) => (
                    <th key={h} className={`px-2 sm:px-4 py-2.5 sm:py-3.5 text-left text-stone-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap ${
                      (h === "CHEC Inspector" || h === "Activity" || h === "Dept") ? "hidden sm:table-cell" : ""
                    }`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {inspections.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-800/30 transition-colors">
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-amber-400 font-mono font-semibold whitespace-nowrap text-xs sm:text-sm">#{item.serialNumber}</td>
                    <td className="px-1 sm:px-2 py-2.5 sm:py-4 text-stone-300 whitespace-nowrap text-xs">{new Date(item.dateTime).toLocaleDateString()}</td>
                    <td className="hidden sm:table-cell px-2 sm:px-4 py-2.5 sm:py-4 text-white font-medium whitespace-nowrap">{item.checInspectorName}</td>
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span className="text-white font-medium">#{item.villaNumber}</span>
                      <span className="text-stone-500 ml-1 text-xs">{item.villaType}</span>
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-4 py-2.5 sm:py-4 text-stone-400 whitespace-nowrap">{item.activityType}</td>
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${statusColors[item.statusOfInspection] || "bg-stone-700 text-stone-300 border-stone-600"}`}>
                        {item.statusOfInspection}
                      </span>
                    </td>
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs whitespace-nowrap">
                      {item.engineerDecision ? (
                        <span className={`px-2 py-1 rounded-lg font-medium ${
                          item.engineerDecision === "Approved" ? "bg-green-500/20 text-green-400" :
                          item.engineerDecision === "Approved with Comments" ? "bg-blue-500/20 text-blue-400" :
                          item.engineerDecision === "Revise & Resubmit" ? "bg-yellow-500/20 text-yellow-400" :
                          "bg-red-500/20 text-red-400"
                        }`}>
                          {item.engineerDecision}
                        </span>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </td>
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs">
                      {item.engineerComments ? (
                        <div className="relative group">
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-stone-800 rounded-lg border border-stone-700 text-amber-400 cursor-help">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M18 10.172A6 6 0 00-2 10V3.172a6 6 0 0020 0V10z"/></svg>
                          </span>
                          <div className="hidden group-hover:block absolute left-0 bottom-full mb-2 bg-stone-950 border border-stone-700 rounded-lg p-3 text-stone-300 text-sm max-w-xs z-10 whitespace-normal shadow-lg">
                            {item.engineerComments}
                          </div>
                        </div>
                      ) : (
                        <span className="text-stone-600">—</span>
                      )}
                    </td>
                    <td className="hidden sm:table-cell px-2 sm:px-4 py-2.5 sm:py-4 text-stone-400 whitespace-nowrap text-xs">{item.department}</td>
                    <td className="px-2 sm:px-4 py-2.5 sm:py-4 text-xs whitespace-nowrap">
                      <button
                        onClick={() => onEditInspection?.(item)}
                        className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 rounded-lg transition-colors text-xs font-medium"
                      >
                        Edit
                      </button>
                    </td>
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
