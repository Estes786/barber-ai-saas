import { Hono } from 'hono';
import type { CloudflareBindings, UserSubscription, UsageTracking } from '../types';
import { authMiddleware } from '../middleware/auth';

const app = new Hono<{ Bindings: CloudflareBindings }>();

// Apply authentication middleware to all subscription routes
app.use('/*', authMiddleware);

/**
 * GET /api/subscription/current
 * Get current user subscription
 */
app.get('/current', async (c) => {
  try {
    const { DB } = c.env;
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing userId parameter'
      }, 400);
    }

    const subscription = await DB.prepare(`
      SELECT s.*, t.display_name as tier_name, t.features, t.limits
      FROM user_subscriptions s
      LEFT JOIN subscription_tiers t ON s.tier_id = t.id
      WHERE s.user_id = ? AND s.status IN ('ACTIVE', 'TRIAL')
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(userId).first() as any;

    if (!subscription) {
      // User doesn't have subscription, return FREE tier
      const freeTier = await DB.prepare(`
        SELECT * FROM subscription_tiers WHERE id = 'FREE'
      `).first() as any;

      return c.json({
        success: true,
        subscription: {
          tier_id: 'FREE',
          tier_name: freeTier.display_name,
          status: 'ACTIVE',
          billing_cycle: 'MONTHLY',
          features: JSON.parse(freeTier.features),
          limits: JSON.parse(freeTier.limits),
          current_period_end: null
        }
      });
    }

    return c.json({
      success: true,
      subscription: {
        ...subscription,
        features: JSON.parse(subscription.features),
        limits: JSON.parse(subscription.limits)
      }
    });

  } catch (error: any) {
    console.error('Error fetching current subscription:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch subscription',
      message: error.message
    }, 500);
  }
});

/**
 * GET /api/subscription/usage
 * Get current period usage for user
 */
app.get('/usage', async (c) => {
  try {
    const { DB } = c.env;
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing userId parameter'
      }, 400);
    }

    // Get current subscription
    const subscription = await DB.prepare(`
      SELECT s.*, t.limits
      FROM user_subscriptions s
      LEFT JOIN subscription_tiers t ON s.tier_id = t.id
      WHERE s.user_id = ? AND s.status IN ('ACTIVE', 'TRIAL')
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(userId).first() as any;

    const periodStart = subscription ? subscription.current_period_start : new Date().toISOString().split('T')[0];
    const periodEnd = subscription ? subscription.current_period_end : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

    // Get usage for current period
    const { results: usage } = await DB.prepare(`
      SELECT resource_type, SUM(count) as total_count
      FROM usage_tracking
      WHERE user_id = ? 
        AND period_start >= ?
        AND period_end <= ?
      GROUP BY resource_type
    `).bind(userId, periodStart, periodEnd).all();

    // Parse limits
    const limits = subscription ? JSON.parse(subscription.limits) : {
      ai_tryon_per_month: 10,
      barbers: 1,
      bookings_per_month: 50
    };

    // Build usage object
    const usageObj: any = {
      period_start: periodStart,
      period_end: periodEnd,
      limits,
      current: {
        ai_tryon: 0,
        bookings: 0,
        api_calls: 0,
        chatbot: 0
      }
    };

    usage.forEach((item: any) => {
      switch (item.resource_type) {
        case 'AI_TRYON':
          usageObj.current.ai_tryon = item.total_count;
          break;
        case 'BOOKING':
          usageObj.current.bookings = item.total_count;
          break;
        case 'API_CALL':
          usageObj.current.api_calls = item.total_count;
          break;
        case 'CHATBOT':
          usageObj.current.chatbot = item.total_count;
          break;
      }
    });

    // Calculate remaining quotas
    usageObj.remaining = {
      ai_tryon: limits.ai_tryon_per_month === -1 ? -1 : Math.max(0, limits.ai_tryon_per_month - usageObj.current.ai_tryon),
      bookings: limits.bookings_per_month === -1 ? -1 : Math.max(0, limits.bookings_per_month - usageObj.current.bookings)
    };

    return c.json({
      success: true,
      usage: usageObj
    });

  } catch (error: any) {
    console.error('Error fetching usage:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch usage',
      message: error.message
    }, 500);
  }
});

/**
 * POST /api/subscription/track-usage
 * Track resource usage
 */
app.post('/track-usage', async (c) => {
  try {
    const { DB } = c.env;
    const body = await c.req.json();
    
    const { userId, resourceType, count = 1, metadata } = body;

    if (!userId || !resourceType) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Get current subscription period
    const subscription = await DB.prepare(`
      SELECT current_period_start, current_period_end
      FROM user_subscriptions
      WHERE user_id = ? AND status IN ('ACTIVE', 'TRIAL')
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(userId).first() as any;

    const periodStart = subscription ? subscription.current_period_start.split('T')[0] : new Date().toISOString().split('T')[0];
    const periodEnd = subscription ? subscription.current_period_end.split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

    // Insert usage record
    await DB.prepare(`
      INSERT INTO usage_tracking (
        user_id, resource_type, count, metadata, period_start, period_end
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      resourceType,
      count,
      metadata ? JSON.stringify(metadata) : null,
      periodStart,
      periodEnd
    ).run();

    return c.json({
      success: true,
      message: 'Usage tracked successfully'
    });

  } catch (error: any) {
    console.error('Error tracking usage:', error);
    return c.json({
      success: false,
      error: 'Failed to track usage',
      message: error.message
    }, 500);
  }
});

/**
 * POST /api/subscription/check-limit
 * Check if user can use a specific resource
 */
app.post('/check-limit', async (c) => {
  try {
    const { DB } = c.env;
    const body = await c.req.json();
    
    const { userId, resourceType } = body;

    if (!userId || !resourceType) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Get current subscription and limits
    const subscription = await DB.prepare(`
      SELECT s.*, t.limits
      FROM user_subscriptions s
      LEFT JOIN subscription_tiers t ON s.tier_id = t.id
      WHERE s.user_id = ? AND s.status IN ('ACTIVE', 'TRIAL')
      ORDER BY s.created_at DESC
      LIMIT 1
    `).bind(userId).first() as any;

    if (!subscription) {
      // Use FREE tier limits
      const freeTier = await DB.prepare(`
        SELECT limits FROM subscription_tiers WHERE id = 'FREE'
      `).first() as any;

      const limits = JSON.parse(freeTier.limits);
      
      // Get usage for FREE tier
      const today = new Date().toISOString().split('T')[0];
      const nextMonth = new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];

      const usage = await DB.prepare(`
        SELECT SUM(count) as total
        FROM usage_tracking
        WHERE user_id = ? 
          AND resource_type = ?
          AND period_start >= ?
          AND period_end <= ?
      `).bind(userId, resourceType, today, nextMonth).first() as any;

      const currentUsage = usage?.total || 0;
      const limitField = resourceType === 'AI_TRYON' ? 'ai_tryon_per_month' : 'bookings_per_month';
      const limit = limits[limitField] || 0;

      return c.json({
        success: true,
        allowed: limit === -1 || currentUsage < limit,
        currentUsage,
        limit,
        remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage)
      });
    }

    const limits = JSON.parse(subscription.limits);
    const periodStart = subscription.current_period_start.split('T')[0];
    const periodEnd = subscription.current_period_end.split('T')[0];

    // Get current usage
    const usage = await DB.prepare(`
      SELECT SUM(count) as total
      FROM usage_tracking
      WHERE user_id = ? 
        AND resource_type = ?
        AND period_start >= ?
        AND period_end <= ?
    `).bind(userId, resourceType, periodStart, periodEnd).first() as any;

    const currentUsage = usage?.total || 0;
    const limitField = resourceType === 'AI_TRYON' ? 'ai_tryon_per_month' : 'bookings_per_month';
    const limit = limits[limitField] || 0;

    // -1 means unlimited
    const allowed = limit === -1 || currentUsage < limit;

    return c.json({
      success: true,
      allowed,
      currentUsage,
      limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage)
    });

  } catch (error: any) {
    console.error('Error checking limit:', error);
    return c.json({
      success: false,
      error: 'Failed to check limit',
      message: error.message
    }, 500);
  }
});

/**
 * POST /api/subscription/cancel
 * Cancel subscription at period end
 */
app.post('/cancel', async (c) => {
  try {
    const { DB } = c.env;
    const body = await c.req.json();
    
    const { userId, subscriptionId } = body;

    if (!userId || !subscriptionId) {
      return c.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Update subscription to cancel at period end
    await DB.prepare(`
      UPDATE user_subscriptions 
      SET cancel_at_period_end = 1, 
          cancelled_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(subscriptionId, userId).run();

    // Log history
    await DB.prepare(`
      INSERT INTO subscription_history (
        user_id, subscription_id, action, metadata
      ) VALUES (?, ?, ?, ?)
    `).bind(
      userId,
      subscriptionId,
      'CANCELLED',
      JSON.stringify({ cancelled_by: 'user', reason: 'user_request' })
    ).run();

    return c.json({
      success: true,
      message: 'Subscription will be cancelled at period end'
    });

  } catch (error: any) {
    console.error('Error cancelling subscription:', error);
    return c.json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message
    }, 500);
  }
});

/**
 * GET /api/subscription/invoices
 * Get user invoices
 */
app.get('/invoices', async (c) => {
  try {
    const { DB } = c.env;
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({
        success: false,
        error: 'Missing userId parameter'
      }, 400);
    }

    const { results: invoices } = await DB.prepare(`
      SELECT * FROM invoices
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).bind(userId).all();

    return c.json({
      success: true,
      invoices: invoices.map((inv: any) => ({
        ...inv,
        invoice_data: JSON.parse(inv.invoice_data)
      }))
    });

  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch invoices',
      message: error.message
    }, 500);
  }
});

export default app;
