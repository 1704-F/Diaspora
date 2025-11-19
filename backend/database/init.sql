-- Initialize database with extensions and basic configuration

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- Set timezone
SET timezone = 'UTC';

-- Create database (if needed - already created by Docker)
-- CREATE DATABASE diaspora_dev;
