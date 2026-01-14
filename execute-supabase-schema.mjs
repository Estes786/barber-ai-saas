#!/usr/bin/env node

/**
 * Supabase SQL Executor - AUTOMATIC EXECUTION
 * This script executes SQL schemas directly to Supabase using REST API
 * 
 * Usage: node execute-supabase-schema.mjs
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Configuration
const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';
const SUPABASE_ACCESS_TOKEN = 'sbp_3338e1c6090c5ddf7eca6cd20dd84f426d01e8da';
const PROJECT_REF = 'wuuulccafxlhqxzityln';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Supabase SQL Schema Executor - AUTOMATIC MODE\n');

/**
 * Execute SQL using Supabase REST API (Direct query)
 */
async function executeSQL(sql, description = 'Query') {
  try {
    console.log(`\n📝 Executing: ${description}`);
    console.log(`   SQL preview: ${sql.substring(0, 100)}...`);
    
    // Use PostgREST RPC endpoint to execute raw SQL
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({ query: sql })
    });

    const text = await response.text();
    
    if (!response.ok) {
      // If RPC endpoint doesn't exist, try alternative approach
      console.log(`   ⚠️  RPC method not available, trying alternative...`);
      return await executeSQLAlternative(sql, description);
    }
    
    console.log(`   ✅ Success: ${description}`);
    return { success: true, data: text };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Alternative method: Execute SQL via Management API
 */
async function executeSQLAlternative(sql, description = 'Query') {
  try {
    // Use Management API query endpoint
    const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`
      },
      body: JSON.stringify({ query: sql })
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(JSON.stringify(result));
    }
    
    console.log(`   ✅ Success (via Management API): ${description}`);
    return { success: true, data: result };
    
  } catch (error) {
    console.error(`   ❌ Error (Management API): ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Split SQL file into individual statements
 */
function splitSQLStatements(sql) {
  // Remove comments
  let cleaned = sql
    .replace(/--.*$/gm, '')  // Remove single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, '');  // Remove multi-line comments
  
  // Split by semicolon but keep function bodies intact
  const statements = [];
  let current = '';
  let inFunction = false;
  let dollarQuoteCount = 0;
  
  for (const line of cleaned.split('\n')) {
    current += line + '\n';
    
    // Track $$  markers (function bodies)
    if (line.includes('$$')) {
      dollarQuoteCount++;
    }
    
    // If we have even number of $$, we're outside function bodies
    inFunction = dollarQuoteCount % 2 !== 0;
    
    // If line ends with ; and we're not in a function, this is a statement
    if (line.trim().endsWith(';') && !inFunction) {
      const statement = current.trim();
      if (statement.length > 10) {  // Ignore very short statements
        statements.push(statement);
      }
      current = '';
    }
  }
  
  // Add remaining content if any
  if (current.trim().length > 10) {
    statements.push(current.trim());
  }
  
  return statements;
}

/**
 * Main execution function
 */
async function main() {
  try {
    // Read SQL schema files
    const schemaFile1 = join(__dirname, 'supabase_schema.sql');
    const schemaFile2 = join(__dirname, 'phase3_auth_schema.sql');
    
    console.log('📂 Reading SQL files...');
    console.log(`   File 1: ${schemaFile1}`);
    console.log(`   File 2: ${schemaFile2}`);
    
    const schema1 = readFileSync(schemaFile1, 'utf-8');
    const schema2 = readFileSync(schemaFile2, 'utf-8');
    
    console.log(`\n✅ Files loaded successfully!`);
    console.log(`   Schema 1: ${schema1.length} characters`);
    console.log(`   Schema 2: ${schema2.length} characters`);
    
    // Split into statements
    console.log(`\n🔪 Splitting SQL into individual statements...`);
    const statements1 = splitSQLStatements(schema1);
    const statements2 = splitSQLStatements(schema2);
    
    console.log(`   Schema 1: ${statements1.length} statements`);
    console.log(`   Schema 2: ${statements2.length} statements`);
    
    // Execute all statements from schema 1
    console.log(`\n🚀 Executing Schema 1 (Base Tables)...`);
    let successCount1 = 0;
    for (let i = 0; i < statements1.length; i++) {
      const result = await executeSQL(statements1[i], `Statement ${i + 1}/${statements1.length}`);
      if (result.success) successCount1++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Schema 1 Complete: ${successCount1}/${statements1.length} statements succeeded\n`);
    
    // Execute all statements from schema 2
    console.log(`🚀 Executing Schema 2 (Authentication & Security)...`);
    let successCount2 = 0;
    for (let i = 0; i < statements2.length; i++) {
      const result = await executeSQL(statements2[i], `Statement ${i + 1}/${statements2.length}`);
      if (result.success) successCount2++;
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Schema 2 Complete: ${successCount2}/${statements2.length} statements succeeded\n`);
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DATABASE SETUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Schema 1 (Base):    ${successCount1}/${statements1.length} ✅`);
    console.log(`Schema 2 (Auth):    ${successCount2}/${statements2.length} ✅`);
    console.log(`Total:              ${successCount1 + successCount2}/${statements1.length + statements2.length} ✅`);
    console.log('='.repeat(60));
    
    if ((successCount1 + successCount2) === (statements1.length + statements2.length)) {
      console.log('\n✨ ALL DATABASE SCHEMAS EXECUTED SUCCESSFULLY! ✨');
      console.log('\n📋 Next Steps:');
      console.log('   1. Test authentication: npm run dev');
      console.log('   2. Try register: http://localhost:3000/auth/register');
      console.log('   3. Try login: http://localhost:3000/auth/login');
      console.log('\n🚀 Phase 3.1 is NOW FULLY FUNCTIONAL!');
    } else {
      console.log('\n⚠️  Some statements failed. Check errors above.');
      console.log('   However, this might be OK if tables already exist.');
    }
    
    console.log('\n🔗 Supabase Dashboard: https://supabase.com/dashboard/project/wuuulccafxlhqxzityln');
    
  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main();
