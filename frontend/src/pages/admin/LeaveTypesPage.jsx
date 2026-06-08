import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layout/MainLayout";
import "./LeaveTypes.css";

const EMPTY_FORM = { name: "", maxDaysPerYear: "", description: "", carryForwardAllowed: false };

const LeaveTypesPage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(null);   // holds leave object being edited
  const [createModal, setCreateModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/leave-types");
      // Bug 5 fix: always sort by id so order never changes after edit
      setLeaveTypes([...res.data].sort((a, b) => a.id - b.id));
    } catch { setError("Failed to load leave types"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaveTypes(); }, []);

  const validate = (data) => {
    if (!data.name.trim()) return "Name is required";
    if (data.maxDaysPerYear === "" || isNaN(data.maxDaysPerYear)) return "Max days is required";
    const d = Number(data.maxDaysPerYear);
    if (d < 0) return "Max days cannot be negative";
    if (d > 365) return "Max days cannot exceed 365";
    return null;
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setError("");
    setCreateModal(true);
  };

  const openEdit = (leave) => {
    setForm({ name: leave.name, maxDaysPerYear: leave.maxDaysPerYear, description: leave.description || "", carryForwardAllowed: leave.carryForwardAllowed });
    setError("");
    setEditModal(leave);
  };

  const closeModal = () => { setCreateModal(false); setEditModal(null); setError(""); };

  const handleCreate = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setSaving(true); setError("");
    try {
      await api.post("/admin/leave-types", { name: form.name.trim(), maxDaysPerYear: Number(form.maxDaysPerYear), description: form.description, carryForwardAllowed: Boolean(form.carryForwardAllowed) });
      setCreateModal(false);
      fetchLeaveTypes();
    } catch (e) { setError(e.response?.data?.message || "Failed to create leave type"); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const err = validate(form);
    if (err) { setError(err); return; }
    setSaving(true); setError("");
    try {
      await api.put(`/admin/leave-types/${editModal.id}`, { name: form.name.trim(), maxDaysPerYear: Number(form.maxDaysPerYear), description: form.description, carryForwardAllowed: Boolean(form.carryForwardAllowed) });
      setEditModal(null);
      fetchLeaveTypes();
    } catch (e) { setError(e.response?.data?.message || "Failed to update leave type"); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (leave) => {
    try {
      if (leave.status === "ACTIVE") { await api.patch(`/admin/leave-types/${leave.id}/disable`); }
      else { await api.patch(`/admin/leave-types/${leave.id}/enable`); }
      fetchLeaveTypes();
    } catch { alert("Failed to update status"); }
  };

  const showModal = createModal || editModal;
  const isEdit = Boolean(editModal);

  return (
    <MainLayout>
      <div className="lt-page">

        {/* Header */}
        <div className="lt-header">
          <div>
            <h1 className="lt-title">Leave Types</h1>
            <p className="lt-sub">{leaveTypes.length} types configured</p>
          </div>
          <button className="lt-btn-primary" onClick={openCreate}>+ New Leave Type</button>
        </div>

        {/* Cards grid */}
        {loading ? <p className="lt-loading">Loading...</p> : (
          <div className="lt-grid">
            {leaveTypes.map(lt => (
              <div key={lt.id} className={`lt-card ${lt.status === "INACTIVE" ? "lt-card--inactive" : ""}`}>
                <div className="lt-card-header">
                  <span className="lt-card-name">{lt.name}</span>
                  <span className={`lt-badge ${lt.status === "ACTIVE" ? "lt-badge--active" : "lt-badge--inactive"}`}>
                    {lt.status}
                  </span>
                </div>
                <div className="lt-card-body">
                  <div className="lt-stat">
                    <span className="lt-stat-value">{lt.maxDaysPerYear}</span>
                    <span className="lt-stat-label">days / year</span>
                  </div>
                  <div className="lt-meta">
                    <span className={`lt-carry ${lt.carryForwardAllowed ? "lt-carry--yes" : "lt-carry--no"}`}>
                      {lt.carryForwardAllowed ? "✓ Carry forward" : "✗ No carry forward"}
                    </span>
                    {lt.description && <p className="lt-desc">{lt.description}</p>}
                  </div>
                </div>
                <div className="lt-card-actions">
                  <button className="lt-btn-edit" onClick={() => openEdit(lt)}>Edit</button>
                  <button className={lt.status === "ACTIVE" ? "lt-btn-disable" : "lt-btn-enable"} onClick={() => toggleStatus(lt)}>
                    {lt.status === "ACTIVE" ? "Disable" : "Enable"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="lt-overlay" onClick={closeModal}>
            <div className="lt-modal" onClick={e => e.stopPropagation()}>
              <div className="lt-modal-header">
                <h2>{isEdit ? `Edit — ${editModal.name}` : "New Leave Type"}</h2>
                <button className="lt-modal-close" onClick={closeModal}>✕</button>
              </div>

              <form className="lt-modal-form" onSubmit={isEdit ? handleEdit : handleCreate}>
                {error && <div className="lt-error">{error}</div>}

                <div className="lt-field">
                  <label>Name <span className="lt-required">*</span></label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Sick Leave" required />
                </div>

                <div className="lt-field">
                  <label>Max Days per Year <span className="lt-required">*</span></label>
                  <input type="number" min="0" max="365" value={form.maxDaysPerYear} onChange={e => setForm({...form, maxDaysPerYear: e.target.value})} placeholder="e.g. 10" required />
                </div>

                <div className="lt-field">
                  <label>Description <span className="lt-optional">(optional)</span></label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Brief description of when this leave applies..." rows={3} />
                </div>

                <label className="lt-checkbox-label">
                  <input type="checkbox" checked={form.carryForwardAllowed} onChange={e => setForm({...form, carryForwardAllowed: e.target.checked})} />
                  <span>Allow carry forward to next year</span>
                </label>

                <div className="lt-modal-actions">
                  <button type="button" className="lt-btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="lt-btn-primary" disabled={saving}>
                    {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LeaveTypesPage;
