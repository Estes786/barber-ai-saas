#!/bin/bash

# Supabase Configuration
SUPABASE_URL="https://wuuulccafxlhqxzityln.supabase.co"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY"

echo "🚀 Executing Database Schema via Supabase REST API"
echo "=================================================="
echo ""
echo "📊 Target: ${SUPABASE_URL}"
echo ""

# Function to execute SQL using psql format
execute_sql_file() {
    local file=$1
    local description=$2
    
    echo "📝 Processing: $description"
    echo "   File: $file"
    
    # Use postgresql connection string  
    PGPASSWORD="${SUPABASE_SERVICE_KEY}" psql \
        "postgresql://postgres:${SUPABASE_SERVICE_KEY}@db.wuuulccafxlhqxzityln.supabase.co:5432/postgres" \
        -f "$file" 2>&1 | head -50
    
    if [ $? -eq 0 ]; then
        echo "✅ Success: $description"
    else
        echo "⚠️  Warning: Some statements may have failed (this is normal if tables exist)"
    fi
    echo ""
}

# Alternative: Split and execute via HTTP
execute_via_http() {
    local sql_content="$1"
    local description="$2"
    
    echo "📝 Executing via HTTP API: $description"
    
    # Execute using Supabase Management API
    response=$(curl -s -X POST "${SUPABASE_URL}/rest/v1/rpc/query" \
        -H "apikey: ${SUPABASE_SERVICE_KEY}" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}" 2>&1)
    
    echo "$response" | head -20
    echo ""
}

echo "STEP 1: Executing Base Schema (barbershops, barbers, services, etc.)"
echo "===================================================================="
echo ""

# Try to execute supabase_schema.sql
if [ -f "supabase_schema.sql" ]; then
    cat supabase_schema.sql | head -100
    echo ""
    echo "⚠️  Note: Execute the above SQL manually in Supabase SQL Editor if needed"
else
    echo "❌ supabase_schema.sql not found"
fi

echo ""
echo "STEP 2: Executing Phase 3 Authentication Schema"
echo "================================================"
echo ""

# Try to execute phase3_auth_schema.sql
if [ -f "phase3_auth_schema.sql" ]; then
    cat phase3_auth_schema.sql | head -100
    echo ""
    echo "⚠️  Note: Execute the above SQL manually in Supabase SQL Editor if needed"
else
    echo "❌ phase3_auth_schema.sql not found"
fi

echo ""
echo "================================================================"
echo "⚠️  MANUAL EXECUTION REQUIRED"
echo "================================================================"
echo ""
echo "Due to API limitations, please execute SQL manually:"
echo ""
echo "1. Open Supabase SQL Editor:"
echo "   https://wuuulccafxlhqxzityln.supabase.co/project/_/sql/new"
echo ""
echo "2. Copy and paste supabase_schema.sql content"
echo "3. Click 'Run' to execute"
echo ""
echo "4. Then copy and paste phase3_auth_schema.sql content"
echo "5. Click 'Run' to execute again"
echo ""
echo "📋 Files to execute (in order):"
echo "   1. supabase_schema.sql (base schema)"
echo "   2. phase3_auth_schema.sql (auth + users)"
echo ""
echo "🔗 Direct SQL Editor link:"
echo "   https://supabase.com/dashboard/project/wuuulccafxlhqxzityln/sql/new"
echo ""
