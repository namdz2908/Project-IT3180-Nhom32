-- Revenue to Invoice Database Migration
-- ========================================
-- 
-- This script renames the 'revenues' table to 'invoices' to align with
-- the codebase refactoring from Revenue to Invoice terminology.
--
-- IMPORTANT: Run this script BEFORE starting the application after pulling
-- the latest code changes from the repository.
--
-- How to use:
-- 1. Stop the application if it's running
-- 2. Open MySQL Workbench or connect to your MySQL database
-- 3. Execute this script
-- 4. Start the application

-- Rename the table from revenues to invoices
RENAME TABLE revenues TO invoices;

-- Verify the change (optional - run this to confirm)
-- SHOW TABLES LIKE 'invoices';
