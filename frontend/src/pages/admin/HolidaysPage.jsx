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

  // Re-throw so the modal's catch block receives the server's error message
  const handleSave = async (data) => {
    try {
      if (editingHoliday) {
        await updateHoliday(editingHoliday.id, data);
      } else {
        await createHoliday(data);
      }
      setShowModal(false);
      loadHolidays();
    } catch (err) {
      // Extract the server's message and re-throw so the modal shows it inline
      const serverMessage = err?.response?.data?.message || "Failed to save holiday.";
      throw new Error(serverMessage);
    }
  };

  const formatDate = (d) => new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
      <MainLayout>
        <div className="page-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">Holidays</h1>
              <p style={{ color: "#6b7280", fontSize: 14, margin: "4px 0 0" }}>{holidays.length} holidays in {year}</p>
            </div>
            <button className="primary-button" onClick={handleAdd}>+ Add Holiday</button>
          </div>

          <div className="filter-row">
            <label style={{ fontWeight: 600, fontSize: 14, color: "#374151" }}>Year</label>
            <input type="number" className="year-input" value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>

          {loading ? <p>Loading holidays...</p> : holidays.length === 0 ? (
              <div className="page-empty">
                <p>No holidays found for {year}</p>
                <button className="primary-button" onClick={handleAdd}>Add the first one</button>
              </div>
          ) : (
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                  <tr><th>Name</th><th>Date Range</th><th>Duration</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                  {holidays.map(h => (
                      <tr key={h.id}>
                        <td style={{ fontWeight: 500 }}>{h.name}</td>
                        <td>
                          <div className="range-display">{formatDate(h.startDate)} → {formatDate(h.endDate)}</div>
                        </td>
                        <td>
                          <span className="duration-badge">{calculateDuration(h.startDate, h.endDate)} day{calculateDuration(h.startDate, h.endDate) > 1 ? "s" : ""}</span>
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