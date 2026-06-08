import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

/* Lazy-load all pages for code splitting */
const Login = lazy(() => import("./pages/auth/Login"));

/* Employee */
const EmployeeDashboard = lazy(() => import("./pages/employee/EmployeeDashboard"));
const ApplyLeavePage = lazy(() => import("./pages/employee/ApplyLeavePage"));
const LeaveHistoryPage = lazy(() => import("./pages/employee/LeaveHistoryPage"));

/* Manager */
const ManagerDashboard = lazy(() => import("./pages/manager/ManagerDashboard"));
const LeaveApprovalPage = lazy(() => import("./pages/manager/LeaveApprovalPage"));
const TeamLeaveHistoryPage = lazy(() => import("./pages/manager/TeamLeaveHistoryPage"));

/* Admin */
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const EmployeesPage = lazy(() => import("./pages/admin/EmployeesPage"));
const LeaveTypesPage = lazy(() => import("./pages/admin/LeaveTypesPage"));
const LeaveBalancesPage = lazy(() => import("./pages/admin/LeaveBalancesPage"));
const HolidaysPage = lazy(() => import("./pages/admin/HolidaysPage"));

function App() {
    return (
        <Suspense fallback={<div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", fontFamily:"Arial", color:"#64748b" }}>Loading...</div>}>
            <Routes>
                {/* Public */}
                <Route path="/" element={<Login />} />

                {/* EMPLOYEE */}
                <Route element={<ProtectedRoute allowedRole="EMPLOYEE" />}>
                    <Route path="/employee" element={<EmployeeDashboard />} />
                    <Route path="/employee/apply" element={<ApplyLeavePage />} />
                    <Route path="/employee/history" element={<LeaveHistoryPage />} />
                </Route>

                {/* MANAGER */}
                <Route element={<ProtectedRoute allowedRole="MANAGER" />}>
                    <Route path="/manager" element={<ManagerDashboard />} />
                    <Route path="/manager/leave-approvals" element={<LeaveApprovalPage />} />
                    <Route path="/manager/team-history" element={<TeamLeaveHistoryPage />} />
                </Route>

                {/* ADMIN */}
                <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/admin/employees" element={<EmployeesPage />} />
                    <Route path="/admin/leave-types" element={<LeaveTypesPage />} />
                    <Route path="/admin/leave-balances" element={<LeaveBalancesPage />} />
                    <Route path="/admin/holidays" element={<HolidaysPage />} />
                </Route>
            </Routes>
        </Suspense>
    );
}

export default App;
