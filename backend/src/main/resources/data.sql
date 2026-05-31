-- =========================
-- ROLES
-- =========================
INSERT INTO roles (id, name) VALUES
                                 (1, 'ADMIN'),
                                 (2, 'MANAGER'),
                                 (3, 'EMPLOYEE');


-- =========================
-- LEAVE TYPES
-- =========================
INSERT INTO leave_types (id, carry_forward_allowed, description, max_days_per_year, name, status) VALUES
                                                                                                      (1, false, 'Paid leave with salary', 15, 'Paid Leave', 'ACTIVE'),
                                                                                                      (2, false, 'Leave when sick', 5, 'Sick Leave', 'ACTIVE'),
                                                                                                      (3, false, 'Personal use leave', 10, 'Casual Leave', 'ACTIVE'),
                                                                                                      (4, false, 'Maternity leave', 90, 'Maternity Leave', 'ACTIVE'),
                                                                                                      (5, true, 'Emergency situations', 5, 'Emergency Leave', 'ACTIVE'),
                                                                                                      (6, false, 'Paternity leave', 10, 'Paternity Leave', 'ACTIVE'),
                                                                                                      (7, false, 'Bereavement leave', 5, 'Bereavement Leave', 'ACTIVE'),
                                                                                                      (8, true, 'Compensatory leave for extra work', 10, 'Compensatory Leave', 'ACTIVE'),
                                                                                                      (9, false, 'Study/education leave', 15, 'Study Leave', 'ACTIVE'),
                                                                                                      (10, false, 'Long-term sabbatical', 60, 'Sabbatical Leave', 'ACTIVE'),
                                                                                                      (11, false, 'Volunteer work leave', 3, 'Volunteer Leave', 'ACTIVE'),
                                                                                                      (12, false, 'Mental health leave', 5, 'Mental Health Leave', 'ACTIVE');

-- =========================
-- HOLIDAYS
-- =========================
INSERT INTO holidays (id, name, start_date, end_date) VALUES
                                                          (1, 'New Year''s Day', '2026-01-01', '2026-01-01'),
                                                          (2, 'Independence Day', '2026-07-03', '2026-07-03'),
                                                          (3, 'Labor Day', '2026-09-07', '2026-09-07'),
                                                          (4, 'Thanksgiving Day', '2026-11-26', '2026-11-26'),
                                                          (5, 'Christmas Day', '2026-12-25', '2026-12-25');


-- =========================
-- USERS
-- Password: password123
-- BCrypt: $2a$10$vKNlLX22ZYyzJyP/8Z0sF.ekBeilehA8YF9X9bzRpdk9wDcNqbLxC
-- =========================

-- Admin
INSERT INTO users (
    id, create_date, email, first_name, joining_date, last_name,
    password, status, update_date_and_time, username, manager_id, role_id
) VALUES (
             1, NOW(), 'admin@test.com', 'Admin', '2024-01-01', 'User',
             '$2a$10$vKNlLX22ZYyzJyP/8Z0sF.ekBeilehA8YF9X9bzRpdk9wDcNqbLxC',
             'ACTIVE', NOW(), 'admin', NULL, 1
         );

-- Manager
INSERT INTO users (
    id, create_date, email, first_name, joining_date, last_name,
    password, status, update_date_and_time, username, manager_id, role_id
) VALUES (
             2, NOW(), 'manager@test.com', 'Manager', '2024-01-01', 'User',
             '$2a$10$vKNlLX22ZYyzJyP/8Z0sF.ekBeilehA8YF9X9bzRpdk9wDcNqbLxC',
             'ACTIVE', NOW(), 'manager', NULL, 2
         );

-- Employee 1 (reports to manager)
INSERT INTO users (
    id, create_date, email, first_name, joining_date, last_name,
    password, status, update_date_and_time, username, manager_id, role_id
) VALUES (
             3, NOW(), 'employee1@test.com', 'Employee', '2024-01-01', 'One',
             '$2a$10$vKNlLX22ZYyzJyP/8Z0sF.ekBeilehA8YF9X9bzRpdk9wDcNqbLxC',
             'ACTIVE', NOW(), 'employee1', 2, 3
         );

-- Employee 2 (reports to manager)
INSERT INTO users (
    id, create_date, email, first_name, joining_date, last_name,
    password, status, update_date_and_time, username, manager_id, role_id
) VALUES (
             4, NOW(), 'employee2@test.com', 'Employee', '2024-01-01', 'Two',
             '$2a$10$vKNlLX22ZYyzJyP/8Z0sF.ekBeilehA8YF9X9bzRpdk9wDcNqbLxC',
             'ACTIVE', NOW(), 'employee2', 2, 3
         );