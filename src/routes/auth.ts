// Authentication Routes for Phase 3
import { Hono } from 'hono'
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase'
import { requireAuth, type UserRole } from '../lib/auth'
import type { CloudflareBindings } from '../types'

const auth = new Hono<{ Bindings: CloudflareBindings }>()

// POST /auth/register - Register new user
auth.post('/register', async (c) => {
  try {
    const { email, password, full_name, role, phone, barbershop_id } = await c.req.json()

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return c.json({ 
        success: false, 
        error: 'Email, password, full_name, and role are required' 
      }, 400)
    }

    // Validate role
    const validRoles: UserRole[] = ['owner', 'barber', 'client']
    if (!validRoles.includes(role)) {
      return c.json({ success: false, error: 'Invalid role' }, 400)
    }

    const supabase = createSupabaseAdminClient(c.env)

    // Create auth user - this will automatically trigger handle_new_user() function
    // which creates the user profile in users table
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for demo
      user_metadata: {
        full_name,
        role,
        phone,
        barbershop_id: role === 'owner' ? barbershop_id : null
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return c.json({ success: false, error: authError.message }, 400)
    }

    if (!authData.user) {
      return c.json({ success: false, error: 'Failed to create user' }, 500)
    }

    // The trigger handle_new_user() will automatically create the user profile
    // Wait a moment for trigger to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    // Fetch the created user profile (created by trigger)
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', authData.user.id)
      .single()

    if (fetchError || !user) {
      console.error('Failed to fetch user profile:', fetchError)
      // User was created in auth.users but profile fetch failed
      // This is OK, user can still login
      return c.json({ 
        success: true, 
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email || email,
          full_name: full_name,
          role: role
        }
      }, 201)
    }

    return c.json({ 
      success: true, 
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    }, 201)

  } catch (error) {
    console.error('Register error:', error)
    return c.json({ success: false, error: 'Registration failed' }, 500)
  }
})

// POST /auth/login - Login user
auth.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json()

    if (!email || !password) {
      return c.json({ success: false, error: 'Email and password are required' }, 400)
    }

    const supabase = createSupabaseClient(c.env)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401)
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, role, barbershop_id')
      .eq('id', data.user.id)
      .single()

    return c.json({ 
      success: true,
      message: 'Login successful',
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: profile
    })

  } catch (error) {
    console.error('Login error:', error)
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

// POST /auth/logout - Logout user
auth.post('/logout', async (c) => {
  try {
    const authResult = await requireAuth(
      c.req.header('Authorization'),
      c.env
    )

    if (!authResult.success) {
      return c.json({ success: false, error: authResult.error }, 401)
    }

    const supabase = createSupabaseClient(c.env)
    await supabase.auth.signOut()

    return c.json({ success: true, message: 'Logout successful' })

  } catch (error) {
    console.error('Logout error:', error)
    return c.json({ success: false, error: 'Logout failed' }, 500)
  }
})

// GET /auth/me - Get current user profile
auth.get('/me', async (c) => {
  try {
    const authResult = await requireAuth(
      c.req.header('Authorization'),
      c.env
    )

    if (!authResult.success) {
      return c.json({ success: false, error: authResult.error }, 401)
    }

    const supabase = createSupabaseClient(c.env)
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, full_name, role, barbershop_id, phone, created_at')
      .eq('id', authResult.user!.id)
      .single()

    return c.json({ success: true, user: profile })

  } catch (error) {
    console.error('Get profile error:', error)
    return c.json({ success: false, error: 'Failed to get profile' }, 500)
  }
})

// POST /auth/refresh - Refresh access token
auth.post('/refresh', async (c) => {
  try {
    const { refresh_token } = await c.req.json()

    if (!refresh_token) {
      return c.json({ success: false, error: 'Refresh token required' }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    })

    if (error) {
      return c.json({ success: false, error: 'Invalid refresh token' }, 401)
    }

    return c.json({ 
      success: true,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return c.json({ success: false, error: 'Token refresh failed' }, 500)
  }
})

// POST /auth/reset-password - Request password reset
auth.post('/reset-password', async (c) => {
  try {
    const { email } = await c.req.json()

    if (!email) {
      return c.json({ success: false, error: 'Email is required' }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://barber-ai-saas.vercel.app/reset-password'
    })

    if (error) {
      return c.json({ success: false, error: error.message }, 400)
    }

    return c.json({ 
      success: true, 
      message: 'Password reset email sent. Please check your inbox.' 
    })

  } catch (error) {
    console.error('Password reset error:', error)
    return c.json({ success: false, error: 'Password reset failed' }, 500)
  }
})

// PUT /auth/update-password - Update password (authenticated)
auth.put('/update-password', async (c) => {
  try {
    const authResult = await requireAuth(
      c.req.header('Authorization'),
      c.env
    )

    if (!authResult.success) {
      return c.json({ success: false, error: authResult.error }, 401)
    }

    const { new_password } = await c.req.json()

    if (!new_password || new_password.length < 6) {
      return c.json({ success: false, error: 'Password must be at least 6 characters' }, 400)
    }

    const supabase = createSupabaseClient(c.env)
    const { error } = await supabase.auth.updateUser({
      password: new_password
    })

    if (error) {
      return c.json({ success: false, error: error.message }, 400)
    }

    return c.json({ success: true, message: 'Password updated successfully' })

  } catch (error) {
    console.error('Update password error:', error)
    return c.json({ success: false, error: 'Password update failed' }, 500)
  }
})

export default auth
