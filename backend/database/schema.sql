-- Fenix Platform Database Schema
-- PostgreSQL

-- Drop tables if they exist (for clean reinstall)
DROP TABLE IF EXISTS payments_to_users CASCADE;
DROP TABLE IF EXISTS user_accounts CASCADE;
DROP TABLE IF EXISTS fenix_wallets CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users Table
CREATE TABLE users (
    user_code SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    profile VARCHAR(20) NOT NULL CHECK (profile IN ('admin', 'user')),
    wallet VARCHAR(255),
    phone VARCHAR(50),
    dni VARCHAR(50),
    registered_accounts_count INTEGER DEFAULT 0,
    allowed_accounts_count INTEGER DEFAULT 10,
    pending_collection_amount DECIMAL(18, 2) DEFAULT 0.00,
    collected_amount DECIMAL(18, 2) DEFAULT 0.00,
    paid_commissions DECIMAL(18, 2) DEFAULT 0.00,
    currency VARCHAR(10) DEFAULT 'USDC' CHECK (currency IN ('USDT', 'USDC')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Accounts Table
CREATE TABLE user_accounts (
    account_number SERIAL PRIMARY KEY,
    user_code INTEGER NOT NULL REFERENCES users(user_code) ON DELETE CASCADE,
    user_wallet VARCHAR(255),
    paid_amount DECIMAL(18, 2) DEFAULT 0.00,
    investment_amount DECIMAL(18, 2) DEFAULT 0.00,
    level_1_date TIMESTAMP,
    level_2_date TIMESTAMP,
    level_3_date TIMESTAMP,
    level_3_processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments to Users Table
CREATE TABLE payments_to_users (
    payment_id SERIAL PRIMARY KEY,
    user_code INTEGER NOT NULL REFERENCES users(user_code) ON DELETE CASCADE,
    request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_amount DECIMAL(18, 2) NOT NULL,
    net_amount DECIMAL(18, 2) NOT NULL,
    commission_amount DECIMAL(18, 2) NOT NULL,
    payment_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fenix Wallets Table
CREATE TABLE fenix_wallets (
    wallet_id SERIAL PRIMARY KEY,
    currency VARCHAR(10) NOT NULL CHECK (currency IN ('USDT', 'USDC')),
    wallet_address VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_accounts_user_code ON user_accounts(user_code);
CREATE INDEX idx_user_accounts_level_3 ON user_accounts(level_3_date, level_3_processed) WHERE level_3_date IS NOT NULL;
CREATE INDEX idx_payments_user_code ON payments_to_users(user_code);
CREATE INDEX idx_payments_payment_date ON payments_to_users(payment_date);

-- Insert default admin user (password: admin123 - CHANGE IN PRODUCTION)
-- Password hash for 'admin123'
INSERT INTO users (email, password_hash, first_name, last_name, profile, allowed_accounts_count)
VALUES ('admin@fenix.com', '$2a$10$iYyLx7LASnv4bWWWyi.T4eXPLxPW8AthCbGMvyJ8WXstVrzKkQ/xO', 'Admin', 'User', 'admin', 10);

-- Insert sample Fenix wallets
INSERT INTO fenix_wallets (currency, wallet_address) VALUES
('USDC', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'),
('USDT', '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063');

COMMENT ON TABLE users IS 'Stores all platform users with their profile and balance information';
COMMENT ON TABLE user_accounts IS 'Stores individual accounts owned by users with level progression';
COMMENT ON TABLE payments_to_users IS 'Tracks payment requests and completions';
COMMENT ON TABLE fenix_wallets IS 'Platform wallet addresses for receiving payments';
