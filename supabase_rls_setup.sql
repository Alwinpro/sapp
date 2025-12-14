-- Copy and paste this SQL into your Supabase Dashboard > SQL Editor
-- Click "Run" to apply these security policies and fix the "Profile not found" error.

-- 1. Enable Row Level Security (RLS) on the tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies for 'users' table

-- Allow users to read their own profile (Fixes the Login Error)
-- Also allows reading other profiles so Teachers can see Students, etc.
CREATE POLICY "Enable read access for all authenticated users"
ON users FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow users to insert their own profile (Fixes Signup)
CREATE POLICY "Enable insert for authenticated users alone"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on email"
ON users FOR UPDATE
USING (auth.uid() = id);

-- 3. Create Policies for 'schools' table

-- Allow everyone to read school info (or restrict to authenticated)
CREATE POLICY "Enable read access for authenticated users"
ON schools FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow creation of schools (usually done during setup)
CREATE POLICY "Enable insert for authenticated users"
ON schools FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 4. Create Policies for 'students' table

-- Teachers and Admins need to see students.
-- For simplicity, allow authenticated users to view students.
CREATE POLICY "Enable read access for authenticated users"
ON students FOR SELECT
USING (auth.role() = 'authenticated');

-- Allow insertion (usually by Teachers/Admins)
CREATE POLICY "Enable insert for authenticated users"
ON students FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 5. Create Policies for 'grades' table

-- Students can see their own grades, Teachers can see all (simplified to all authenticated reading for now)
CREATE POLICY "Enable read access for authenticated users"
ON grades FOR SELECT
USING (auth.role() = 'authenticated');

-- Teachers insert grades
CREATE POLICY "Enable insert for authenticated users"
ON grades FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Teachers update grades
CREATE POLICY "Enable update for authenticated users"
ON grades FOR UPDATE
USING (auth.role() = 'authenticated');

-- Teachers delete grades
CREATE POLICY "Enable delete for authenticated users"
ON grades FOR DELETE
USING (auth.role() = 'authenticated');
