-- =====================================================
-- Barber AI SaaS - D1 Database Schema
-- Payment Integration + Subscription Management
-- Date: 2026-01-18
-- =====================================================

-- =====================================================
-- 1. SUBSCRIPTION TIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  price_monthly INTEGER NOT NULL,  -- in cents (e.g., 1900 = $19.00)
  price_yearly INTEGER NOT NULL,   -- in cents
  features TEXT NOT NULL,           -- JSON array of features
  limits TEXT NOT NULL,             -- JSON object with limits
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- 2. PAYMENT TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,          -- in cents
  currency TEXT DEFAULT 'IDR',
  payment_method TEXT NOT NULL,
  payment_url TEXT,
  status TEXT DEFAULT 'PENDING',    -- PENDING, SUCCESS, FAILED, EXPIRED
  duitku_reference TEXT,
  duitku_response TEXT,             -- JSON response from Duitku
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- 3. USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  tier_id INTEGER NOT NULL,
  billing_cycle TEXT NOT NULL,      -- MONTHLY, YEARLY
  status TEXT DEFAULT 'PENDING',    -- PENDING, ACTIVE, CANCELLED, EXPIRED
  current_period_start TEXT,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (tier_id) REFERENCES subscription_tiers(id)
);

-- =====================================================
-- 4. INVOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  subscription_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  amount INTEGER NOT NULL,          -- in cents
  currency TEXT DEFAULT 'IDR',
  status TEXT DEFAULT 'PENDING',    -- PENDING, PAID, FAILED
  due_date TEXT,
  paid_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

-- =====================================================
-- 5. PAYMENT WEBHOOK LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_webhook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id TEXT NOT NULL,
  webhook_data TEXT NOT NULL,       -- JSON dari Duitku
  processed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- =====================================================
-- 6. SUBSCRIPTION HISTORY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subscription_id INTEGER NOT NULL,
  action TEXT NOT NULL,             -- CREATED, UPGRADED, DOWNGRADED, CANCELLED
  old_tier_id INTEGER,
  new_tier_id INTEGER,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (subscription_id) REFERENCES user_subscriptions(id)
);

-- =====================================================
-- 7. INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_tier_id ON user_subscriptions(tier_id);

CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_transaction_id ON payment_webhook_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhook_logs_processed ON payment_webhook_logs(processed);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription_id ON subscription_history(subscription_id);

-- =====================================================
-- 8. INSERT DEFAULT SUBSCRIPTION TIERS
-- =====================================================
INSERT OR IGNORE INTO subscription_tiers (id, name, display_name, price_monthly, price_yearly, features, limits, sort_order)
VALUES 
  (1, 'FREE', 'Free Trial', 0, 0, 
   '["5 bookings per month","Basic booking system","Email notifications","Mobile app access","Community support"]', 
   '{"bookings_per_month":5,"ai_tryon_per_month":3,"barbers":1,"support":"community","analytics":"basic"}', 
   1),
  
  (2, 'STARTER', 'Starter Plan', 1900, 15200, 
   '["50 bookings per month","AI Virtual Try-On (unlimited)","Email & SMS notifications","Priority email support","Analytics dashboard","Up to 3 barbers"]', 
   '{"bookings_per_month":50,"ai_tryon_per_month":999,"barbers":3,"support":"email","analytics":"standard"}', 
   2),
  
  (3, 'PRO', 'Pro Plan', 4900, 39200, 
   '["Unlimited bookings","AI Virtual Try-On (unlimited)","All notifications (Email, SMS, WhatsApp)","24/7 priority support","Advanced analytics","Up to 10 barbers","Custom branding","API access"]', 
   '{"bookings_per_month":999999,"ai_tryon_per_month":999999,"barbers":10,"support":"24/7","analytics":"advanced","api_access":true}', 
   3),
  
  (4, 'ENTERPRISE', 'Enterprise Plan', 9900, 79200, 
   '["Unlimited everything","Dedicated account manager","Custom AI models","Full API access","White label solution","SLA guaranteed","Unlimited barbers","Multi-location support","Custom integrations"]', 
   '{"bookings_per_month":999999,"ai_tryon_per_month":999999,"barbers":999,"support":"dedicated","analytics":"custom","api_access":true,"white_label":true}', 
   4);

-- =====================================================
-- END OF MIGRATION
-- =====================================================
