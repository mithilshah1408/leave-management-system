import { useEffect, useState } from "react";
import { getHolidays, createHoliday, updateHoliday, deleteHoliday } from "../../services/api";
import HolidayModal from "./HolidayModal";
import "./HolidaysPage.css";
import MainLayout from "../../layout/MainLayout";

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadHolidays(); }, [year]);

  const loadHolidays = async () => {
    try {
      setLoading(true);
      const res = await getHolidays(year);
      setHolidays(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const calculateDuration = (start, end) =>
      Math.floor((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;

  const handleAdd = () => { setEditingHoliday(null); setShowModal(true); };
  const handleEdit = (holiday) => { setEditingHoliday(holiday); setShowModal(true); };
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;
    await deleteHoliday(id);
    loadHolidays();
  };

  const handleSave = async (data) => {
    try {
      if (editingHoliday) { await updateHoliday(editingHoliday.id, data); }
      else { await createHoliday(data); }
      setShowModal(false);
      loadHolidays();
    } catch (err) { alert(err.response?.data?.message || "Error saving holiday"); }
  };

  return (
      <MainLayout>
        <div className="page-container">
          <div className="page-header">
            <h2 className="page-title">Holiday Management</h2>
            <button className="primary-button" onClick={handleAdd}>Add Holiday</button>
          </div>

          <div className="filter-row">
            <label>Year:</label>
            <input type="number" className="year-input" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          {loading ? <p>Loading holidays...</p> : holidays.length === 0 ? <p>No holidays found</p> : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                  <tr><th>Name</th><th>Date Range</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                  {holidays.map(h => (
                      <tr key={h.id}>
                        <td>{h.name}</td>
                        <td>
                          <div className="range-display">{h.startDate} → {h.endDate}</div>
                          <div className="duration-text">({calculateDuration(h.startDate, h.endDate)} days)</div>
                        </td>
                        <td>
                          <button className="action-button edit-button" onClick={() => handleEdit(h)}>Edit</button>
                          <button className="action-button delete-button" onClick={() => handleDelete(h.id)}>Delete</button>
                        </td>
                      </tr>
                  ))}
                  </tbody>
                </table>
              </div>
          )}

          {showModal && (
              <HolidayModal holiday={editingHoliday} onClose={() => setShowModal(false)} onSave={handleSave} />
          )}
        </div>
      </MainLayout>
  );
}