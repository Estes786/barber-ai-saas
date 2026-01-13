-- Phase 3: Authentication - Users Table for Multi-Role Access
-- This script adds users table and connects it with Supabase Auth

-- Users Table (Auth + Profile)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL DEFAULT 'client' CHECK (role IN ('owner', 'barber', 'client')),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE SET NULL,
  profile_photo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_barbershop_id ON users(barbershop_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Allow service role (backend) to manage all users
CREATE POLICY "Service role can manage users"
  ON users
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Function to automatically create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call handle_new_user() after auth user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample users for testing (passwords: "password123")
-- Note: These need to be created via Supabase Auth API, not direct SQL
-- Use the /auth/register endpoint to create users

-- Update barbershops table to link with owner user
ALTER TABLE barbershops ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_barbershops_owner_id ON barbershops(owner_id);

-- Update barbers table to link with user account
ALTER TABLE barbers ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_barbers_user_id ON barbers(user_id);

-- Update clients table to link with user account
ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);

-- RLS Policy for barbershops (owners can manage their own barbershop)
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their barbershop"
  ON barbershops FOR SELECT
  USING (owner_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Owners can update their barbershop"
  ON barbershops FOR UPDATE
  USING (owner_id = auth.uid());

-- RLS Policy for barbers (barbers can view their own profile)
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Barbers can view profiles in their barbershop"
  ON barbers FOR SELECT
  USING (
    barbershop_id IN (
      SELECT barbershop_id FROM users WHERE id = auth.uid()
    )
    OR auth.jwt() ->> 'role' = 'service_role'
  );

-- RLS Policy for clients (clients can view/update their own profile)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own profile"
  ON clients FOR SELECT
  USING (user_id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Clients can update own profile"
  ON clients FOR UPDATE
  USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Phase 3 Authentication Schema Applied Successfully!';
  RAISE NOTICE '📝 Next Steps:';
  RAISE NOTICE '1. Use /auth/register endpoint to create users';
  RAISE NOTICE '2. Login via /auth/login to get JWT tokens';
  RAISE NOTICE '3. Include "Authorization: Bearer <token>" header for protected routes';
  RAISE NOTICE '4. Roles: owner (manage barbershop), barber (manage bookings), client (book services)';
END $$;
