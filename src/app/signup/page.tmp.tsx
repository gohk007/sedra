"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

function getStrength(pw: string): number {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  if (pw.length >= 12) s++;
  return s;
}

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];
const strengthColor = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-green-400"];
const strengthTextColor = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-lime-400", "text-green-400"];

export default function SignUp() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const strength = getStrength(password);
  const matched = confirm.length > 0 && password === confirm;
  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mismatch) { setError("Passwords do not match"); return; }
    setError("");
    setLoading(true);
    try {
      await signup(email, phone, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex">
      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-2/5 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #1c1917 0%, #292524 60%, #1c1917 100%)" }} />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-stone-900">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">Sedra</span>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Join the<br /><span className="text-amber-400">Inspection Team</span>
          </h2>
          <p className="text-stone-400 text-base leading-relaxed max-w-sm">
            Create your account and start submitting construction inspection reports digitally.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          {[
            { step: "01", label: "Create your account", desc: "Fill in your details below" },
            { step: "02", label: "Access dashboard", desc: "View your inspection portal" },
            { step: "03", label: "Submit reports", desc: "Start logging inspections" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="w-8 h-8 bg-amber-500/20 border border-amber-500/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs font-bold">{s.step}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{s.label}</p>
                <p className="text-stone-500 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-stone-950">
        <div className="w-full max-w-md animate-fadeInUp">
          <div className="lg:hidden flex items-center gap-3 mb-10 justify-center">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-stone-900">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
              </svg>
            </div>
            <span className="text-white font-bold text-xl">Sedra</span>
          </div>

          <h1 className="text-3xl font-black text-white mb-2">Create Account</h1>
          <p className="text-stone-400 mb-8 text-sm">Set up your inspector profile to get started</p>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex gap-3 items-start animate-fadeIn">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  placeholder="your@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Phone Number</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  placeholder="+971 XX XXX XXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-stone-900 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-stone-900 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                  {showPass ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2.5 animate-fadeIn">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor[strength] : "bg-stone-700"}`} />
                    ))}
                  </div>
                  <p className={`text-xs font-medium ${strengthTextColor[strength]}`}>{strengthLabel[strength]}</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-stone-300 text-sm font-medium mb-2">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className={`w-full pl-10 pr-12 py-3 bg-stone-900 border text-white placeholder-stone-500 rounded-xl focus:outline-none focus:ring-1 transition-all text-sm ${
                    mismatch
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/30"
                      : matched
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/30"
                      : "border-stone-700 focus:border-amber-500 focus:ring-amber-500/50"
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-10 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors">
                  {showConfirm ? (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {matched && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-green-400">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {mismatch && (
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-red-400">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
              {mismatch && <p className="text-red-400 text-xs mt-1.5">Passwords do not match</p>}
            </div>

            <button
              type="submit"
              disabled={loading || mismatch}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                  Creating account...
                </>
              ) : "Create Account"}
            </button>
          </form>

          <p className="text-center text-stone-500 text-sm mt-8">
            Already have an account?{" "}
            <Link href="/signin" className="text-amber-400 font-medium hover:text-amber-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
