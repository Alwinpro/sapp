-- 1. Create Tables (Schema)

-- Create 'schools' table
CREATE TABLE IF NOT EXISTS schools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    contact TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create 'users' table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT NOT NULL CHECK (role IN ('admin', 'management', 'teacher', 'student')),
    school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
    roll_number TEXT,
    grade TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Create 'students' table (Separate table for student-specific academic info if needed, or redundant with users)
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    roll_number TEXT,
    grade TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create 'grades' table
CREATE TABLE IF NOT EXISTS grades (
    id TEXT PRIMARY KEY, -- Using composite string ID as per application logic
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    student_name TEXT,
    subject TEXT NOT NULL,
    exam_type TEXT NOT NULL,
    marks INTEGER,
    teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    teacher_name TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- 3. Create Security Policies

-- USERS Table Policies
CREATE POLICY "Enable read access for all authenticated users" ON users FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users alone" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Enable update for users based on email" ON users FOR UPDATE USING (auth.uid() = id);

-- SCHOOLS Table Policies
CREATE POLICY "Enable read access for authenticated users" ON schools FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON schools FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- STUDENTS Table Policies
CREATE POLICY "Enable read access for authenticated users" ON students FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON students FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- GRADES Table Policies
CREATE POLICY "Enable read access for authenticated users" ON grades FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Enable insert for authenticated users" ON grades FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON grades FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON grades FOR DELETE USING (auth.role() = 'authenticated');
