// Authentication Utilities for Supabase Auth
import { createSupabaseClient } from './supabase'
import type { SupabaseEnv } from './supabase'

export type UserRole = 'owner' | 'barber' | 'client'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  barbershop_id?: string
  created_at: string
}

// Verify JWT token and extract user info
export async function verifyAuth(token: string, env: SupabaseEnv): Promise<AuthUser | null> {
  try {
    const supabase = createSupabaseClient(env)
    
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null

    // Get user profile from database to get role
    const { data: profile } = await supabase
      .from('users')
      .select('id, email, role, barbershop_id, created_at')
      .eq('id', user.id)
      .single()

    if (!profile) return null

    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as UserRole,
      barbershop_id: profile.barbershop_id,
      created_at: profile.created_at
    }
  } catch (error) {
    console.error('Auth verification error:', error)
    return null
  }
}

// Extract JWT token from Authorization header
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader) return null
  if (!authHeader.startsWith('Bearer ')) return null
  return authHeader.substring(7)
}

// Check if user has required role
export function hasRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(user.role)
}

// Middleware helper to protect routes
export async function requireAuth(
  authHeader: string | null,
  env: SupabaseEnv,
  allowedRoles?: UserRole[]
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const token = extractToken(authHeader)
  if (!token) {
    return { success: false, error: 'No authorization token provided' }
  }

  const user = await verifyAuth(token, env)
  if (!user) {
    return { success: false, error: 'Invalid or expired token' }
  }

  if (allowedRoles && !hasRole(user, allowedRoles)) {
    return { success: false, error: 'Insufficient permissions' }
  }

  return { success: true, user }
}
