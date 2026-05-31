import MainLayout from "../../layout/MainLayout";
import { useEffect, useState } from "react";
import "./TeamLeaveHistoryPage.css";

function TeamLeaveHistoryPage() {

  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  const fetchLeaveHistory = async () => {

    try {

      const response = await fetch(
        "/api/leave-requests/team-history",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch leave history");
      }

      const data = await response.json();

      setLeaveHistory(Array.isArray(data) ? data : []);

    } catch (error) {

      console.error("Error fetching leave history:", error);
      setLeaveHistory([]);

    } finally {

      setLoading(false);

    }

  };

  return (
    <MainLayout>

      <div className="team-history-page">

        <h2>Team Leave History</h2>
        <p>View leave activity of employees reporting to you.</p>

        {loading ? (
          <p>Loading leave history...</p>
        ) : (
          <table className="history-table">

            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>

              {leaveHistory.length === 0 ? (

                <tr>
                  <td colSpan="5">No leave history found</td>
                </tr>

              ) : (

                leaveHistory.map((leave) => (

                  <tr key={leave.id}>

                    <td>{leave.employeeName}</td>

                    <td>{leave.leaveType}</td>

                    <td>{leave.startDate}</td>

                    <td>{leave.endDate}</td>

                    <td>{leave.status}</td>

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

export default TeamLeaveHistoryPage;