-- FIX SCRIPT: Run this to repair your broken account and prevent future errors.

-- 1. BACKFILL: Restore missing profiles for existing users
-- This takes anyone who is in "Auth" but missing from "Users" and adds them back.
INSERT INTO public.users (id, email, name, role, status, created_at)
SELECT 
    id, 
    email, 
    COALESCE(raw_user_meta_data->>'name', 'Unknown'),
    COALESCE(raw_user_meta_data->>'role', 'student'), -- Default role if missing
    'active',
    created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users);

-- 2. AUTOMATION: Create a Trigger to auto-create profiles in the future
-- This ensures that every time someone signs up, a user profile is created automatically.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, status, created_at)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', 'New User'),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    'active',
    new.created_at
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors on retry
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
