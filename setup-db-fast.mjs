#!/usr/bin/env node
/**
 * Fast Database Setup - Execute Phase 3.3 Payment Migration
 * Uses Supabase Service Role Key untuk execute SQL langsung
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function executeSQLFile(filename) {
  console.log(`\n📄 Reading ${filename}...`);
  const sql = readFileSync(filename, 'utf-8');
  
  console.log(`⚡ Executing ${filename} via Supabase RPC...`);
  
  // Split into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));
  
  console.log(`   Found ${statements.length} statements`);
  
  let successful = 0;
  let failed = 0;
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    if (!stmt || stmt.length < 10) continue;
    
    try {
      // Execute via Supabase RPC
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });
      
      if (error) {
        // Ignore "already exists" errors
        if (error.message.includes('already exists') || error.message.includes('duplicate')) {
          console.log(`   ⚠️  Statement ${i + 1}: Already exists (skipped)`);
        } else {
          console.log(`   ❌ Statement ${i + 1}: ${error.message}`);
          failed++;
        }
      } else {
        successful++;
        console.log(`   ✅ Statement ${i + 1}: Success`);
      }
    } catch (err) {
      console.log(`   ❌ Statement ${i + 1}: ${err.message}`);
      failed++;
    }
  }
  
  console.log(`\n✅ Completed ${filename}: ${successful} successful, ${failed} failed`);
  return { successful, failed };
}

async function checkTables() {
  console.log('\n🔍 Checking existing tables...');
  
  const tables = [
    'subscription_tiers',
    'user_subscriptions',
    'payment_transactions',
    'invoices',
    'usage_tracking',
    'payment_webhook_logs',
    'subscription_history'
  ];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: NOT EXISTS`);
      } else {
        console.log(`   ✅ ${table}: EXISTS`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Fast Database Setup...\n');
  
  try {
    // Execute Phase 3.3 migration
    await executeSQLFile('./migrations/0004_payment_subscription.sql');
    
    // Check tables
    await checkTables();
    
    console.log('\n✅ Database setup completed!\n');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
