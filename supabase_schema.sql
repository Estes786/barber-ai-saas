-- Supabase Database Schema for Barber AI SaaS
-- PostgreSQL version (migrated from D1 SQLite)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Barbershops Table (Multi-tenant base)
CREATE TABLE IF NOT EXISTS barbershops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  address TEXT,
  description TEXT,
  logo_url TEXT,
  cover_image_url TEXT,
  subscription_tier VARCHAR(20) DEFAULT 'FREE' CHECK (subscription_tier IN ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  subscription_status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (subscription_status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  ai_tryons_used INTEGER DEFAULT 0,
  ai_tryons_limit INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Barbers Table
CREATE TABLE IF NOT EXISTS barbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  bio TEXT,
  profile_photo_url TEXT,
  specialties TEXT[],
  is_active BOOLEAN DEFAULT true,
  role VARCHAR(20) DEFAULT 'BARBER' CHECK (role IN ('OWNER', 'MANAGER', 'BARBER')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  profile_photo_url TEXT,
  preferred_barber_id UUID REFERENCES barbers(id),
  face_shape VARCHAR(50),
  hair_type VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(barbershop_id, email)
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Hours Table
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_open BOOLEAN DEFAULT true,
  UNIQUE(barbershop_id, day_of_week)
);

-- Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  before_photo_url TEXT,
  after_photo_url TEXT NOT NULL,
  hairstyle_name VARCHAR(255),
  description TEXT,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Try-Ons Table
CREATE TABLE IF NOT EXISTS ai_tryons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  hairstyle_id VARCHAR(100),
  original_image_url TEXT,
  result_image_url TEXT NOT NULL,
  confidence DECIMAL(3, 2),
  face_shape VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hairstyles Library Table
CREATE TABLE IF NOT EXISTS hairstyles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  category VARCHAR(50),
  recommended_face_shape VARCHAR(50),
  difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('EASY', 'MEDIUM', 'HARD')),
  thumbnail_url TEXT,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Consultations Table
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  session_id UUID NOT NULL,
  client_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  barbershop_id UUID REFERENCES barbershops(id) ON DELETE CASCADE,
  barber_id UUID REFERENCES barbers(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes
CREATE INDEX idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_services_barbershop ON services(barbershop_id);
CREATE INDEX idx_bookings_barbershop ON bookings(barbershop_id);
CREATE INDEX idx_bookings_barber ON bookings(barber_id);
CREATE INDEX idx_bookings_client ON bookings(client_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_portfolio_barbershop ON portfolio(barbershop_id);
CREATE INDEX idx_reviews_barbershop ON reviews(barbershop_id);
CREATE INDEX idx_barbershops_slug ON barbershops(slug);
CREATE INDEX idx_ai_tryons_barbershop ON ai_tryons(barbershop_id);
CREATE INDEX idx_consultations_session ON consultations(session_id);
CREATE INDEX idx_hairstyles_slug ON hairstyles(slug);

-- Create function to increment AI try-ons usage
CREATE OR REPLACE FUNCTION increment_ai_tryons(shop_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE barbershops 
  SET ai_tryons_used = ai_tryons_used + 1 
  WHERE id = shop_id;
END;
$$ LANGUAGE plpgsql;

-- Insert sample hairstyles
INSERT INTO hairstyles (name, slug, description, category, recommended_face_shape, difficulty_level, popularity) VALUES
('Classic Fade', 'fade', 'Clean fade haircut with smooth gradient', 'Classic', 'oval', 'MEDIUM', 100),
('Modern Undercut', 'undercut', 'Short sides with longer top, versatile styling', 'Modern', 'square', 'MEDIUM', 95),
('Pompadour', 'pompadour', 'Voluminous top swept back, classic elegance', 'Classic', 'oval', 'HARD', 85),
('Buzz Cut', 'buzz', 'Very short all-around, low maintenance', 'Classic', 'round', 'EASY', 90),
('Crew Cut', 'crew', 'Short and neat, military-style precision', 'Classic', 'square', 'EASY', 88),
('Quiff', 'quiff', 'Textured top styled forward, modern look', 'Modern', 'heart', 'MEDIUM', 82)
ON CONFLICT (slug) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE barbershops ENABLE ROW LEVEL SECURITY;
ALTER TABLE barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tryons ENABLE ROW LEVEL SECURITY;
ALTER TABLE hairstyles ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access to hairstyles
CREATE POLICY "Hairstyles are viewable by everyone" ON hairstyles FOR SELECT USING (true);

-- Note: Additional RLS policies should be configured based on your authentication setup
-- For now, we'll allow service role to bypass RLS for API operations
