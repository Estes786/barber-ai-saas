// Cloudflare Bindings Type Definitions
export interface CloudflareBindings {
  DB: D1Database;
  R2: R2Bucket;
  AI: Ai;
  DUITKU_MERCHANT_CODE: string;
  DUITKU_API_KEY: string;
  DUITKU_CALLBACK_URL: string;
  DUITKU_RETURN_URL: string;
  SUPABASE_URL: string;
  SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  HUGGINGFACE_API_KEY: string;
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

// Phase 3.3: Payment & Subscription Types

export interface SubscriptionTier {
  id: string;
  name: string;
  display_name: string;
  price_monthly: number;
  price_yearly: number;
  features: any;
  limits: any;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserSubscription {
  id?: number;
  user_id: string;
  tier_id: string;
  billing_cycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'TRIAL' | 'PENDING';
  trial_ends_at?: string;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  cancelled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentTransaction {
  id?: number;
  transaction_id: string;
  user_id: string;
  subscription_id?: number;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_url?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED' | 'CANCELLED';
  duitku_reference?: string;
  duitku_response?: any;
  paid_at?: string;
  expires_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  user_id: string;
  subscription_id?: number;
  transaction_id?: number;
  amount: number;
  currency: string;
  status: 'DRAFT' | 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  due_date: string;
  paid_at?: string;
  invoice_data: any;
  created_at?: string;
  updated_at?: string;
}

// Duitku API Types
export interface DuitkuCreateTransactionRequest {
  merchantCode: string;
  paymentAmount: number;
  paymentMethod: string;
  merchantOrderId: string;
  productDetails: string;
  email: string;
  phoneNumber?: string;
  customerVaName: string;
  callbackUrl: string;
  returnUrl: string;
  expiryPeriod?: number;
  signature: string;
}

export interface DuitkuCreateTransactionResponse {
  statusCode: string;
  statusMessage: string;
  reference: string;
  paymentUrl: string;
  vaNumber?: string;
  amount: number;
}

export interface DuitkuCallbackPayload {
  merchantCode: string;
  amount: string;
  merchantOrderId: string;
  productDetail: string;
  additionalParam: string;
  paymentCode: string;
  resultCode: string;
  merchantUserId: string;
  reference: string;
  signature: string;
}

// Usage Tracking Types
export interface UsageTracking {
  id?: number;
  user_id: string;
  resource_type: 'AI_TRYON' | 'BOOKING' | 'API_CALL' | 'CHATBOT';
  count: number;
  metadata?: any;
  period_start: string;
  period_end: string;
  created_at?: string;
}

// Auth Context Types
export interface AuthUser {
  id: string;
  email: string;
  role: 'OWNER' | 'BARBER' | 'CLIENT';
  full_name?: string;
}
