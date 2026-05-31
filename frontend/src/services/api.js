import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

/* ===============================
   REQUEST INTERCEPTOR (JWT)
================================ */

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ===============================
   RESPONSE INTERCEPTOR
================================ */

api.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

/* AUTH  */

export const login = (data) =>
  api.post("/auth/login", data);


/* LEAVE TYPES */

export const getLeaveTypes = () =>
  api.get("/leave-types");


/* LEAVE REQUESTS (EMPLOYEE) */

export const applyLeave = (data) =>
  api.post("/leave-requests", data);

export const getMyLeaves = () =>
  api.get("/leave-requests/my");

export const cancelLeave = (id) =>
  api.delete(`/leave-requests/${id}`);


/* LEAVE APPROVALS (MANAGER) */

export const getPendingLeaveRequests = () =>
  api.get("/leave-approvals/pending");

export const approveLeave = (id) =>
  api.patch(`/leave-approvals/${id}/approve`);

export const rejectLeave = (id, remarks) =>
  api.patch(`/leave-approvals/${id}/reject`, { remarks });

export const getTeamLeaves = () =>
  api.get("/leave-requests/team-history");


/* HOLIDAYS (ADMIN) */

export const getHolidays = (year) =>
  api.get(`/admin/holidays?year=${year}`);

export const createHoliday = (data) =>
  api.post("/admin/holidays", data);

export const updateHoliday = (id, data) =>
  api.put(`/admin/holidays/${id}`, data);

export const deleteHoliday = (id) =>
  api.delete(`/admin/holidays/${id}`);


/* LEAVE BALANCES (ADMIN) */

export const getLeaveBalances = (userId, year, page, size) =>
  api.get("/admin/leave-balances", {
    params: { userId, year, page, size },
  });

export const initializeYear = (year) =>
  api.post("/admin/leave-balances/initialize", null, {
    params: { year },
  });

export const adjustLeaveBalance = (id, newTotalAllocated) =>
  api.put(`/admin/leave-balances/${id}/adjust`, {
    newTotalAllocated,
  });


export default api;