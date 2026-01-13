// Cloudflare Bindings Type Definitions
export interface CloudflareBindings {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
}

// Database Models
export interface Barbershop {
  id: number;
  slug: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  logo_url?: string;
  cover_url?: string;
  subscription_tier: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscription_status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  subscription_end_date?: string;
  ai_tryons_used: number;
  ai_tryons_limit: number;
  custom_domain?: string;
  created_at: string;
  updated_at: string;
}

export interface Barber {
  id: number;
  barbershop_id: number;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  photo_url?: string;
  specialties?: string; // JSON
  years_experience?: number;
  role: 'OWNER' | 'ADMIN' | 'BARBER';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: number;
  barbershop_id: number;
  name: string;
  email?: string;
  phone: string;
  photo_url?: string;
  preferred_barber_id?: number;
  notes?: string;
  total_visits: number;
  last_visit_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  barbershop_id: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  barbershop_id: number;
  barber_id: number;
  client_id: number;
  service_id: number;
  booking_date: string;
  booking_time: string;
  duration_minutes: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Portfolio {
  id: number;
  barbershop_id: number;
  barber_id?: number;
  title: string;
  description?: string;
  before_photo_url?: string;
  after_photo_url: string;
  hairstyle_tags?: string; // JSON
  is_featured: boolean;
  likes_count: number;
  created_at: string;
}

export interface AITryOn {
  id: number;
  barbershop_id?: number;
  client_id?: number;
  session_id: string;
  original_photo_url: string;
  result_photo_url: string;
  hairstyle_name: string;
  face_shape?: string;
  hair_type?: string;
  created_at: string;
}
