-- Barbershops (Multi-tenant base)
CREATE TABLE IF NOT EXISTS barbershops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  address TEXT,
  description TEXT,
  logo_url TEXT,
  cover_url TEXT,
  subscription_tier TEXT DEFAULT 'FREE' CHECK(subscription_tier IN ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE')),
  subscription_status TEXT DEFAULT 'ACTIVE' CHECK(subscription_status IN ('ACTIVE', 'SUSPENDED', 'CANCELLED')),
  subscription_end_date DATETIME,
  ai_tryons_used INTEGER DEFAULT 0,
  ai_tryons_limit INTEGER DEFAULT 10,
  custom_domain TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Barbers (Staff members of barbershops)
CREATE TABLE IF NOT EXISTS barbers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  bio TEXT,
  photo_url TEXT,
  specialties TEXT, -- JSON array of specialties
  years_experience INTEGER,
  role TEXT DEFAULT 'BARBER' CHECK(role IN ('OWNER', 'ADMIN', 'BARBER')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE
);

-- Clients (Customers who book services)
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  photo_url TEXT,
  preferred_barber_id INTEGER,
  notes TEXT,
  total_visits INTEGER DEFAULT 0,
  last_visit_date DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (preferred_barber_id) REFERENCES barbers(id) ON DELETE SET NULL
);

-- Services offered by barbershops
CREATE TABLE IF NOT EXISTS services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price REAL NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE
);

-- Bookings/Appointments
CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  barber_id INTEGER NOT NULL,
  client_id INTEGER NOT NULL,
  service_id INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  notes TEXT,
  reminder_sent BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE CASCADE,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
);

-- Portfolio (Before/After photos)
CREATE TABLE IF NOT EXISTS portfolio (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  barber_id INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  before_photo_url TEXT,
  after_photo_url TEXT,
  hairstyle_tags TEXT, -- JSON array
  is_featured BOOLEAN DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL
);

-- AI Try-On History
CREATE TABLE IF NOT EXISTS ai_tryons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER,
  client_id INTEGER,
  session_id TEXT NOT NULL,
  original_photo_url TEXT NOT NULL,
  result_photo_url TEXT NOT NULL,
  hairstyle_name TEXT NOT NULL,
  face_shape TEXT,
  hair_type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- AI Consultations
CREATE TABLE IF NOT EXISTS consultations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER,
  client_id INTEGER,
  session_id TEXT NOT NULL,
  messages TEXT NOT NULL, -- JSON array of chat messages
  recommendations TEXT, -- JSON array of hairstyle recommendations
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Business Hours
CREATE TABLE IF NOT EXISTS business_hours (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL CHECK(day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT 0,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE
);

-- Reviews and Ratings
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  barber_id INTEGER,
  client_id INTEGER NOT NULL,
  booking_id INTEGER,
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (barber_id) REFERENCES barbers(id) ON DELETE SET NULL,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_barbers_barbershop ON barbers(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_clients_barbershop ON clients(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_barbershop ON bookings(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_barber ON bookings(barber_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_services_barbershop ON services(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_barbershop ON portfolio(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_barbershop ON reviews(barbershop_id);
CREATE INDEX IF NOT EXISTS idx_barbershops_slug ON barbershops(slug);
