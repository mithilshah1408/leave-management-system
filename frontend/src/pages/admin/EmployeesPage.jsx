import { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/api";
import CreateEmployee from "./CreateEmployee";
import "./EmployeesPage.css";

function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [managers, setManagers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/employees?page=0&size=50");
      setEmployees(res.data.content);
      setManagers(res.data.content.filter(emp => emp.role === "MANAGER" && emp.status === "ACTIVE"));
    } catch {
      alert("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (emp) => {
    try {
      await api.patch(`/admin/employees/${emp.id}/status`);
      setEmployees(prev => prev.map(e =>
          e.id === emp.id ? { ...e, status: e.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" } : e
      ));
    } catch { alert("Status update failed"); }
  };

  const startEdit = (emp) => {
    setEditingId(emp.id);
    setEditData({ firstName: emp.firstName, lastName: emp.lastName, email: emp.email, managerId: emp.managerId || "" });
  };

  const cancelEdit = () => setEditingId(null);

  const handleChange = (e) => setEditData({ ...editData, [e.target.name]: e.target.value });

  const saveUpdate = async (emp) => {
    try {
      await api.put(`/admin/employees/${emp.id}`, {
        firstName: editData.firstName, lastName: editData.lastName,
        email: editData.email, managerId: editData.managerId || null,
      });
      setEmployees(prev => prev.map(e =>
          e.id === emp.id ? {
            ...e, firstName: editData.firstName, lastName: editData.lastName,
            email: editData.email, managerId: editData.managerId,
            managerName: managers.find(m => m.id == editData.managerId)
                ? `${managers.find(m => m.id == editData.managerId).firstName} ${managers.find(m => m.id == editData.managerId).lastName}`
                : null,
          } : e
      ));
      setEditingId(null);
    } catch { alert("Update failed"); }
  };

  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : "-";

  return (
      <MainLayout>
        <div className="employees-container">
          <div className="header">
            <h2>Employee Management</h2>
            <button className="btn-primary" onClick={() => setShowForm(true)}>+ Create Employee</button>
          </div>

          {loading && <p>Loading...</p>}

          {!loading && (
              <div className="table-wrapper">
                <table className="employees-table">
                  <thead>
                  <tr>
                    <th>ID</th><th>Name</th><th>Email</th><th>Role</th>
                    <th>Joining Date</th><th>Status</th><th>Manager</th><th>Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {employees.map(emp => (
                      <tr key={emp.id}>
                        <td>{emp.id}</td>
                        <td>
                          {editingId === emp.id ? (
                              <>
                                <input name="firstName" value={editData.firstName} onChange={handleChange} />
                                <input name="lastName" value={editData.lastName} onChange={handleChange} />
                              </>
                          ) : `${emp.firstName} ${emp.lastName}`}
                        </td>
                        <td>
                          {editingId === emp.id
                              ? <input name="email" value={editData.email} onChange={handleChange} />
                              : emp.email}
                        </td>
                        <td>{emp.role}</td>
                        <td>{formatDate(emp.joiningDate)}</td>
                        <td>
                          <span className={emp.status === "ACTIVE" ? "badge badge-active" : "badge badge-inactive"}>{emp.status}</span>
                          <input type="checkbox" checked={emp.status === "ACTIVE"} onChange={() => toggleStatus(emp)} />
                        </td>
                        <td>
                          {emp.role === "EMPLOYEE" ? (
                              editingId === emp.id ? (
                                  <select name="managerId" value={editData.managerId} onChange={handleChange}>
                                    <option value="">Select Manager</option>
                                    {managers.map(m => <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>)}
                                  </select>
                              ) : emp.managerName || "-"
                          ) : "-"}
                        </td>
                        <td>
                          {editingId === emp.id ? (
                              <>
                                <button className="btn-save" onClick={() => saveUpdate(emp)}>Save</button>
                                <button className="btn-cancel" onClick={cancelEdit}>Cancel</button>
                              </>
                          ) : (
                              <button className="btn-edit" onClick={() => startEdit(emp)}>Edit</button>
                          )}
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {showForm && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <CreateEmployee onClose={() => setShowForm(false)} onSuccess={loadData} />
                </div>
              </div>
          )}
        </div>
      </MainLayout>
  );
}

export default EmployeesPage;