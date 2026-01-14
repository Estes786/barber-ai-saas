#!/usr/bin/env node

/**
 * Setup Supabase Database Schema using Supabase Client
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase Configuration
const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';

// Create Supabase client with service role
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Execute SQL using Supabase SQL query
 */
async function executeSqlStatements(sqlContent, schemaName) {
  console.log(`\n📋 Executing ${schemaName}...`);
  
  try {
    // For Supabase, we'll use the Management API to execute raw SQL
    // But since we don't have direct SQL execution via REST API,
    // Let's try creating tables through Supabase client or provide manual steps
    
    console.log(`\n⚠️  Direct SQL execution is not available via Supabase client library.`);
    console.log(`\n📝 Please execute the following SQL manually in Supabase SQL Editor:`);
    console.log(`\n🔗 URL: ${SUPABASE_URL.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new`);
    console.log(`\n--- ${schemaName} ---`);
    console.log(sqlContent.substring(0, 500) + '...\n');
    
    console.log(`\n💡 Alternative: Copy the SQL files and paste them in Supabase SQL Editor:`);
    console.log(`   1. Open: https://supabase.com/dashboard/project/wuuulccafxlhqxzityln/sql/new`);
    console.log(`   2. Copy content from: supabase_schema.sql`);
    console.log(`   3. Click "RUN" button`);
    console.log(`   4. Repeat for: phase3_auth_schema.sql\n`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Test Supabase connection
 */
async function testConnection() {
  console.log('🔍 Testing Supabase connection...\n');
  
  try {
    // Try to fetch hairstyles table (should exist or be created)
    const { data, error } = await supabase
      .from('hairstyles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Table "hairstyles" not found. Database schema needs to be applied.');
      console.log(`Error: ${error.message}\n`);
      return false;
    }
    
    console.log('✅ Connection successful!\n');
    return true;
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}\n`);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Supabase Database Setup Tool\n');
  console.log('📍 Supabase URL:', SUPABASE_URL);
  console.log('🔑 Using Service Role Key\n');

  // Test connection
  const connected = await testConnection();
  
  if (!connected) {
    console.log('⚠️  Database tables not found. You need to execute SQL schemas manually.\n');
  }

  // Read SQL files
  const mainSchema = readFileSync(join(__dirname, 'supabase_schema.sql'), 'utf-8');
  const authSchema = readFileSync(join(__dirname, 'phase3_auth_schema.sql'), 'utf-8');

  // Since we can't execute SQL directly, provide instructions
  console.log('\n' + '='.repeat(80));
  console.log('📋 MANUAL SETUP REQUIRED');
  console.log('='.repeat(80) + '\n');
  
  console.log('Supabase doesn\'t allow direct SQL execution via API for security reasons.');
  console.log('Please follow these steps to setup your database:\n');
  
  console.log('1️⃣  Open Supabase SQL Editor:');
  console.log('   🔗 https://supabase.com/dashboard/project/wuuulccafxlhqxzityln/sql/new\n');
  
  console.log('2️⃣  Execute supabase_schema.sql:');
  console.log('   - Open file: supabase_schema.sql');
  console.log('   - Copy ALL content');
  console.log('   - Paste in SQL Editor');
  console.log('   - Click RUN button\n');
  
  console.log('3️⃣  Execute phase3_auth_schema.sql:');
  console.log('   - Open file: phase3_auth_schema.sql');
  console.log('   - Copy ALL content');
  console.log('   - Paste in SQL Editor');
  console.log('   - Click RUN button\n');
  
  console.log('4️⃣  Verify tables created:');
  console.log('   - Check Table Editor in Supabase dashboard');
  console.log('   - You should see tables: users, barbershops, barbers, clients, etc.\n');
  
  console.log('='.repeat(80));
  console.log('\n✅ After manual setup, you can test the authentication endpoints!\n');
}

// Run the script
main();
