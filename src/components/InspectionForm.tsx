"use client";
import { useRef, useState } from "react";

interface InspectionFormProps {
  onSuccess?: () => void;
}

const STATUS_OPTIONS = [
  { value: "Completed", color: "border-green-500 bg-green-500/15 text-green-400", dot: "bg-green-400" },
  { value: "In Progress", color: "border-blue-500 bg-blue-500/15 text-blue-400", dot: "bg-blue-400" },
  { value: "Pending", color: "border-orange-500 bg-orange-500/15 text-orange-400", dot: "bg-orange-400" },
  { value: "Failed", color: "border-red-500 bg-red-500/15 text-red-400", dot: "bg-red-400" },
];

const DEPARTMENTS = ["Civil", "Mechanical", "Electrical", "Architecture", "Finishing", "Landscaping", "Infrastructure", "Other"];
const ACTIVITY_TYPES = ["Foundation", "Structure", "Roofing", "Electrical", "Plumbing", "Tiling", "Painting", "Handover", "Other"];
const VILLA_TYPES = ["DP4", "DP5", "C10", "VL"];

const SectionTitle = ({ label }: { label: string }) => (
  <h3 className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-4">{label}</h3>
);

export default function InspectionForm({ onSuccess }: InspectionFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const [form, setForm] = useState({
    checInspectorName: "",
    ececInspectorName: "",
    villaType: "",
    villaNumber: "",
    activityType: "",
    statusOfInspection: "",
    department: "",
    departmentOther: "",
    remarks: "",
    wirFile: null as File | null,
  });

  const set = (key: string, value: string | File | null) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setError("");
    if (!form.checInspectorName.trim() || !form.ececInspectorName.trim()) {
      setError("Both inspector names are required");
      return;
    }
    if (!form.villaType || !form.villaNumber.trim()) {
      setError("Villa type and number are required");
      return;
    }
    if (!form.activityType || !form.statusOfInspection || !form.department) {
      setError("Activity type, status, and department are required");
      return;
    }
    if (form.department === "Other" && !form.departmentOther.trim()) {
      setError("Please specify the department");
      return;
    }
    setSubmitting(true);
    try {
      const villaNum = parseInt(form.villaNumber, 10);
      if (isNaN(villaNum)) {
        setError("Villa number must be a number");
        setSubmitting(false);
        return;
      }
      const res = await fetch("/api/inspections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          checInspectorName: form.checInspectorName,
          ececInspectorName: form.ececInspectorName,
          villaType: form.villaType,
          villaNumber: villaNum,
          activityType: form.activityType,
          statusOfInspection: form.statusOfInspection,
          department: form.department === "Other" ? form.departmentOther : form.department,
          remarks: form.remarks,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || "Submission failed");
      }
      setSubmitted(true);
      onSuccess?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubmitted(false);
    setForm({
      checInspectorName: "",
      ececInspectorName: "",
      villaType: "",
      villaNumber: "",
      activityType: "",
      statusOfInspection: "",
      department: "",
      departmentOther: "",
      remarks: "",
      wirFile: null,
    });
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fadeIn">
        <div className="text-center max-w-sm">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-pulse" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-green-500/20 border-2 border-green-500 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-8 h-8 text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">Report Submitted!</h2>
          <p className="text-stone-400 text-sm mb-8">Your inspection report has been recorded successfully.</p>
          <button
            onClick={resetForm}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-bold rounded-xl transition-all"
          >
            Submit Another Report
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fadeInUp space-y-5">

      {/* Inspector Details */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <SectionTitle label="Inspector Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              CHEC Inspector Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter CHEC inspector name"
              value={form.checInspectorName}
              onChange={(e) => set("checInspectorName", e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
            />
          </div>
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              ECEC Inspector Name <span className="text-amber-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter ECEC inspector name"
              value={form.ececInspectorName}
              onChange={(e) => set("ececInspectorName", e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Villa Info */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <SectionTitle label="Villa Info" />
        <div className="space-y-4">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Villa Type <span className="text-amber-500">*</span>
            </label>
            <select
              value={form.villaType}
              onChange={(e) => set("villaType", e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm appearance-none cursor-pointer"
            >
              <option value="" disabled>Select villa type</option>
              {VILLA_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="max-w-xs">
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Villa Number <span className="text-amber-500">*</span>
            </label>
            <input
              type="number"
              placeholder="e.g. 101"
              value={form.villaNumber}
              onChange={(e) => set("villaNumber", e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Inspection Details */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <SectionTitle label="Inspection Details" />
        <div className="space-y-5">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Activity Type <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("activityType", t)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    form.activityType === t
                      ? "border-amber-500 bg-amber-500/15 text-amber-400"
                      : "border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600 hover:text-white"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Inspection Status <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("statusOfInspection", s.value)}
                  className={`py-3 px-4 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-2.5 ${
                    form.statusOfInspection === s.value
                      ? s.color
                      : "border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${form.statusOfInspection === s.value ? s.dot : "bg-stone-600"}`} />
                  {s.value}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              Department <span className="text-amber-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {DEPARTMENTS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => set("department", d)}
                  className={`py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                    form.department === d
                      ? "border-amber-500 bg-amber-500/15 text-amber-400"
                      : "border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600 hover:text-white"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            {form.department === "Other" && (
              <input
                type="text"
                placeholder="Specify department..."
                value={form.departmentOther}
                onChange={(e) => set("departmentOther", e.target.value)}
                className="mt-3 w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm"
              />
            )}
          </div>
        </div>
      </div>

      {/* Remarks & File */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
        <SectionTitle label="Remarks & Attachment" />
        <div className="space-y-4">
          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">Remarks</label>
            <textarea
              rows={3}
              placeholder="Add any notes or observations about the inspection..."
              value={form.remarks}
              onChange={(e) => set("remarks", e.target.value)}
              className="w-full px-4 py-3 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 transition-all text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-stone-300 text-sm font-medium mb-2">
              WIR Attachment <span className="text-stone-600 font-normal">(optional)</span>
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) set("wirFile", file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                dragOver
                  ? "border-amber-500 bg-amber-500/10"
                  : form.wirFile
                  ? "border-green-500 bg-green-500/10"
                  : "border-stone-700 hover:border-stone-600 bg-stone-800/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) set("wirFile", f); }}
              />
              {form.wirFile ? (
                <div className="flex items-center justify-center gap-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-6 h-6 text-green-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-left">
                    <p className="text-white text-sm font-medium">{form.wirFile.name}</p>
                    <p className="text-stone-500 text-xs">{(form.wirFile.size / 1024).toFixed(0)} KB · Click to change</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-10 h-10 bg-stone-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-stone-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <p className="text-stone-400 text-sm font-medium">Drop file here or click to upload</p>
                  <p className="text-stone-600 text-xs mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error & Submit */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold rounded-xl text-sm transition-all hover:shadow-lg hover:shadow-amber-500/20"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Submit Report
          </>
        )}
      </button>

    </div>
  );
}

