import { Context, Next } from 'hono'
import { requireAuth } from '../lib/auth'
import type { SupabaseEnv } from '../lib/supabase'
import type { UserRole } from '../lib/auth'

/**
 * Authentication Middleware
 * Protects routes by requiring valid JWT token
 */
export async function authMiddleware(c: Context<{ Bindings: SupabaseEnv }>, next: Next) {
  const authHeader = c.req.header('Authorization')
  
  const result = await requireAuth(authHeader, c.env)
  
  if (!result.success) {
    return c.json(
      { 
        success: false, 
        error: result.error || 'Unauthorized',
        code: 'AUTH_REQUIRED' 
      }, 
      401
    )
  }
  
  // Attach user to context for use in route handlers
  c.set('user', result.user)
  
  await next()
}

/**
 * Role-based Authentication Middleware
 * Protects routes by requiring specific user roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (c: Context<{ Bindings: SupabaseEnv }>, next: Next) => {
    const authHeader = c.req.header('Authorization')
    
    const result = await requireAuth(authHeader, c.env, allowedRoles)
    
    if (!result.success) {
      return c.json(
        { 
          success: false, 
          error: result.error || 'Unauthorized',
          code: 'INSUFFICIENT_PERMISSIONS' 
        }, 
        403
      )
    }
    
    // Attach user to context
    c.set('user', result.user)
    
    await next()
  }
}
