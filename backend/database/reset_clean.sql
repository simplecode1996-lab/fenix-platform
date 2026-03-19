-- Reset Database - Keep Only Admin User
-- This script removes all data except admin@fenix.com

-- Delete all payments
DELETE FROM payments_to_users;

-- Delete all accounts
DELETE FROM user_accounts;

-- Delete all users except admin
DELETE FROM users WHERE email != 'admin@fenix.com';

-- Reset admin user balances
UPDATE users 
SET registered_accounts_count = 0,
    pending_collection_amount = 0.00,
    collected_amount = 0.00,
    paid_commissions = 0.00
WHERE email = 'admin@fenix.com';

-- Clear system settings (to allow Initial Generation to run again if needed)
DELETE FROM system_settings;

-- Reset sequences to start from 1
-- Note: This will make the next account start from account_number = 1
SELECT setval('user_accounts_account_number_seq', 1, false);
SELECT setval('payments_to_users_payment_id_seq', 1, false);

-- Verify clean state
SELECT 'Users:' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Accounts:', COUNT(*) FROM user_accounts
UNION ALL
SELECT 'Payments:', COUNT(*) FROM payments_to_users
UNION ALL
SELECT 'System Settings:', COUNT(*) FROM system_settings;

-- Show admin user
SELECT user_code, email, first_name, last_name, profile, 
       registered_accounts_count, pending_collection_amount
FROM users WHERE email = 'admin@fenix.com';
