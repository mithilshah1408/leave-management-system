import MainLayout from "../../layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./ManagerDashboard.css";

function ManagerDashboard() {

  const navigate = useNavigate();

  const [pendingRequests, setPendingRequests] = useState([]);
  const [teamOnLeaveToday, setTeamOnLeaveToday] = useState(0);
  const [monthlyRequests, setMonthlyRequests] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {

    try {

      const response = await fetch(
        "/api/leave-approvals/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leave requests");
      }

      const data = await response.json();
      const requests = Array.isArray(data) ? data : [];

      setPendingRequests(requests);

      const today = new Date().toISOString().split("T")[0];

      const todayLeaves = requests.filter(
        (leave) =>
          leave.startDate <= today &&
          leave.endDate >= today &&
          leave.status === "APPROVED"
      );

      setTeamOnLeaveToday(todayLeaves.length);

      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();

      const monthly = requests.filter((leave) => {
        const d = new Date(leave.startDate);
        return d.getMonth() === month && d.getFullYear() === year;
      });

      setMonthlyRequests(monthly.length);

    } catch (error) {

      console.error("Error loading dashboard:", error);
      setPendingRequests([]);

    } finally {

      setLoading(false);

    }
  };

  return (
    <MainLayout>

      <div className="manager-dashboard">
        
        <h2>Manager Dashboard</h2>
        <p>Review and manage your team's leave requests.</p>

        {/* Dashboard Stats */}

        <div className="stats-grid">

          <div className="stat-card">
            <h3>Pending Requests</h3>
            <p>{pendingRequests.length}</p>
          </div>

          <div className="stat-card">
            <h3>Team On Leave Today</h3>
            <p>{teamOnLeaveToday}</p>
          </div>

          <div className="stat-card">
            <h3>This Month Requests</h3>
            <p>{monthlyRequests}</p>
          </div>

        </div>

        {/* Quick Actions */}

        <h3 className="section-title">Quick Actions</h3>

        <div className="actions-grid">

          <div
            className="action-card"
            onClick={() => navigate("/manager/leave-approvals")}
          >
            <h4>Review Leave Requests</h4>
            <p>Approve or reject pending leave requests</p>
          </div>

          <div
            className="action-card"
            onClick={() => navigate("/manager/team-history")}
          >
            <h4>Team Leave History</h4>
            <p>View all team leave activity</p>
          </div>

        </div>

        {/* Recent Requests */}

        <h3 className="section-title">Recent Leave Requests</h3>

        {loading ? (
          <p>Loading requests...</p>
        ) : (
          <table className="requests-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {pendingRequests.length === 0 ? (

                <tr>
                  <td colSpan="5">No pending requests</td>
                </tr>

              ) : (

                pendingRequests.slice(0, 5).map((leave) => (

                  <tr key={leave.id}>

                    <td>{leave.employeeName}</td>

                    <td>{leave.leaveTypeName || leave.leaveType}</td>

                    <td>
                      {leave.startDate} - {leave.endDate}
                    </td>

                    <td>
                      <span className={`status ${leave.status.toLowerCase()}`}>
                        {leave.status}
                      </span>
                    </td>

                    <td>

                      <button
                        className="review-btn"
                        onClick={() =>
                          navigate("/manager/leave-approvals")
                        }
                      >
                        Review
                      </button>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>
        )}

      </div>

    </MainLayout>
  );
}

export default ManagerDashboard;