-- ===========================
-- CRAVE PostgreSQL DATABASE
-- ===========================

DROP TABLE IF EXISTS ai_history CASCADE;
DROP TABLE IF EXISTS progress_logs CASCADE;
DROP TABLE IF EXISTS workout_plans CASCADE;
DROP TABLE IF EXISTS meal_plans CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE user_profiles;

-- ===========================
-- USERS
-- ===========================

CREATE TABLE users (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    username VARCHAR(50) UNIQUE NOT NULL,

    email VARCHAR(255) UNIQUE NOT NULL,

    password_hash TEXT NOT NULL,

    full_name VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_username
ON users(username);

-- ===========================
-- USER PROFILE
-- ===========================

CREATE TABLE user_profiles (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER UNIQUE NOT NULL,

    age INTEGER,

    gender VARCHAR(20),

    height DECIMAL(5,2),

    weight DECIMAL(5,2),

    religion VARCHAR(50),

    country VARCHAR(100),

    city VARCHAR(100),

    lat DECIMAL(9,6),

    lon DECIMAL(9,6),

    temperature DECIMAL(5,2),

    humidity INTEGER,

    climate VARCHAR(30),

    weather_updated_at TIMESTAMP,

    goal VARCHAR(50),

    activity_level VARCHAR(50),

    dietary_preferences JSONB,

    allergies JSONB,

    medical_conditions JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_profiles_city
ON user_profiles(city);

-- ===========================
-- AI MEAL PLANS
-- ===========================

CREATE TABLE meal_plans (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(150),

    ai_response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_meal_user
ON meal_plans(user_id);

-- ===========================
-- AI WORKOUT PLANS
-- ===========================

CREATE TABLE workout_plans (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(150),

    ai_response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_workout_user
ON workout_plans(user_id);

-- ===========================
-- DAILY PROGRESS
-- ===========================

CREATE TABLE progress_logs (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    log_date DATE NOT NULL,

    weight DECIMAL(5,2),

    calories INTEGER,

    water_ml INTEGER,

    steps INTEGER,

    sleep_hours DECIMAL(4,2),

    notes TEXT,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_progress_date
ON progress_logs(log_date);

-- ===========================
-- AI CHAT HISTORY
-- ===========================

CREATE TABLE ai_history (

    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    user_id INTEGER NOT NULL,

    prompt TEXT,

    response TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);