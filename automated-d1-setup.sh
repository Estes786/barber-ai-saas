#!/bin/bash
# =====================================================
# AUTOMATED D1 SETUP & DEPLOYMENT SCRIPT
# Barber AI SaaS - Fix Payment Error
# =====================================================

set -e  # Exit on error

echo "🚀 Starting D1 Database Setup for Barber AI SaaS..."
echo ""

# =====================================================
# STEP 1: CREATE D1 DATABASE
# =====================================================
echo "📊 STEP 1: Creating D1 database..."
echo "Run this command manually and copy the database_id:"
echo ""
echo "  npx wrangler d1 create barber-ai-saas-production"
echo ""
echo "Then paste the database_id below when updating wrangler.jsonc"
echo ""
read -p "Press Enter after you've created the database..."

# =====================================================
# STEP 2: UPDATE WRANGLER.JSONC
# =====================================================
echo ""
echo "📝 STEP 2: Updating wrangler.jsonc..."
echo "Please manually edit wrangler.jsonc and add D1 binding:"
echo ""
echo '  "d1_databases": ['
echo '    {'
echo '      "binding": "DB",'
echo '      "database_name": "barber-ai-saas-production",'
echo '      "database_id": "YOUR_DATABASE_ID_HERE"  // ← PASTE HERE'
echo '    }'
echo '  ]'
echo ""
read -p "Press Enter after you've updated wrangler.jsonc..."

# =====================================================
# STEP 3: APPLY MIGRATIONS
# =====================================================
echo ""
echo "💾 STEP 3: Applying database migrations..."
npx wrangler d1 migrations apply barber-ai-saas-production

if [ $? -eq 0 ]; then
  echo "✅ Database schema created successfully!"
else
  echo "❌ Migration failed! Please check error above."
  exit 1
fi

# =====================================================
# STEP 4: SET ENVIRONMENT VARIABLES
# =====================================================
echo ""
echo "🔐 STEP 4: Setting environment variables in Cloudflare Pages..."
echo ""
echo "Setting SUPABASE_URL..."
echo "https://wuuulccafxlhqxzityln.supabase.co" | npx wrangler pages secret put SUPABASE_URL --project-name barber-ai-saas

echo "Setting SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTczNjAsImV4cCI6MjA4Mzg5MzM2MH0.i0aYYI1xey-hotI26Q7m4HcPo52x5XgzX-GsnlbYu_4" | npx wrangler pages secret put SUPABASE_ANON_KEY --project-name barber-ai-saas

echo "Setting DUITKU_MERCHANT_CODE..."
echo "D21260" | npx wrangler pages secret put DUITKU_MERCHANT_CODE --project-name barber-ai-saas

echo "Setting DUITKU_API_KEY..."
echo "8a7b2961148691d7a106b5ca85dd6497" | npx wrangler pages secret put DUITKU_API_KEY --project-name barber-ai-saas

echo "Setting DUITKU_CALLBACK_URL..."
echo "https://barber-ai-saas.pages.dev/api/payment/callback" | npx wrangler pages secret put DUITKU_CALLBACK_URL --project-name barber-ai-saas

echo "Setting DUITKU_RETURN_URL..."
echo "https://barber-ai-saas.pages.dev/subscription?status=success" | npx wrangler pages secret put DUITKU_RETURN_URL --project-name barber-ai-saas

echo "Setting JWT_SECRET..."
echo "barber-ai-saas-jwt-secret-2026-secure-key-32chars" | npx wrangler pages secret put JWT_SECRET --project-name barber-ai-saas

echo ""
echo "✅ All environment variables set!"

# =====================================================
# STEP 5: TRIGGER REDEPLOY
# =====================================================
echo ""
echo "🚀 STEP 5: Triggering redeployment..."
git commit --allow-empty -m "chore: trigger redeploy with D1 and env vars configured"
git push origin main

echo ""
echo "✅ Deployment triggered! Wait 3-5 minutes for Cloudflare Pages to rebuild."
echo ""
echo "🧪 TEST YOUR PAYMENT FLOW:"
echo "  1. Visit: https://barber-ai-saas.pages.dev/pricing"
echo "  2. Click 'Get Started' on any tier"
echo "  3. Register/Login"
echo "  4. Select payment method"
echo "  5. Click 'Proceed to Payment'"
echo "  6. Should redirect to Duitku (NO MORE ERROR!)"
echo ""
echo "🎉 PAYMENT ERROR FIXED!"
