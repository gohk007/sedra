"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-stone-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-900 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-amber-500/20 rounded-xl border border-amber-500/40">
            <img src="/logo.jpeg" alt="Sedra Logo" className="w-12 h-12 rounded-lg object-cover" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">Sedra</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/signin"
            className="px-5 py-2 text-stone-300 hover:text-white text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 text-sm font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-amber-500/20"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />

        <div className="relative max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-sm font-medium">Construction Inspection Platform</span>
          </div>

          <h1 className="text-6xl font-black text-white mb-6 leading-tight animate-fadeInUp">
            Manage Inspections
            <br />
            <span className="text-amber-400">With Precision</span>
          </h1>

          <p className="text-stone-400 text-lg max-w-2xl mx-auto mb-12 animate-fadeInUp delay-100">
            A powerful platform tailored for construction teams to submit, track, and manage site inspection reports — all in one place.
          </p>

          <div className="flex items-center justify-center gap-4 animate-fadeInUp delay-200">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl transition-all duration-200 hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5"
            >
              Start Now — Free
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
              </svg>
            </Link>
            <Link
              href="/signin"
              className="px-8 py-4 border border-stone-700 hover:border-stone-500 text-stone-300 hover:text-white font-medium rounded-xl transition-all duration-200 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="max-w-6xl mx-auto px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: "Easy Submissions",
                desc: "Inspectors submit detailed villa reports with all required fields in minutes.",
              },
              {
                icon: (
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                ),
                title: "Admin Dashboard",
                desc: "Admins get full visibility with date-range filtering and CSV export.",
              },
              {
                icon: (
                  <>
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </>
                ),
                title: "Secure Access",
                desc: "Role-based access ensures the right people see the right data.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="p-6 bg-stone-800/50 border border-stone-700/50 rounded-2xl hover:border-amber-500/30 transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-amber-400">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-stone-800">
          <div className="max-w-6xl mx-auto px-8 py-8 grid grid-cols-3 gap-8">
            {[
              { val: "100%", label: "Digital & Paperless" },
              { val: "Real-time", label: "Data Sync" },
              { val: "Secure", label: "Role-based Access" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-black text-amber-400 mb-1">{s.val}</div>
                <div className="text-stone-500 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
