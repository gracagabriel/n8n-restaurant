-- ==========================================
-- Initialize Databases for Restaurant System
-- ==========================================

-- Create n8n database if it doesn't exist
CREATE DATABASE n8n_db OWNER restaurant_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO restaurant_user;
GRANT ALL PRIVILEGES ON DATABASE restaurant_db TO restaurant_user;

-- Enable useful extensions
\c restaurant_db
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create audit_log schema for audit tables
CREATE SCHEMA IF NOT EXISTS audit;
GRANT ALL ON SCHEMA audit TO restaurant_user;
