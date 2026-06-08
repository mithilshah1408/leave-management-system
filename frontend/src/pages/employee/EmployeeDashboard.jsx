import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layout/MainLayout";
import api from "../../services/api";
import "./EmployeeDashboard.css";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary]           = useState({ pending: 0, approved: 0, rejected: 0 });
  const [recentRequests, setRecentRequests] = useState([]);
  const [leaveBalances, setLeaveBalances]   = useState([]);
  const [balanceIndex, setBalanceIndex]     = useState(0);
  const [loading, setLoading]               = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [requestsRes, balancesRes] = await Promise.all([
        api.get("/leave-requests/my"),
        api.get("/leave-balances/my"),
      ]);

      const requests = Array.isArray(requestsRes.data) ? requestsRes.data : [];
      setSummary({
        pending:  requests.filter(r => r.status === "PENDING").length,
        approved: requests.filter(r => r.status === "APPROVED").length,
        rejected: requests.filter(r => r.status === "REJECTED").length,
      });
      setRecentRequests(requests.filter(r => r.status !== "CANCELLED").slice(0, 5));
      setLeaveBalances(Array.isArray(balancesRes.data) ? balancesRes.data : []);
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds so status changes appear without manual reload
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Balance card navigation
  const prevBalance = () => setBalanceIndex(i => (i - 1 + leaveBalances.length) % leaveBalances.length);
  const nextBalance = () => setBalanceIndex(i => (i + 1) % leaveBalances.length);

  const b = leaveBalances[balanceIndex];
  const pct = b && b.totalAllocated > 0 ? Math.round((b.usedDays / b.totalAllocated) * 100) : 0;

  return (
      <MainLayout>
        <div className="ed-page">
          <h1 className="ed-title">My Dashboard</h1>

          {loading ? (
              <div className="ed-loading"><div className="ed-spinner" /><span>Loading…</span></div>
          ) : (
              <>
                {/* ── Leave Request Summary ── */}
                <h2 className="ed-section-title">Leave Request Summary</h2>
                <div className="ed-summary-grid">
                  <div className="ed-summary-card ed-pending">
                    <span className="ed-summary-label">Pending</span>
                    <span className="ed-summary-value">{summary.pending}</span>
                  </div>
                  <div className="ed-summary-card ed-approved">
                    <span className="ed-summary-label">Approved</span>
                    <span className="ed-summary-value">{summary.approved}</span>
                  </div>
                  <div className="ed-summary-card ed-rejected">
                    <span className="ed-summary-label">Rejected</span>
                    <span className="ed-summary-value">{summary.rejected}</span>
                  </div>
                </div>

                {/* ── Leave Balances Flashcard ── */}
                <h2 className="ed-section-title">My Leave Balances</h2>
                {leaveBalances.length === 0 ? (
                    <p className="ed-empty">No leave balances found for this year.</p>
                ) : (
                    <div className="ed-flashcard-wrap">
                      <button className="ed-nav-btn" onClick={prevBalance} disabled={leaveBalances.length <= 1}>‹</button>

                      <div className="ed-flashcard">
                        <div className="ed-flashcard-header">
                          <span className="ed-flashcard-name">{b.leaveTypeName}</span>
                          <span className={`ed-flashcard-badge ${b.remainingDays <= 0 ? "badge-empty" : b.remainingDays <= 2 ? "badge-low" : "badge-ok"}`}>
                      {b.remainingDays} day{b.remainingDays !== 1 ? "s" : ""} left
                    </span>
                        </div>

                        <div className="ed-flashcard-bar-wrap">
                          <div className="ed-flashcard-bar">
                            <div
                                className="ed-flashcard-fill"
                                style={{
                                  width: `${Math.min(pct, 100)}%`,
                                  background: pct >= 100 ? "#ef4444" : pct >= 70 ? "#f59e0b" : "#22c55e"
                                }}
                            />
                          </div>
                          <span className="ed-flashcard-pct">{pct}% used</span>
                        </div>

                        <div className="ed-flashcard-stats">
                          <div className="ed-stat">
                            <span className="ed-stat-label">Allocated</span>
                            <span className="ed-stat-value">{b.totalAllocated}</span>
                          </div>
                          <div className="ed-stat-divider" />
                          <div className="ed-stat">
                            <span className="ed-stat-label">Used</span>
                            <span className="ed-stat-value ed-used">{b.usedDays}</span>
                          </div>
                          <div className="ed-stat-divider" />
                          <div className="ed-stat">
                            <span className="ed-stat-label">Remaining</span>
                            <span className={`ed-stat-value ${b.remainingDays <= 0 ? "ed-exhausted" : "ed-remaining"}`}>
                        {b.remainingDays}
                      </span>
                          </div>
                        </div>

                        <div className="ed-flashcard-dots">
                          {leaveBalances.map((_, i) => (
                              <button
                                  key={i}
                                  className={`ed-dot ${i === balanceIndex ? "ed-dot-active" : ""}`}
                                  onClick={() => setBalanceIndex(i)}
                              />
                          ))}
                        </div>
                      </div>

                      <button className="ed-nav-btn" onClick={nextBalance} disabled={leaveBalances.length <= 1}>›</button>
                    </div>
                )}

                {/* ── Quick Actions ── */}
                <h2 className="ed-section-title">Quick Actions</h2>
                <div className="ed-actions-grid">
                  <div className="ed-action-card" onClick={() => navigate("/employee/apply")}>
                    <h3>Apply Leave</h3>
                    <p>Submit a new leave request</p>
                  </div>
                  <div className="ed-action-card" onClick={() => navigate("/employee/history")}>
                    <h3>Leave History</h3>
                    <p>View all your leave requests</p>
                  </div>
                </div>

                {/* ── Recent Leave Requests ── */}
                <h2 className="ed-section-title">Recent Leave Requests</h2>
                <div className="table-wrapper">
                  <table className="ed-table">
                    <thead>
                    <tr>
                      <th>Leave Type</th><th>Start</th><th>End</th><th>Days</th><th>Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {recentRequests.length === 0 ? (
                        <tr><td colSpan="5" className="ed-table-empty">No leave requests yet</td></tr>
                    ) : recentRequests.map(req => (
                        <tr key={req.id}>
                          <td>{req.leaveType}</td>
                          <td>{req.startDate}</td>
                          <td>{req.endDate}</td>
                          <td style={{ textAlign:"center" }}>{req.numberOfDays}</td>
                          <td><span className={`ed-status ${req.status.toLowerCase()}`}>{req.status}</span></td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </>
          )}
        </div>
      </MainLayout>
  );
};

export default EmployeeDashboard;
