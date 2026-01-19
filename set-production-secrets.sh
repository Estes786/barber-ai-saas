#!/bin/bash
# Script to set Cloudflare Pages environment variables for production
# Note: This must be run with proper CLOUDFLARE_API_TOKEN set

echo "🔐 Setting Cloudflare Pages Production Environment Variables..."
echo ""

# Export the API token
export CLOUDFLARE_API_TOKEN="045lTe5Og9TmT-MDY3YU3VkB1uvqYsowD7C5oyaU"

# Set each environment variable
echo "Setting SUPABASE_URL..."
echo "SUPABASE_URL=https://wuuulccafxlhqxzityln.supabase.co" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting SUPABASE_ANON_KEY..."
echo "SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMTczNjAsImV4cCI6MjA4Mzg5MzM2MH0.i0aYYI1xey-hotI26Q7m4HcPo52x5XgzX-GsnlbYu_4" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting JWT_SECRET..."
echo "JWT_SECRET=CbcX7APjsywDIOcUhi7gkt9gYK3Bqmv759XC/zAS/7QB29llPWb5Z/lqHG7kCxPsV7Q3rRtPwEFKwCYBOg179Q==" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting DUITKU_MERCHANT_CODE..."
echo "DUITKU_MERCHANT_CODE=D21260" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting DUITKU_API_KEY..."
echo "DUITKU_API_KEY=8a7b2961148691d7a106b5ca85dd6497" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting DUITKU_CALLBACK_URL..."
echo "DUITKU_CALLBACK_URL=https://barber-ai-saas.pages.dev/api/payment/callback" | npx wrangler pages secret bulk barber-ai-saas

echo "Setting DUITKU_RETURN_URL..."
echo "DUITKU_RETURN_URL=https://barber-ai-saas.pages.dev/subscription?payment=success" | npx wrangler pages secret bulk barber-ai-saas

echo ""
echo "✅ All environment variables have been set!"
echo "🌐 Production URL: https://barber-ai-saas.pages.dev"
