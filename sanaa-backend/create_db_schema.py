# sanaa-backend/create_db_schema.py
import psycopg2
import os
from dotenv import load_dotenv

# --- تحميل متغيرات البيئة ---
load_dotenv() #  تأكد من وجود ملف .env في نفس مستوى هذا السكريبت أو في المسار الصحيح
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("Error: DATABASE_URL not found in environment variables or .env file.")
    exit(1)

# --- أوامر SQL لإنشاء الجداول ---

# 1. جدول المستخدمين (Users) - أساسي
CREATE_USERS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
    avatar_url VARCHAR(500),
    age INT,
    gender VARCHAR(50),
    phone_number VARCHAR(50),
    whatsapp_number VARCHAR(50),
    islam_knowledge_level VARCHAR(100),
    quran_knowledge_level VARCHAR(100),
    is_new_muslim BOOLEAN DEFAULT FALSE,
    aspirations TEXT,
    how_heard VARCHAR(255),
    email_verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE users IS 'Stores user account information.';
"""

# 2. جدول الكورسات (Courses) - يعتمد على المستخدمين (للمدرس)
CREATE_COURSES_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS courses (
    course_id SERIAL PRIMARY KEY,
    title_key VARCHAR(255) NOT NULL UNIQUE,
    description_key TEXT NOT NULL,
    category_key VARCHAR(100) NOT NULL,
    image_url VARCHAR(500),
    instructor_id INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (instructor_id) REFERENCES users(user_id) ON DELETE SET NULL
);
COMMENT ON TABLE courses IS 'Stores course information.';
"""

# 3. جدول خطط الأسعار (Price Plans) - يعتمد على الكورسات
CREATE_PRICE_PLANS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS price_plans (
    plan_id SERIAL PRIMARY KEY,
    name_key VARCHAR(255) NOT NULL UNIQUE,
    description_key TEXT,
    price DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    billing_period VARCHAR(50) CHECK (billing_period IN ('monthly', 'yearly', 'one_time')),
    course_id INT,
    features_keys TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (course_id) REFERENCES courses(course_id) ON DELETE SET NULL
);
COMMENT ON TABLE price_plans IS 'Stores details about different pricing plans.';
CREATE INDEX IF NOT EXISTS idx_price_plans_course_id ON price_plans (course_id);
CREATE INDEX IF NOT EXISTS idx_price_plans_active_featured ON price_plans (is_active, is_featured, display_order);
"""

# 4. جدول أقسام المنصة (Platform Sections) - *** مضاف حديثًا ***
CREATE_PLATFORM_SECTIONS_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS platform_sections (
    section_id SERIAL PRIMARY KEY,
    name_key VARCHAR(255) NOT NULL UNIQUE, -- Key for translation, e.g., 'section_podcasts'
    icon_class VARCHAR(255) NOT NULL,     -- CSS class for the icon, e.g., 'fas fa-podcast'
    path VARCHAR(255) NOT NULL UNIQUE,       -- URL path, e.g., 'podcasts' (used for podcasts.html)
    is_active BOOLEAN DEFAULT TRUE,        -- Whether the section is currently active and shown
    display_order INT DEFAULT 0,           -- For ordering sections in UI
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE platform_sections IS 'Stores definitions for main platform sections like Podcasts, Books, etc.';
CREATE INDEX IF NOT EXISTS idx_platform_sections_active_order ON platform_sections (is_active, display_order);
"""

# (يمكن إضافة باقي تعريفات الجداول هنا إذا لزم الأمر بنفس الطريقة)
# For example, tables for podcasts, books, audio_files, stories, dictionary_entries, testimonials, certificates, links, enrollments, platform_settings, transactions etc.
# Ensure all tables are created before tables that reference them with foreign keys.

def create_all_tables():
    """Connects to the DB and executes SQL to create all defined tables."""
    conn = None
    cursor = None
    
    # أوامر SQL التي سيتم تنفيذها بالترتيب
    # تأكد من ترتيبها بحيث يتم إنشاء الجداول التي تعتمد عليها جداول أخرى أولاً
    sql_commands_to_execute = [
        ("users", CREATE_USERS_TABLE_SQL),
        ("courses", CREATE_COURSES_TABLE_SQL),
        ("price_plans", CREATE_PRICE_PLANS_TABLE_SQL),
        ("platform_sections", CREATE_PLATFORM_SECTIONS_TABLE_SQL), # *** مضاف حديثًا ***
        # ... أضف باقي أوامر إنشاء الجداول هنا بالترتيب الصحيح ...
    ]

    try:
        print("Connecting to the database...")
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        print("Connection successful.")

        for table_name, sql_command in sql_commands_to_execute:
            print(f"Executing CREATE TABLE IF NOT EXISTS statement for {table_name}...")
            cursor.execute(sql_command)
            print(f"Table '{table_name}' checked/created successfully.")

        conn.commit()
        print("All specified tables checked/created and changes committed.")

    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Database Error: {error}")
        if conn:
            conn.rollback()
            print("Transaction rolled back.")
    finally:
        if cursor:
            cursor.close()
            print("Cursor closed.")
        if conn:
            conn.close()
            print("Database connection closed.")

if __name__ == '__main__':
    create_all_tables()
    print("\nDatabase schema script finished.")
    print("Please ensure the database user has permissions to create tables and indexes.")
    print("If you added more table creation SQL commands, verify their order and dependencies.")

