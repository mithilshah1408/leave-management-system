import { useState } from "react";
import "./HolidaysPage.css";

export default function HolidayModal({ holiday, onClose, onSave }) {
  const [name, setName] = useState(holiday?.name || "");
  const [startDate, setStartDate] = useState(holiday?.startDate || "");
  const [endDate, setEndDate] = useState(holiday?.endDate || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    setSaving(true);
    try {
      await onSave({ name, startDate, endDate });
    } catch (err) {
      setError(err?.message || "Failed to save holiday.");
      setSaving(false);
    }
  };

  return (
    <div className="hm-overlay" onClick={onClose}>
      <div className="hm-modal" onClick={e => e.stopPropagation()}>

        <div className="hm-header">
          <h2>{holiday ? "Edit Holiday" : "Add Holiday"}</h2>
          <button className="hm-close" type="button" onClick={onClose}>✕</button>
        </div>

        <form className="hm-form" onSubmit={handleSubmit}>
          {error && <div className="hm-error">{error}</div>}

          <div className="hm-field">
            <label>Holiday Name <span className="hm-req">*</span></label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Christmas Day" required />
          </div>

          <div className="hm-row">
            <div className="hm-field">
              <label>Start Date <span className="hm-req">*</span></label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div className="hm-field">
              <label>End Date <span className="hm-req">*</span></label>
              <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)} required />
            </div>
          </div>

          <div className="hm-actions">
            <button type="button" className="hm-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="hm-btn-save" disabled={saving}>
              {saving ? "Saving..." : holiday ? "Save Changes" : "Add Holiday"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
