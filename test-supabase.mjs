#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wuuulccafxlhqxzityln.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dXVsY2NhZnhsaHF4eml0eWxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODMxNzM2MCwiZXhwIjoyMDgzODkzMzYwfQ.yA9WWlO9pcrcOKPx9aQ2o_uLo64oakZCjMQmSU82PEY';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('🔍 Testing Supabase Connection...\n');

// Test 1: Check if users table exists
console.log('1. Checking users table...');
const { data: users, error: usersError } = await supabase
  .from('users')
  .select('count')
  .limit(1);

if (usersError) {
  console.log('   ❌ Users table error:', usersError.message);
} else {
  console.log('   ✅ Users table accessible');
}

// Test 2: Try to create a test user
console.log('\n2. Testing user creation...');
const testEmail = `test${Date.now()}@example.com`;
const { data: authData, error: authError } = await supabase.auth.admin.createUser({
  email: testEmail,
  password: 'testpass123',
  email_confirm: true,
  user_metadata: {
    full_name: 'Test User',
    role: 'client'
  }
});

if (authError) {
  console.log('   ❌ Auth creation error:', authError.message);
} else {
  console.log('   ✅ User created in auth.users:', authData.user.id);
  
  // Test 3: Insert into users table
  console.log('\n3. Testing users table insert...');
  const { data: userData, error: insertError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      email: testEmail,
      full_name: 'Test User',
      role: 'client'
    })
    .select()
    .single();
  
  if (insertError) {
    console.log('   ❌ Insert error:', insertError.message);
    console.log('   Error details:', JSON.stringify(insertError, null, 2));
  } else {
    console.log('   ✅ User profile created:', userData.id);
  }
  
  // Cleanup
  console.log('\n4. Cleaning up test user...');
  await supabase.auth.admin.deleteUser(authData.user.id);
  console.log('   ✅ Test user deleted');
}

console.log('\n✨ Test complete!');
