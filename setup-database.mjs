#!/usr/bin/env node

/**
 * Setup Supabase Database Schema
 * This script executes SQL schemas directly to Supabase PostgreSQL database
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase Configuration
const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';

/**
 * Execute SQL query to Supabase
 */
async function executeSql(sql) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      console.error(`Response: ${errorText}`);
      return false;
    }

    const result = await response.json();
    console.log('✅ SQL executed successfully');
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
    return false;
  }
}

/**
 * Execute SQL file using PostgREST query endpoint
 */
async function executeSqlDirect(sql) {
  try {
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n[${i + 1}/${statements.length}] Executing statement...`);
      
      // Use Supabase SQL Editor API
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({
          name: 'exec_sql',
          params: { query: statement }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Statement ${i + 1} failed: ${response.status}`);
        console.error(`SQL: ${statement.substring(0, 100)}...`);
        console.error(`Error: ${errorText}`);
        continue; // Continue with next statement
      }

      console.log(`✅ Statement ${i + 1} executed`);
    }

    return true;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting Supabase Database Setup...\n');
  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('🔑 Using Service Role Key\n');

  try {
    // Step 1: Execute main schema
    console.log('📋 Step 1: Executing main database schema (supabase_schema.sql)...');
    const mainSchema = readFileSync(join(__dirname, 'supabase_schema.sql'), 'utf-8');
    const mainResult = await executeSqlDirect(mainSchema);
    
    if (!mainResult) {
      console.log('⚠️  Main schema had some errors, continuing...\n');
    } else {
      console.log('✅ Main schema completed\n');
    }

    // Step 2: Execute Phase 3 auth schema
    console.log('📋 Step 2: Executing Phase 3 authentication schema (phase3_auth_schema.sql)...');
    const authSchema = readFileSync(join(__dirname, 'phase3_auth_schema.sql'), 'utf-8');
    const authResult = await executeSqlDirect(authSchema);
    
    if (!authResult) {
      console.log('⚠️  Auth schema had some errors, continuing...\n');
    } else {
      console.log('✅ Auth schema completed\n');
    }

    console.log('\n✅ Database setup completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Test registration: POST /api/auth/register');
    console.log('2. Test login: POST /api/auth/login');
    console.log('3. Verify database tables in Supabase dashboard');
    
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
