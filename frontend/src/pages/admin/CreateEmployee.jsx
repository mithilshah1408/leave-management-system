import { useEffect, useState } from "react";
import api from "../../services/api";
import "./CreateEmployee.css";

function CreateEmployee({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    firstName: "", lastName: "", username: "",
    email: "", password: "", role: "", managerId: "", joiningDate: ""
  });
  const [managers, setManagers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    api.get("/admin/employees?page=0&size=100").then(res => {
      setManagers(res.data.content.filter(e => e.role === "MANAGER" && e.status === "ACTIVE"));
    }).catch(() => {});
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.role === "EMPLOYEE" && !form.managerId) {
      setError("Please select a manager for this employee.");
      return;
    }

    const roleMap = { ADMIN: 1, MANAGER: 2, EMPLOYEE: 3 };

    setSaving(true);
    try {
      await api.post("/admin/employees", {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        roleId: roleMap[form.role],
        managerId: form.role === "EMPLOYEE" ? Number(form.managerId) : null,
        joiningDate: form.joiningDate
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Error creating employee. Please check all fields.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="ce-overlay" onClick={onClose}>
      <div className="ce-modal" onClick={e => e.stopPropagation()}>

        <div className="ce-header">
          <h2>Create Employee</h2>
          <button className="ce-close" onClick={onClose}>✕</button>
        </div>

        <form className="ce-form" onSubmit={handleSubmit}>
          {error && <div className="ce-error">{error}</div>}

          <div className="ce-row">
            <div className="ce-field">
              <label>First Name <span className="ce-req">*</span></label>
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="John" required />
            </div>
            <div className="ce-field">
              <label>Last Name <span className="ce-req">*</span></label>
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Doe" required />
            </div>
          </div>

          <div className="ce-field">
            <label>Username <span className="ce-req">*</span></label>
            <input name="username" value={form.username} onChange={handleChange} placeholder="johndoe" required />
          </div>

          <div className="ce-field">
            <label>Email <span className="ce-req">*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@company.com" required />
          </div>

          <div className="ce-field">
            <label>Password <span className="ce-req">*</span></label>
            <div className="ce-password-wrap">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                required
                minLength={8}
              />
              <button type="button" className="ce-toggle-pw" onClick={() => setShowPassword(p => !p)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="ce-row">
            <div className="ce-field">
              <label>Role <span className="ce-req">*</span></label>
              <select name="role" value={form.role} onChange={handleChange} required>
                <option value="">Select Role</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="EMPLOYEE">Employee</option>
              </select>
            </div>
            <div className="ce-field">
              <label>Joining Date <span className="ce-req">*</span></label>
              <input name="joiningDate" type="date" value={form.joiningDate} onChange={handleChange} required />
            </div>
          </div>

          {form.role === "EMPLOYEE" && (
            <div className="ce-field">
              <label>Manager <span className="ce-req">*</span></label>
              <select name="managerId" value={form.managerId} onChange={handleChange} required>
                <option value="">Select Manager</option>
                {managers.map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
              {managers.length === 0 && <p className="ce-hint">No active managers found. Create a manager first.</p>}
            </div>
          )}

          <div className="ce-actions">
            <button type="button" className="ce-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="ce-btn-submit" disabled={saving}>
              {saving ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEmployee;
