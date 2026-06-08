# 🏢 Leave Management System

A full-stack Leave Management System built with **Spring Boot** and **React (Vite)** that automates employee leave applications, approval workflows, and leave tracking within an organization.

🌐 **Live Demo:** https://lms-frontend-zqmz.onrender.com

---

## 🚀 Features

### 👨‍💼 Employee
- Apply for leave with optional reason
- View leave balances (allocated, used, remaining) per leave type
- View full leave history with manager remarks
- Cancel pending leave requests

### 👨‍💻 Manager
- View and action team leave requests (approve / reject)
- Add remarks on approval or rejection
- View team leave history with employee reasons and manager notes
- Dashboard showing pending requests, team on leave today, and monthly activity

### 🧑‍💼 Admin (HR)
- Create and manage employee accounts (Employee, Manager, Admin roles)
- Configure leave types with yearly limits — changes propagate to all existing balances immediately
- Manage public holidays
- View and adjust leave balances per employee

### 🔐 Authentication & Security
- JWT-based authentication
- Role-based access control (EMPLOYEE, MANAGER, ADMIN)
- Password encryption using BCrypt
- Secure REST APIs with Spring Security

---

## 🏗 Project Structure

```
leave-management-system/
├── frontend/           → React (Vite) client
├── backend/            → Spring Boot REST API
├── docker-compose.yml  → Orchestrates all three services
└── README.md
```

---

## 🛠 Tech Stack

**Backend**
- Java 21
- Spring Boot, Spring Security, Spring Data JPA (Hibernate)
- PostgreSQL
- JWT authentication

**Frontend**
- React 19, Vite
- Axios
- CSS (mobile responsive)

**Infrastructure**
- Docker + Docker Compose
- Nginx (serves frontend + proxies API requests)
- PostgreSQL with persistent volume

---

## 📊 Key Concepts Implemented

- RESTful API design with DTO pattern
- Entity relationships (One-to-Many, Many-to-One)
- Pagination & filtering
- Global exception handling (`@ControllerAdvice`)
- Transaction management
- Role-based authorization
- Containerized deployment with Docker
- Mobile-responsive UI with sidebar navigation
- Code splitting and lazy loading (React)

---

## ⚙️ Running with Docker (Recommended)

**Prerequisites:** Docker Desktop installed and running

```bash
# 1. Clone the repo
git clone https://github.com/mithilshah1408/leave-management-system.git
cd leave-management-system

# 2. Start everything
docker-compose up --build
```

App runs at: **http://localhost**

All three services (frontend, backend, PostgreSQL) start automatically and are wired together. No separate setup needed.

> **First run:** `JPA_DDL_AUTO=create` in `docker-compose.yml` creates the schema and seeds demo data.
> **Subsequent runs:** It defaults to `update` — your data persists across restarts automatically.

---

## ⚙️ Manual Setup (Without Docker)

**Prerequisites:** Java 21+, Maven, Node.js v18+, PostgreSQL

**Backend**
```bash
cd backend
# Update application.properties with your PostgreSQL credentials
mvn clean install
mvn spring-boot:run
# Runs at http://localhost:8080
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
# Runs at http://localhost:5173
```

---

## 🔑 Demo Credentials

The login page includes quick-fill buttons for each role — click the role chip and hit Login.

| Role     | Email                | Password    |
|----------|----------------------|-------------|
| Admin    | admin@test.com       | password123 |
| Manager  | manager@test.com     | password123 |
| Employee | employee1@test.com   | password123 |
| Employee | employee2@test.com   | password123 |

---

## 📄 API Documentation

Swagger UI available at:
```
http://localhost:8080/swagger-ui/index.html
```

---

## 📸 Screenshots

<!-- Screenshots coming soon -->

---

## ⚠️ Important Notes

- On first run, tables are created and demo data is seeded automatically
- JWT token is required for all protected endpoints
- Leave balances update immediately after a request is approved
- Changing max days on a leave type propagates to all existing employee balances instantly
- Admin and Manager accounts do not have leave balances — leave tracking is for employees only

---

## 🧠 What This Project Demonstrates

- Real-world enterprise backend design
- Authentication & authorization flows
- Business logic implementation (leave approval workflow)
- Full-stack integration (Spring Boot + React)
- Containerized deployment with Docker + Nginx
- Mobile-responsive UI design
- Clean, scalable architecture with separation of concerns

---

## 📌 Author

**Mithil Shah**
[GitHub](https://github.com/mithilshah1408) 

---

⭐ If you found this useful, give it a star!
