#!/usr/bin/env node

/**
 * PRACTICAL APPROACH: Test if database schema is already applied
 * If not, provide clear instructions for manual setup
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkTable(tableName) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { exists: false, error: error.message };
    }
    return { exists: true, count: data?.length || 0 };
  } catch (error) {
    return { exists: false, error: error.message };
  }
}

async function main() {
  console.log('🔍 Checking Supabase Database Schema Status...\n');
  console.log('📍 Project: wuuulccafxlhqxzityln');
  console.log('🔗 URL:', SUPABASE_URL + '\n');

  // Check essential tables
  const tables = [
    'barbershops',
    'barbers',
    'clients',
    'services',
    'bookings',
    'hairstyles',
    'users'  // Phase 3 auth table
  ];

  const results = [];
  
  console.log('📊 Checking tables...\n');
  
  for (const table of tables) {
    const result = await checkTable(table);
    results.push({ table, ...result });
    
    if (result.exists) {
      console.log(`  ✅ ${table.padEnd(20)} - EXISTS`);
    } else {
      console.log(`  ❌ ${table.padEnd(20)} - NOT FOUND`);
    }
  }

  const missingTables = results.filter(r => !r.exists);
  
  console.log('\n' + '='.repeat(80));
  
  if (missingTables.length === 0) {
    console.log('✅ ALL TABLES EXIST! Database schema is properly configured.\n');
    console.log('📝 Next steps:');
    console.log('  1. Build the application: npm run build');
    console.log('  2. Start development server: pm2 start ecosystem.config.cjs');
    console.log('  3. Test authentication endpoints\n');
    return;
  }

  console.log(`⚠️  MISSING ${missingTables.length} TABLES\n`);
  console.log('📋 MANUAL SETUP REQUIRED:\n');
  console.log('Since Supabase doesn\'t allow direct SQL execution via API,');
  console.log('you need to execute SQL schemas manually in Supabase SQL Editor.\n');
  
  console.log('🔧 STEP-BY-STEP INSTRUCTIONS:\n');
  console.log('1️⃣  Open Supabase SQL Editor:');
  console.log('    🔗 https://supabase.com/dashboard/project/wuuulccafxlhqxzityln/sql/new\n');
  
  console.log('2️⃣  Execute Base Schema (supabase_schema.sql):');
  console.log('    a. Open file: supabase_schema.sql');
  console.log('    b. Copy ALL content (Ctrl+A, Ctrl+C)');
  console.log('    c. Paste in SQL Editor');
  console.log('    d. Click RUN button (or F5)');
  console.log('    e. Wait for completion\n');
  
  console.log('3️⃣  Execute Auth Schema (phase3_auth_schema.sql):');
  console.log('    a. Open file: phase3_auth_schema.sql');
  console.log('    b. Copy ALL content (Ctrl+A, Ctrl+C)');
  console.log('    c. Paste in SQL Editor');
  console.log('    d. Click RUN button (or F5)');
  console.log('    e. Wait for completion\n');
  
  console.log('4️⃣  Verify Tables Created:');
  console.log('    a. Go to Table Editor tab in Supabase');
  console.log('    b. Check that all tables exist:');
  missingTables.forEach(t => console.log(`       - ${t.table}`));
  console.log('');
  
  console.log('5️⃣  Run this script again to verify:');
  console.log('    $ node check-database.mjs\n');
  
  console.log('='.repeat(80) + '\n');
  console.log('📖 For detailed instructions, see: DEPLOYMENT_INSTRUCTIONS.md');
  console.log('🔗 Supabase Dashboard: https://supabase.com/dashboard/project/wuuulccafxlhqxzityln\n');
}

main();
