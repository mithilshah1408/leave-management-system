import { useEffect, useState } from "react";
import api from "../../services/api";
import { getLeaveBalances, initializeYear, adjustLeaveBalance } from "../../services/api";
import AdjustBalanceModal from "./AdjustBalanceModal";
import "./LeaveBalancesPage.css";
import MainLayout from "../../layout/MainLayout";

export default function LeaveBalancesPage() {
  const currentYear = new Date().getFullYear();
  const [employees, setEmployees] = useState([]);
  const [balances, setBalances] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [year, setYear] = useState(currentYear);
  const [selectedBalance, setSelectedBalance] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchEmployees(); fetchBalances("", currentYear, 0); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/admin/employees?page=0&size=100");
      setEmployees((res.data.content || res.data || []).filter(emp => emp.status === "ACTIVE"));
    } catch (error) { console.error("Employee fetch failed:", error); }
  };

  const fetchBalances = async (userId, year, pageNumber = 0) => {
    try {
      setLoading(true);
      const res = await getLeaveBalances(userId || null, year, pageNumber, size);
      if (Array.isArray(res.data)) {
        setBalances(res.data); setTotalPages(1); setTotalElements(res.data.length); setPage(0);
      } else {
        setBalances(res.data.content || []); setTotalPages(res.data.totalPages || 0);
        setTotalElements(res.data.totalElements || 0); setPage(res.data.number || 0);
      }
    } catch (error) { console.error("Balance fetch failed:", error); }
    finally { setLoading(false); }
  };

  const handleSearch = () => fetchBalances(selectedUser, year, 0);
  const handleInitialize = async () => { await initializeYear(year); fetchBalances(selectedUser, year, 0); };
  const handleAdjust = async (id, newTotal) => {
    await adjustLeaveBalance(id, parseInt(newTotal));
    setSelectedBalance(null);
    fetchBalances(selectedUser, year, page);
  };

  return (
      <MainLayout>
        <div className="leave-balances-page">
          <h2>Leave Balance Management</h2>

          <div className="filters">
            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}>
              <option value="">All Employees</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
            </select>
            <input type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            <button className="btn-primary" onClick={handleSearch}>Search</button>
            <button className="btn-secondary" onClick={handleInitialize}>Initialize Year</button>
          </div>

          <div className="table-wrapper">
            <table className="balances-table">
              <thead>
              <tr>
                <th>Employee</th><th>Leave Type</th><th>Year</th>
                <th>Allocated</th><th>Used</th><th>Remaining</th><th>Action</th>
              </tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr><td colSpan="7" className="loading">Loading...</td></tr>
              ) : balances.length === 0 ? (
                  <tr><td colSpan="7" className="no-data">No records found</td></tr>
              ) : (
                  balances.map(b => (
                      <tr key={b.id}>
                        <td>{b.userName}</td>
                        <td>{b.leaveTypeName}</td>
                        <td>{b.year}</td>
                        <td>{b.totalAllocated}</td>
                        <td>{b.usedDays}</td>
                        <td>
                      <span className={b.remainingDays > 0 ? "badge badge-success" : "badge badge-danger"}>
                        {b.remainingDays}
                      </span>
                        </td>
                        <td><button className="btn-small" onClick={() => setSelectedBalance(b)}>Adjust</button></td>
                      </tr>
                  ))
              )}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => fetchBalances(selectedUser, year, page - 1)}>Previous</button>
            <span>Page {page + 1} of {totalPages} | Total Records: {totalElements}</span>
            <button disabled={page + 1 >= totalPages} onClick={() => fetchBalances(selectedUser, year, page + 1)}>Next</button>
          </div>

          {selectedBalance && (
              <AdjustBalanceModal balance={selectedBalance} onClose={() => setSelectedBalance(null)} onSave={handleAdjust} />
          )}
        </div>
      </MainLayout>
  );
}