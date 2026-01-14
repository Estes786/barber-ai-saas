-- Phase 3.3: Payment Integration & Subscription Management
-- Migration: 0004_payment_subscription.sql

-- ============================================
-- SUBSCRIPTION TIERS
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL DEFAULT 0, -- in cents
  price_yearly INTEGER NOT NULL DEFAULT 0, -- in cents
  features JSON NOT NULL,
  limits JSON NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default subscription tiers
INSERT OR IGNORE INTO subscription_tiers (id, name, display_name, price_monthly, price_yearly, features, limits, sort_order) VALUES
('FREE', 'FREE', 'Free Forever', 0, 0, 
  json('{"ai_tryon": true, "booking_system": true, "basic_analytics": true}'), 
  json('{"ai_tryon_per_month": 10, "barbers": 1, "bookings_per_month": 50, "custom_domain": false}'), 
  1),
('STARTER', 'STARTER', 'Starter Plan', 1900, 15960, 
  json('{"ai_tryon": true, "booking_system": true, "reminders": true, "basic_analytics": true, "custom_domain": true}'), 
  json('{"ai_tryon_per_month": 100, "barbers": 3, "bookings_per_month": 500, "custom_domain": true}'), 
  2),
('PRO', 'PROFESSIONAL', 'Professional', 4900, 41160, 
  json('{"ai_tryon": true, "booking_system": true, "reminders": true, "advanced_analytics": true, "ai_chatbot": true, "whatsapp": true, "custom_domain": true, "priority_support": true}'), 
  json('{"ai_tryon_per_month": -1, "barbers": 10, "bookings_per_month": -1, "custom_domain": true}'), 
  3),
('ENTERPRISE', 'ENTERPRISE', 'Enterprise', 9900, 83160, 
  json('{"ai_tryon": true, "booking_system": true, "reminders": true, "advanced_analytics": true, "ai_chatbot": true, "whatsapp": true, "multi_location": true, "white_label": true, "api_access": true, "dedicated_support": true, "custom_domain": true}'), 
  json('{"ai_tryon_per_month": -1, "barbers": -1, "bookings_per_month": -1, "locations": -1, "custom_domain": true}'), 
  4);

-- ============================================
-- USER SUBSCRIPTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  tier_id TEXT NOT NULL,
  billing_cycle TEXT CHECK(billing_cycle IN ('MONTHLY', 'YEARLY')) DEFAULT 'MONTHLY',
  status TEXT CHECK(status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'TRIAL', 'PENDING')) DEFAULT 'TRIAL',
  trial_ends_at DATETIME,
  current_period_start DATETIME NOT NULL,
  current_period_end DATETIME NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT 0,
  cancelled_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tier_id) REFERENCES subscription_tiers(id)
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_period_end ON user_subscriptions(current_period_end);

-- ============================================
-- PAYMENT TRANSACTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL, -- Duitku transaction ID
  user_id TEXT NOT NULL,
  subscription_id INTEGER,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT DEFAULT 'IDR',
  payment_method TEXT,
  payment_url TEXT,
  status TEXT CHECK(status IN ('PENDING', 'SUCCESS', 'FAILED', 'EXPIRED', 'CANCELLED')) DEFAULT 'PENDING',
  duitku_reference TEXT, -- Duitku reference number
  duitku_response JSON, -- Full Duitku API response
  paid_at DATETIME,
  expires_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_created_at ON payment_transactions(created_at);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id INTEGER,
  transaction_id INTEGER,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'IDR',
  status TEXT CHECK(status IN ('DRAFT', 'PENDING', 'PAID', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
  due_date DATETIME NOT NULL,
  paid_at DATETIME,
  invoice_data JSON NOT NULL, -- Store full invoice details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id),
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(id)
);

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- ============================================
-- USAGE TRACKING
-- ============================================
CREATE TABLE IF NOT EXISTS usage_tracking (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'AI_TRYON', 'BOOKING', 'API_CALL', etc.
  count INTEGER DEFAULT 1,
  metadata JSON,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_resource_type ON usage_tracking(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_period ON usage_tracking(period_start, period_end);

-- ============================================
-- PAYMENT WEBHOOK LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT,
  webhook_type TEXT NOT NULL,
  payload JSON NOT NULL,
  status TEXT CHECK(status IN ('RECEIVED', 'PROCESSED', 'FAILED')) DEFAULT 'RECEIVED',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_transaction_id ON payment_webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_status ON payment_webhook_logs(status);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_created_at ON payment_webhook_logs(created_at);

-- ============================================
-- SUBSCRIPTION CHANGE HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  subscription_id INTEGER NOT NULL,
  action TEXT NOT NULL, -- 'CREATED', 'UPGRADED', 'DOWNGRADED', 'RENEWED', 'CANCELLED', 'EXPIRED'
  from_tier TEXT,
  to_tier TEXT,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);
