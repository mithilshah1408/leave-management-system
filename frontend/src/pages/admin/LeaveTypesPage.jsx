import { useEffect, useState } from "react";
import api from "../../services/api";
import MainLayout from "../../layout/MainLayout";
import "./LeaveTypes.css";

const LeaveTypesPage = () => {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", maxDaysPerYear: "", description: "", carryForwardAllowed: false });
  const [showCreate, setShowCreate] = useState(false);
  const [newLeave, setNewLeave] = useState({ name: "", maxDaysPerYear: "", description: "", carryForwardAllowed: false });

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/leave-types");
      setLeaveTypes(res.data);
    } catch { alert("Failed to load leave types"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaveTypes(); }, []);

  const validateLeave = (data) => {
    if (!data.name.trim()) { alert("Leave type name is required"); return false; }
    if (data.maxDaysPerYear === "" || isNaN(data.maxDaysPerYear)) { alert("Max days is required"); return false; }
    const days = Number(data.maxDaysPerYear);
    if (days < 0) { alert("Max days must be 0 or greater"); return false; }
    if (days > 365) { alert("Max days cannot exceed 365"); return false; }
    return true;
  };

  const handleCreate = async () => {
    if (!validateLeave(newLeave)) return;
    try {
      await api.post("/admin/leave-types", { name: newLeave.name.trim(), maxDaysPerYear: Number(newLeave.maxDaysPerYear), description: newLeave.description, carryForwardAllowed: newLeave.carryForwardAllowed });
      setShowCreate(false);
      setNewLeave({ name: "", maxDaysPerYear: "", description: "", carryForwardAllowed: false });
      fetchLeaveTypes();
    } catch (err) { alert(err.response?.data?.message || "Failed to create leave type"); }
  };

  const toggleStatus = async (leave) => {
    try {
      if (leave.status === "ACTIVE") { await api.patch(`/admin/leave-types/${leave.id}/disable`); }
      else { await api.patch(`/admin/leave-types/${leave.id}/enable`); }
      fetchLeaveTypes();
    } catch { alert("Failed to update status"); }
  };

  const startEdit = (leave) => {
    setEditingId(leave.id);
    setEditData({ name: leave.name, maxDaysPerYear: leave.maxDaysPerYear, description: leave.description || "", carryForwardAllowed: leave.carryForwardAllowed });
  };

  const saveEdit = async (id) => {
    if (!validateLeave(editData)) return;
    try {
      await api.put(`/admin/leave-types/${id}`, { name: editData.name.trim(), maxDaysPerYear: Number(editData.maxDaysPerYear), description: editData.description, carryForwardAllowed: editData.carryForwardAllowed });
      setEditingId(null);
      fetchLeaveTypes();
    } catch (err) { alert(err.response?.data?.message || "Failed to update leave type"); }
  };

  return (
      <MainLayout>
        <div className="leave-types-container">
          <div className="header">
            <h2>Leave Types Management</h2>
            <button className="btn-create" onClick={() => setShowCreate(true)}>+ Create Leave Type</button>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && (
              <div className="table-wrapper">
                <table className="leave-types-table">
                  <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Max Days / Year</th>
                    <th>Description</th><th>Carry Forward</th><th>Status</th><th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {leaveTypes.map(leave => (
                      <tr key={leave.id}>
                        <td>{leave.id}</td>
                        <td>{editingId === leave.id ? <input value={editData.name} onChange={e => setEditData({ ...editData, name: e.target.value })} /> : leave.name}</td>
                        <td>{editingId === leave.id ? <input type="number" value={editData.maxDaysPerYear} onChange={e => setEditData({ ...editData, maxDaysPerYear: e.target.value })} /> : leave.maxDaysPerYear}</td>
                        <td>{editingId === leave.id ? <input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} /> : leave.description || "-"}</td>
                        <td>{editingId === leave.id ? <input type="checkbox" checked={editData.carryForwardAllowed} onChange={e => setEditData({ ...editData, carryForwardAllowed: e.target.checked })} /> : leave.carryForwardAllowed ? "Yes" : "No"}</td>
                        <td><span className={leave.status === "ACTIVE" ? "badge badge-active" : "badge badge-inactive"}>{leave.status}</span></td>
                        <td>
                          {editingId === leave.id ? (
                              <>
                                <button className="btn-save" onClick={() => saveEdit(leave.id)}>Save</button>
                                <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                              </>
                          ) : (
                              <>
                                <button className="btn-edit" onClick={() => startEdit(leave)}>Edit</button>
                                <button className={leave.status === "ACTIVE" ? "btn-disable" : "btn-enable"} onClick={() => toggleStatus(leave)}>
                                  {leave.status === "ACTIVE" ? "Disable" : "Enable"}
                                </button>
                              </>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {showCreate && (
              <div className="modal">
                <div className="modal-content">
                  <h3>Create Leave Type</h3>
                  <input placeholder="Name" value={newLeave.name} onChange={e => setNewLeave({ ...newLeave, name: e.target.value })} />
                  <input type="number" placeholder="Max Days Per Year" value={newLeave.maxDaysPerYear} onChange={e => setNewLeave({ ...newLeave, maxDaysPerYear: e.target.value })} />
                  <input placeholder="Description (Optional)" value={newLeave.description} onChange={e => setNewLeave({ ...newLeave, description: e.target.value })} />
                  <label>
                    <input type="checkbox" checked={newLeave.carryForwardAllowed} onChange={e => setNewLeave({ ...newLeave, carryForwardAllowed: e.target.checked })} />
                    Carry Forward Allowed
                  </label>
                  <div>
                    <button className="btn-save" onClick={handleCreate}>Save</button>
                    <button className="btn-cancel" onClick={() => setShowCreate(false)}>Cancel</button>
                  </div>
                </div>
              </div>
          )}
        </div>
      </MainLayout>
  );
};

export default LeaveTypesPage;