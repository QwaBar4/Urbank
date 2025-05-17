CREATE DATABASE bank_db WITH ENCODING 'UTF8';

\c bank_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT true,
    first_name TEXT,
    last_name TEXT,
    middle_name TEXT,
    passport_series TEXT,
    passport_number TEXT,
    date_of_birth DATE
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    account_number VARCHAR(255) UNIQUE NOT NULL,
    balance NUMERIC(19,2) DEFAULT 0.00,
    daily_transfer_limit NUMERIC(19,2) DEFAULT 10000.00,
    daily_withdrawal_limit NUMERIC(19,2) DEFAULT 2000.00,
    daily_transfer_total NUMERIC(19,2) DEFAULT 0.00,
    daily_withdrawal_total NUMERIC(19,2) DEFAULT 0.00,
    last_interest_calculation TIMESTAMP,
    user_id INT UNIQUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    amount NUMERIC(19,2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    encrypted_description TEXT,
    source_account_number VARCHAR(255),
    target_account_number VARCHAR(255)
);

CREATE TABLE audit_log (
    id SERIAL PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    details TEXT
);

CREATE TABLE anonymization_mappings (
    id SERIAL PRIMARY KEY,
    original_hash TEXT UNIQUE NOT NULL,
    anonymized_value TEXT UNIQUE NOT NULL,
    encrypted_original TEXT NOT NULL
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    principal NUMERIC(19,2) NOT NULL,
    interest_rate NUMERIC(5,2) NOT NULL,
    start_date DATE NOT NULL,
    term_months INT NOT NULL,
    account_id INT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES accounts(id)
);

CREATE TABLE payment_schedule (
    id SERIAL PRIMARY KEY,
    due_date DATE NOT NULL,
    payment_amount NUMERIC(19,2) NOT NULL,
    principal_amount NUMERIC(19,2) NOT NULL,
    interest_amount NUMERIC(19,2) NOT NULL,
    is_paid BOOLEAN DEFAULT false,
    loan_id INT NOT NULL,
    FOREIGN KEY (loan_id) REFERENCES loans(id)
);

CREATE INDEX idx_users_username ON users(LOWER(username));
CREATE INDEX idx_users_email ON users(LOWER(email));
CREATE INDEX idx_accounts_number ON accounts(account_number);
CREATE INDEX idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX idx_audit_log_timestamp ON audit_log(timestamp);
