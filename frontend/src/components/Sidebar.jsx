import { Link } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
    const role = localStorage.getItem("role");

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h2>LMS</h2>
            </div>

            <nav className="sidebar-nav">
                {role === "ADMIN" && (
                    <>
                        <Link to="/admin">Dashboard</Link>
                        <Link to="/admin/employees">Employees</Link>
                        <Link to="/admin/leave-types">Leave Types</Link>
                        <Link to="/admin/holidays">Holidays</Link>
                        <Link to="/admin/leave-balances">Leave Balances</Link>
                    </>
                )}

                {role === "MANAGER" && (
                    <>
                        <Link to="/manager">Dashboard</Link>
                        <Link to="/manager/leave-approvals">Leave Approvals</Link>
                        <Link to="/manager/team-history">Team's Leave History</Link>
                    </>
                )}

                {role === "EMPLOYEE" && (
                    <>
                        <Link to="/employee">Dashboard</Link>
                        <Link to="/employee/apply">Apply Leave</Link>
                        <Link to="/employee/history">Leave History</Link>
                    </>
                )}
            </nav>
        </div>
    );
}

export default Sidebar;