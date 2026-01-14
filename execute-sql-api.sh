#!/bin/bash

# Supabase Configuration
SUPABASE_URL="https://wuuulccafxlhqxzityln.supabase.co"
SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY"
SUPABASE_ACCESS_TOKEN="sbp_3338e1c6090c5ddf7eca6cd20dd84f426d01e8da"
PROJECT_REF="wuuulccafxlhqxzityln"

echo "🚀 Supabase Database Setup via Management API"
echo ""
echo "📍 Project: $PROJECT_REF"
echo ""

# Test 1: Check if we can access the project
echo "🔍 Step 1: Testing API access..."
curl -s -X GET \
  "https://api.supabase.com/v1/projects/$PROJECT_REF" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" | jq -r '.name // "❌ Access failed"'

echo ""
echo "📝 Step 2: Attempting to execute SQL via Management API..."
echo ""

# Try to execute SQL using Management API query endpoint
SQL_QUERY='CREATE TABLE IF NOT EXISTS test_connection (id serial PRIMARY KEY, name text);'

curl -s -X POST \
  "https://api.supabase.com/v1/projects/$PROJECT_REF/database/query" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL_QUERY\"}" | jq '.'

echo ""
echo "✅ Script completed"
