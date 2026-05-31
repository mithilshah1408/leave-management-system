# 🏢 Leave Management System

A full-stack Leave Management System built using **Spring Boot** and **React (Vite)** that automates employee leave application, approval workflows, and leave tracking within an organization.

---

## 🚀 Features

### 👨‍💼 Employee
- Apply for leave
- View leave balance
- View leave history
- Cancel leave requests (before approval)

### 👨‍💻 Manager
- View team leave requests
- Approve or reject leave requests
- Add remarks for approval/rejection

### 🧑‍💼 Admin (HR)
- Manage employees
- Configure leave types (Casual, Sick, etc.)
- Manage holidays
- View organization-wide reports

---

## 🔐 Authentication & Security

- JWT-based authentication
- Role-based access control (EMPLOYEE, MANAGER, ADMIN)
- Password encryption using BCrypt
- Secure REST APIs

---

## 🏗 Project Structure

```
leave-management-system/
├── frontend/          → React (Vite) client
├── backend/           → Spring Boot REST API
├── docker-compose.yml → Orchestrates all three services
└── README.md
```

---

## 🛠 Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA (Hibernate)
- MySQL 8

### Frontend
- React 19
- Vite
- Axios
- CSS

### Infrastructure
- Docker + Docker Compose
- Nginx (serves frontend + proxies API requests)
- MySQL (persistent volume)

---

## 📊 Key Concepts Implemented

- RESTful API design
- DTO pattern (no direct entity exposure)
- Entity relationships (One-to-Many, Many-to-One)
- Pagination & filtering
- Global exception handling (`@ControllerAdvice`)
- Transaction management
- Role-based authorization
- Containerized deployment with Docker

---

## ⚙️ Running with Docker (Recommended)

### Prerequisites
- Docker Desktop installed and running

### Steps

```bash
# 1. Clone the repo
git clone https://github.com/your-username/leave-management-system.git
cd leave-management-system

# 2. Set up environment variables
cp .env.example .env
# Open .env and update passwords if needed

# 3. Start everything
docker-compose up --build
```

App runs at: **http://localhost**

All three services (frontend, backend, MySQL) start automatically and are wired together. No separate setup needed.

> **First run:** `JPA_DDL_AUTO=create` in `.env` creates the schema and seeds demo data.
> **Subsequent runs:** Change to `JPA_DDL_AUTO=update` to preserve your data across restarts.

---

## ⚙️ Manual Setup (Without Docker)

### Prerequisites
- Java 21+
- Maven
- Node.js v16+
- MySQL

### Backend

```bash
cd backend
# Update spring.datasource.password in application.properties
mvn clean install
mvn spring-boot:run
```

Runs at: `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at: `http://localhost:5173`

---

## 🔑 Demo Credentials

The login page includes quick-fill buttons for each role — just click the role and hit Login.

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@test.com         | password123 |
| Manager  | manager@test.com       | password123 |
| Employee | employee1@test.com     | password123 |
| Employee | employee2@test.com     | password123 |

> Users are seeded automatically on first startup via `data.sql`.

---

## 📄 API Documentation

Swagger UI available at:
```
http://localhost:8080/swagger-ui/index.html
```

---

## 📸 Screenshots

### 🔐 Login
![Login](./screenshots/LoginPage.png)

### 📊 Employee Dashboard
![Employee Dashboard](./screenshots/EmployeeDashboard.png)

### 📝 Apply for Leave
![Apply Leave](./screenshots/EmployeeLeaveApplication.png)

### 📜 Leave History
![Leave History](./screenshots/EmployeeLeaveHistory.png)

### 📋 Manager Dashboard
![Manager Dashboard](./screenshots/ManagerDashboard.png)

### ✅ Leave Approval
![Leave Approval](./screenshots/ManagerLeaveApproval.png)

### 👥 Team Leave History
![Team History](./screenshots/ManagerTeamLeaveHistory.png)

### 🛠 Admin Dashboard
![Admin Dashboard](./screenshots/AdminDashboard.png)

### 👨‍👩‍👧 Employee Management
![Employee Management](./screenshots/AdminsEmployeeManagement.png)

### 🏖 Leave Type Management
![Leave Types](./screenshots/AdminLeaveTypeManagement.png)

### 📊 Leave Balance Management
![Leave Balances](./screenshots/AdminLeaveBalanceManagement.png)

### 🎉 Holiday Management
![Holidays](./screenshots/AdminHolidayManagement.png)

---

## 🎥 Demo Video

[![Watch Demo](https://img.youtube.com/vi/lZSX2dPrckc/0.jpg)](https://youtu.be/lZSX2dPrckc)

> Covers Admin, Manager, and Employee flows end-to-end.

---

## ⚠️ Important Notes

- On first run, tables are created and demo data is seeded automatically
- Change `JPA_DDL_AUTO` to `update` after first run to persist data
- JWT token is required for all protected endpoints
- Leave balance updates only after a request is approved
- Holidays are excluded from leave day calculations

---

## 💡 Future Improvements

- Email notifications for approvals/rejections
- File attachments for medical/supporting documents
- Dashboard analytics and charts
- Mobile-responsive UI improvements
- Role-based UI enhancements

---

## 🧠 What This Project Demonstrates

- Real-world enterprise backend design
- Authentication & authorization flows
- Business logic implementation (leave workflow)
- Full-stack integration
- Containerized deployment with Docker
- Clean and scalable architecture

---

## 📌 Author

**Mithil Shah**

---

⭐ If you found this useful, give it a star!
