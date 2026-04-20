"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface UserRow {
  id: string;
  email: string;
  phone: string;
  role: string;
  plainPassword: string | null;
  createdAt: string;
  _count: { inspections: number };
}

export default function UsersPanel() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Add user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", phone: "", password: "", role: "user" as "user" | "admin" });
  const [showAddPass, setShowAddPass] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setUsers((u) => u.filter((x) => x.id !== id));
        flash("success", "User deleted successfully");
      } else {
        flash("error", data.error || "Delete failed");
      }
    } catch (e) {
      flash("error", "Delete failed");
    } finally {
      setDeleting(null);
      setDeleteConfirm(null);
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    setTogglingRole(id);
    const newRole = currentRole === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((u) => u.map((x) => (x.id === id ? { ...x, role: newRole } : x)));
        flash("success", `Role changed to ${newRole}`);
      } else {
        flash("error", data.error || "Role change failed");
      }
    } catch (e) {
      flash("error", "Role change failed");
    } finally {
      setTogglingRole(null);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError("");
    setAdding(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (res.ok) {
        setUsers((u) => [...u, { ...data, _count: { inspections: 0 } }]);
        setAddForm({ email: "", phone: "", password: "", role: "user" });
        setShowAddForm(false);
        flash("success", `User ${data.email} created successfully`);
      } else {
        setAddError(data.error || "Failed to create user");
      }
    } catch (e) {
      setAddError("Failed to create user");
    } finally {
      setAdding(false);
    }
  };

  const togglePassword = (id: string) =>
    setShowPasswords((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-5 animate-fadeInUp">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg">User Management</h2>
          <p className="text-stone-500 text-sm mt-0.5">{users.length} registered users</p>
        </div>
        <button
          onClick={() => { setShowAddForm((v) => !v); setAddError(""); }}
          className={`flex items-center gap-2 px-4 py-2.5 font-semibold rounded-xl text-sm transition-all ${
            showAddForm
              ? "bg-stone-800 text-stone-300 border border-stone-700"
              : "bg-amber-500 hover:bg-amber-400 text-stone-900 hover:shadow-md hover:shadow-amber-500/20"
          }`}
        >
          {showAddForm ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add User
            </>
          )}
        </button>
      </div>

      {/* Flash message */}
      {msg && (
        <div className={`p-3 rounded-xl text-sm flex items-center gap-2 animate-fadeIn ${
          msg.type === "success"
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        }`}>
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 flex-shrink-0">
            {msg.type === "success" ? (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            ) : (
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            )}
          </svg>
          {msg.text}
        </div>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="bg-stone-900 border border-amber-500/20 rounded-2xl overflow-hidden animate-fadeIn">
          <div className="px-6 py-4 border-b border-stone-800 bg-amber-500/5">
            <h3 className="text-white font-semibold">Add New User</h3>
            <p className="text-stone-500 text-xs mt-0.5">Create a new inspector or admin account</p>
          </div>
          <form onSubmit={handleAddUser} className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="inspector@company.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  placeholder="+971 XX XXX XXXX"
                  value={addForm.phone}
                  onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))}
                  required
                  className="w-full px-4 py-2.5 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all"
                />
              </div>
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showAddPass ? "text" : "password"}
                    placeholder="Set a password"
                    value={addForm.password}
                    onChange={(e) => setAddForm((f) => ({ ...f, password: e.target.value }))}
                    required
                    minLength={6}
                    className="w-full px-4 pr-11 py-2.5 bg-stone-800 border border-stone-700 text-white placeholder-stone-500 rounded-xl focus:outline-none focus:border-amber-500 text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAddPass((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {showAddPass ? (
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
              </div>
              <div>
                <label className="block text-stone-300 text-sm font-medium mb-2">Role</label>
                <div className="flex gap-2">
                  {(["user", "admin"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAddForm((f) => ({ ...f, role: r }))}
                      className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all capitalize ${
                        addForm.role === r
                          ? r === "admin"
                            ? "border-amber-500 bg-amber-500/15 text-amber-400"
                            : "border-stone-500 bg-stone-700 text-white"
                          : "border-stone-700 bg-stone-800 text-stone-400 hover:border-stone-600"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {addError}
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-900 font-bold rounded-xl text-sm transition-all"
              >
                {adding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-900/30 border-t-stone-900 rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create User
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setShowAddForm(false); setAddError(""); }}
                className="px-5 py-2.5 text-stone-400 hover:text-white border border-stone-700 hover:border-stone-600 rounded-xl text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between">
          <h3 className="text-white font-semibold">All Accounts</h3>
          <span className="text-stone-500 text-sm">{users.length} users</span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 justify-center py-16">
            <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-stone-400 text-sm">Loading users...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-stone-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-stone-800/40">
                  {["Email", "Phone", "Password", "Role", "Reports", "Joined", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3.5 text-left text-stone-500 text-xs font-medium uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800">
                {users.map((u) => (
                  <tr key={u.id} className={`hover:bg-stone-800/20 transition-colors ${u.id === currentUser?.id ? "bg-amber-500/5" : ""}`}>
                    {/* Email */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${u.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-stone-700 text-stone-300"}`}>
                          {u.email[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium">{u.email}</p>
                          {u.id === currentUser?.id && (
                            <span className="text-amber-500 text-xs">(you)</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Phone */}
                    <td className="px-4 py-4 text-stone-300 whitespace-nowrap">{u.phone}</td>
                    {/* Password */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {u.plainPassword ? (
                        <div className="flex items-center gap-2">
                          <span className="text-stone-300 font-mono text-sm">
                            {showPasswords[u.id] ? u.plainPassword : "•".repeat(Math.min(u.plainPassword.length, 10))}
                          </span>
                          <button
                            onClick={() => togglePassword(u.id)}
                            className="text-stone-600 hover:text-stone-300 transition-colors flex-shrink-0"
                          >
                            {showPasswords[u.id] ? (
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-stone-600 text-xs">—</span>
                      )}
                    </td>
                    {/* Role */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg border text-xs font-medium ${
                        u.role === "admin"
                          ? "bg-amber-500/15 text-amber-400 border-amber-500/20"
                          : "bg-stone-700/50 text-stone-400 border-stone-600"
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    {/* Reports */}
                    <td className="px-4 py-4 text-stone-400 whitespace-nowrap">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60" />
                        {u._count.inspections}
                      </span>
                    </td>
                    {/* Joined */}
                    <td className="px-4 py-4 text-stone-500 text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4 whitespace-nowrap">
                      {u.id === currentUser?.id ? (
                        <span className="text-stone-700 text-xs">—</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Toggle role */}
                          <button
                            onClick={() => handleToggleRole(u.id, u.role)}
                            disabled={togglingRole === u.id}
                            title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                              u.role === "admin"
                                ? "border-stone-600 text-stone-400 hover:border-stone-500 hover:text-white"
                                : "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            }`}
                          >
                            {togglingRole === u.id ? (
                              <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                              </svg>
                            )}
                            {u.role === "admin" ? "Demote" : "Make Admin"}
                          </button>

                          {/* Delete */}
                          {deleteConfirm === u.id ? (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => handleDelete(u.id)}
                                disabled={deleting === u.id}
                                className="flex items-center gap-1 px-2.5 py-1.5 bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-medium transition-all"
                              >
                                {deleting === u.id ? (
                                  <div className="w-3 h-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                ) : "Confirm"}
                              </button>
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-2 py-1.5 text-stone-500 hover:text-white text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(u.id)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-stone-700 text-stone-500 hover:border-red-500/40 hover:text-red-400 text-xs font-medium transition-all"
                            >
                              <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Remove
                            </button>
                          )}
                        </div>
                      )}
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
