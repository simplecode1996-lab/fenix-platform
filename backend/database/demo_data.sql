-- Demo Data for Client Presentation
-- This creates clean demo users and accounts for showcasing the platform

-- Note: Password for all demo users is 'demo123'
-- Hash: $2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO

-- Insert demo users
INSERT INTO users (email, password_hash, first_name, last_name, profile, wallet, phone, dni, registered_accounts_count, allowed_accounts_count, pending_collection_amount)
VALUES 
  ('demo1@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'María', 'García', 'user', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', '+34 612 345 678', '12345678A', 5, 10, 0),
  ('demo2@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'Juan', 'Martínez', 'user', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', '+34 623 456 789', '87654321B', 3, 10, 0),
  ('demo3@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'Ana', 'López', 'user', '0x1234567890abcdef1234567890abcdef12345678', '+34 634 567 890', '11223344C', 2, 10, 500);

-- Get user codes (assuming admin is user_code 1)
-- demo1 will be user_code 2
-- demo2 will be user_code 3
-- demo3 will be user_code 4

-- Insert accounts for demo1 (María García - 5 accounts)
INSERT INTO user_accounts (user_code, user_wallet, paid_amount, investment_amount, level_1_date)
VALUES 
  (2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP - INTERVAL '10 days'),
  (2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP - INTERVAL '8 days'),
  (2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP - INTERVAL '3 days'),
  (2, '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb', 45, 25, CURRENT_TIMESTAMP - INTERVAL '1 day');

-- Insert accounts for demo2 (Juan Martínez - 3 accounts)
INSERT INTO user_accounts (user_code, user_wallet, paid_amount, investment_amount, level_1_date)
VALUES 
  (3, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 45, 25, CURRENT_TIMESTAMP - INTERVAL '7 days'),
  (3, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 45, 25, CURRENT_TIMESTAMP - INTERVAL '4 days'),
  (3, '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', 45, 25, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Insert accounts for demo3 (Ana López - 2 accounts with progression)
INSERT INTO user_accounts (user_code, user_wallet, paid_amount, investment_amount, level_1_date, level_2_date)
VALUES 
  (4, '0x1234567890abcdef1234567890abcdef12345678', 45, 25, CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP - INTERVAL '5 days'),
  (4, '0x1234567890abcdef1234567890abcdef12345678', 45, 25, CURRENT_TIMESTAMP - INTERVAL '12 days', NULL);

-- Simulate level progression for some accounts
-- When 3 accounts exist, account 1 reaches level 2
-- When 9 accounts exist, account 1 reaches level 3

-- Update account 1 to level 2 (assuming it's the first account created)
UPDATE user_accounts 
SET level_2_date = CURRENT_TIMESTAMP - INTERVAL '3 days'
WHERE account_number = (SELECT MIN(account_number) FROM user_accounts WHERE user_code = 2);

-- Add a sample payment request for demo3
INSERT INTO payments_to_users (user_code, requested_amount, net_amount, commission_amount, request_date)
VALUES 
  (4, 500, 490, 10, CURRENT_TIMESTAMP - INTERVAL '2 days');

-- Summary of demo data:
-- Admin: admin@fenix.com / admin123
-- Demo1 (María): demo1@fenix.com / demo123 - 5 accounts, 1 at level 2
-- Demo2 (Juan): demo2@fenix.com / demo123 - 3 accounts
-- Demo3 (Ana): demo3@fenix.com / demo123 - 2 accounts, 1 at level 2, 500 USDC pending payment

COMMENT ON TABLE users IS 'Demo users created for client presentation';
