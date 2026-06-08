import { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/api";
import CreateEmployee from "./CreateEmployee";
import "./EmployeesPage.css";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editModal, setEditModal] = useState(null);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/employees?page=0&size=100");
      // Sort by ID so order never changes after edits
      const sorted = [...res.data.content].sort((a, b) => a.id - b.id);
      setEmployees(sorted);
      setManagers(sorted.filter(e => e.role === "MANAGER" && e.status === "ACTIVE"));
    } catch {
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (emp) => {
    try {
      await api.patch(`/admin/employees/${emp.id}/status`);
      // Update in-place, preserving row order
      setEmployees(prev =>
          prev.map(e => e.id === emp.id
              ? { ...e, status: e.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
              : e
          )
      );
    } catch { alert("Status update failed"); }
  };

  const openEdit = (emp) => {
    setEditData({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, managerId: emp.managerId || "" });
    setError("");
    setEditModal(emp);
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    try {
      const res = await api.put(`/admin/employees/${editModal.id}`, {
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email,
        managerId: editData.managerId ? Number(editData.managerId) : undefined,
      });
      // Update the employee in-place at its current position — don't re-sort/re-fetch
      setEmployees(prev =>
          prev.map(e => e.id === editModal.id
              ? { ...e, ...res.data, id: editModal.id }
              : e
          )
      );
      setEditModal(null);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(e =>
      `${e.firstName} ${e.lastName} ${e.email} ${e.role}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColor = { ADMIN: "#7c3aed", MANAGER: "#2563eb", EMPLOYEE: "#059669" };
  const formatDate = d => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

  return (
      <MainLayout>
        <div className="ep-page">
          <div className="ep-header">
            <div>
              <h1 className="ep-title">Employees</h1>
              <p className="ep-sub">{employees.length} total · {employees.filter(e => e.status === "ACTIVE").length} active</p>
            </div>
            <button className="ep-btn-primary" onClick={() => setShowCreate(true)}>+ New Employee</button>
          </div>

          <div className="ep-search-row">
            <input className="ep-search" placeholder="Search by name, email or role…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? <p className="ep-loading">Loading...</p> : (
              <div className="ep-table-wrap">
                <table className="ep-table">
                  <thead>
                  <tr>
                    <th>Name</th><th>Email</th><th>Role</th>
                    <th>Manager</th><th>Joined</th><th>Status</th><th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {filtered.length === 0 ? (
                      <tr><td colSpan={7} className="ep-empty">No employees found</td></tr>
                  ) : filtered.map(emp => (
                      <tr key={emp.id}>
                        <td>
                          <div className="ep-name-cell">
                            <div className="ep-avatar" style={{ background: roleColor[emp.role] || "#6b7280" }}>
                              {emp.firstName[0]}{emp.lastName[0]}
                            </div>
                            <div>
                              <div className="ep-fullname">{emp.firstName} {emp.lastName}</div>
                              <div className="ep-username">@{emp.username || emp.email.split("@")[0]}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ep-email">{emp.email}</td>
                        <td>
                      <span className="ep-role-badge" style={{ background: roleColor[emp.role] + "20", color: roleColor[emp.role] }}>
                        {emp.role}
                      </span>
                        </td>
                        <td className="ep-manager">{emp.managerName || <span className="ep-na">—</span>}</td>
                        <td className="ep-date">{formatDate(emp.joiningDate)}</td>
                        <td>
                          {emp.role !== "ADMIN" ? (
                              <label className="ep-toggle">
                                <input type="checkbox" checked={emp.status === "ACTIVE"} onChange={() => toggleStatus(emp)} />
                                <span className="ep-toggle-slider" />
                              </label>
                          ) : (
                              <span style={{ fontSize:"12px", color:"#94a3b8", fontStyle:"italic" }}>protected</span>
                          )}
                        </td>
                        <td>
                          <button className="ep-btn-edit" onClick={() => openEdit(emp)}>Edit</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {showCreate && <CreateEmployee onClose={() => setShowCreate(false)} onSuccess={loadData} />}

          {editModal && (
              <div className="ep-overlay" onClick={() => setEditModal(null)}>
                <div className="ep-edit-modal" onClick={e => e.stopPropagation()}>
                  <div className="ep-edit-header">
                    <h2>Edit — {editModal.firstName} {editModal.lastName}</h2>
                    <button className="ep-close" onClick={() => setEditModal(null)}>✕</button>
                  </div>
                  <form className="ep-edit-form" onSubmit={saveEdit}>
                    {error && <div className="ep-error">{error}</div>}
                    <div className="ep-edit-row">
                      <div className="ep-field">
                        <label>First Name</label>
                        <input value={editData.firstName} onChange={e => setEditData({...editData, firstName: e.target.value})} required />
                      </div>
                      <div className="ep-field">
                        <label>Last Name</label>
                        <input value={editData.lastName} onChange={e => setEditData({...editData, lastName: e.target.value})} required />
                      </div>
                    </div>
                    <div className="ep-field">
                      <label>Email</label>
                      <input type="email" value={editData.email} onChange={e => setEditData({...editData, email: e.target.value})} required />
                    </div>
                    {editModal.role === "EMPLOYEE" && (
                        <div className="ep-field">
                          <label>Manager</label>
                          <select value={editData.managerId} onChange={e => setEditData({...editData, managerId: e.target.value})}>
                            <option value="">Keep current manager</option>
                            {managers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                          </select>
                        </div>
                    )}
                    <div className="ep-edit-actions">
                      <button type="button" className="ep-btn-cancel" onClick={() => setEditModal(null)}>Cancel</button>
                      <button type="submit" className="ep-btn-primary" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                    </div>
                  </form>
                </div>
              </div>
          )}
        </div>
      </MainLayout>
  );
}

export default EmployeesPage;
