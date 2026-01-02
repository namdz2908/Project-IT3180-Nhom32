CREATE DATABASE IF NOT EXISTS bluemoon CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bluemoon;
 
INSERT INTO apartments
(apartment_id, floor, area, apartment_type, owner,
 occupants, is_occupied, service_usage, water_usage, electricity_usage, vehicle_count, total)
VALUES
('A101', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A102', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A103', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A104', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0), 
('A105', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A106', 1, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A201', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A202', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A203', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A204', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A205', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0),
('A206', 2, 50.0, 'Standard', 'Admin Owner', 0, 0, 0.0, 0.0, 0.0, 0, 0.0);	
 
INSERT INTO users
(full_name, username, email, password, phone_number, role, citizen_identification, apartment_id, is_active)
VALUES
('Administrator', 'admin', 'admin@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0900000000', 'ADMIN', '123456789012', 'A101', 1),
('User A102', 'user_a102', 'user_a102@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000102', 'USER', '987654321102', 'A102', 1),
('User A103', 'user_a103', 'user_a103@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000103', 'USER', '987654321103', 'A103', 1),
('User A104', 'user_a104', 'user_a104@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000104', 'USER', '987654321104', 'A104', 1),
('User A105', 'user_a105', 'user_a105@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000105', 'USER', '987654321105', 'A105', 1),
('User A106', 'user_a106', 'user_a106@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000106', 'USER', '987654321106', 'A106', 1),
('User A201', 'user_a201', 'user_a201@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000201', 'USER', '987654322201', 'A201', 1),
('User A202', 'user_a202', 'user_a202@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000202', 'USER', '987654322202', 'A202', 1),
('User A203', 'user_a203', 'user_a203@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000203', 'USER', '987654322203', 'A203', 1),
('User A204', 'user_a204', 'user_a204@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000204', 'USER', '987654322204', 'A204', 1),
('User A205', 'user_a205', 'user_a205@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000205', 'USER', '987654322205', 'A205', 1),
('User A206', 'user_a206', 'user_a206@example.com',
 '$2a$10$C2XiRKemh1p/8fypHnlM3u0rk5MStCFCPr8FRk6c.4CQr8gIAvnk2',
 '0910000206', 'USER', '987654322206', 'A206', 1);
