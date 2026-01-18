import { Hono } from 'hono'
import type { CloudflareBindings, ContextVariables } from '../types'
import { createSupabaseClient } from '../lib/supabase'
import { verifyAuth } from '../lib/auth'

const app = new Hono<{ Bindings: CloudflareBindings; Variables: ContextVariables }>()

// Middleware: Require authentication for all dashboard routes
app.use('/*', async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const token = authHeader.substring(7)
  const user = await verifyAuth(token, c.env)

  if (!user) {
    return c.json({ error: 'Invalid or expired token' }, 401)
  }

  // Store user in context for use in routes
  c.set('user', user)
  await next()
})

// GET /api/dashboard/stats - Get dashboard statistics
app.get('/stats', async (c) => {
  try {
    const user = c.get('user') as any
    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('barbershop_id, role')
      .eq('id', user.id)
      .single()

    if (userError || !userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    const barbershopId = userData.barbershop_id

    // Get total revenue (completed bookings this month)
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, service_id, services(price)')
      .eq('barbershop_id', barbershopId)
      .eq('status', 'COMPLETED')
      .gte('created_at', startOfMonth)

    let totalRevenue = 0
    if (bookings) {
      totalRevenue = bookings.reduce((sum, booking: any) => {
        return sum + (booking.services?.price || 0)
      }, 0)
    }

    // Get total bookings count (this month)
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('barbershop_id', barbershopId)
      .gte('created_at', startOfMonth)

    // Get total clients count
    const { count: totalClients } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('barbershop_id', barbershopId)

    // Get portfolio items count
    const { count: portfolioCount } = await supabase
      .from('portfolio')
      .select('*', { count: 'exact', head: true })
      .eq('barbershop_id', barbershopId)

    // Get pending bookings count
    const { count: pendingBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('barbershop_id', barbershopId)
      .eq('status', 'PENDING')

    return c.json({
      success: true,
      stats: {
        totalRevenue,
        totalBookings: totalBookings || 0,
        totalClients: totalClients || 0,
        portfolioCount: portfolioCount || 0,
        pendingBookings: pendingBookings || 0
      }
    })
  } catch (error: any) {
    console.error('Dashboard stats error:', error)
    return c.json({ error: 'Failed to fetch dashboard stats', details: error.message }, 500)
  }
})

// GET /api/dashboard/bookings - Get bookings with filters
app.get('/bookings', async (c) => {
  try {
    const user = c.get('user') as any
    const supabase = createSupabaseClient(c.env)

    // Get query parameters
    const status = c.req.query('status') // 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Build query
    let query = supabase
      .from('bookings')
      .select(`
        *,
        barber:barbers(id, name, profile_photo_url),
        client:clients(id, name, email, phone, profile_photo_url),
        service:services(id, name, price, duration_minutes)
      `)
      .eq('barbershop_id', userData.barbershop_id)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply status filter if provided
    if (status) {
      query = query.eq('status', status)
    }

    const { data: bookings, error } = await query

    if (error) {
      return c.json({ error: 'Failed to fetch bookings', details: error.message }, 500)
    }

    return c.json({
      success: true,
      bookings: bookings || []
    })
  } catch (error: any) {
    console.error('Fetch bookings error:', error)
    return c.json({ error: 'Failed to fetch bookings', details: error.message }, 500)
  }
})

// PUT /api/dashboard/bookings/:id - Update booking status
app.put('/bookings/:id', async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.param('id')
    const { status, notes } = await c.req.json()

    const supabase = createSupabaseClient(c.env)

    // Verify booking belongs to user's barbershop
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Update booking
    const updateData: any = { status }
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .eq('barbershop_id', userData.barbershop_id)
      .select()
      .single()

    if (error) {
      return c.json({ error: 'Failed to update booking', details: error.message }, 500)
    }

    return c.json({
      success: true,
      booking: data
    })
  } catch (error: any) {
    console.error('Update booking error:', error)
    return c.json({ error: 'Failed to update booking', details: error.message }, 500)
  }
})

// DELETE /api/dashboard/bookings/:id - Cancel/Delete booking
app.delete('/bookings/:id', async (c) => {
  try {
    const user = c.get('user') as any
    const bookingId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // Verify booking belongs to user's barbershop
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Update booking status to CANCELLED
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'CANCELLED' })
      .eq('id', bookingId)
      .eq('barbershop_id', userData.barbershop_id)

    if (error) {
      return c.json({ error: 'Failed to cancel booking', details: error.message }, 500)
    }

    return c.json({
      success: true,
      message: 'Booking cancelled successfully'
    })
  } catch (error: any) {
    console.error('Cancel booking error:', error)
    return c.json({ error: 'Failed to cancel booking', details: error.message }, 500)
  }
})

// GET /api/dashboard/clients - Get client list with history
app.get('/clients', async (c) => {
  try {
    const user = c.get('user') as any
    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Get clients with booking count
    const { data: clients, error } = await supabase
      .from('clients')
      .select(`
        *,
        bookings:bookings(count)
      `)
      .eq('barbershop_id', userData.barbershop_id)
      .order('created_at', { ascending: false })

    if (error) {
      return c.json({ error: 'Failed to fetch clients', details: error.message }, 500)
    }

    return c.json({
      success: true,
      clients: clients || []
    })
  } catch (error: any) {
    console.error('Fetch clients error:', error)
    return c.json({ error: 'Failed to fetch clients', details: error.message }, 500)
  }
})

// GET /api/dashboard/clients/:id/history - Get client booking history
app.get('/clients/:id/history', async (c) => {
  try {
    const user = c.get('user') as any
    const clientId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Get client bookings
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        barber:barbers(name),
        service:services(name, price)
      `)
      .eq('client_id', clientId)
      .eq('barbershop_id', userData.barbershop_id)
      .order('start_time', { ascending: false })

    if (error) {
      return c.json({ error: 'Failed to fetch client history', details: error.message }, 500)
    }

    return c.json({
      success: true,
      bookings: bookings || []
    })
  } catch (error: any) {
    console.error('Fetch client history error:', error)
    return c.json({ error: 'Failed to fetch client history', details: error.message }, 500)
  }
})

// GET /api/dashboard/portfolio - Get portfolio items
app.get('/portfolio', async (c) => {
  try {
    const user = c.get('user') as any
    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Get portfolio items
    const { data: portfolio, error } = await supabase
      .from('portfolio')
      .select(`
        *,
        barber:barbers(id, name)
      `)
      .eq('barbershop_id', userData.barbershop_id)
      .order('created_at', { ascending: false })

    if (error) {
      return c.json({ error: 'Failed to fetch portfolio', details: error.message }, 500)
    }

    return c.json({
      success: true,
      portfolio: portfolio || []
    })
  } catch (error: any) {
    console.error('Fetch portfolio error:', error)
    return c.json({ error: 'Failed to fetch portfolio', details: error.message }, 500)
  }
})

// POST /api/dashboard/portfolio - Upload new portfolio item
app.post('/portfolio', async (c) => {
  try {
    const user = c.get('user') as any
    const { before_photo_url, after_photo_url, hairstyle_name, description } = await c.req.json()

    if (!after_photo_url) {
      return c.json({ error: 'After photo is required' }, 400)
    }

    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID and barber ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Get barber profile
    const { data: barber } = await supabase
      .from('barbers')
      .select('id')
      .eq('barbershop_id', userData.barbershop_id)
      .eq('email', user.email)
      .single()

    // Create portfolio item
    const { data, error } = await supabase
      .from('portfolio')
      .insert({
        barbershop_id: userData.barbershop_id,
        barber_id: barber?.id,
        before_photo_url,
        after_photo_url,
        hairstyle_name,
        description
      })
      .select()
      .single()

    if (error) {
      return c.json({ error: 'Failed to create portfolio item', details: error.message }, 500)
    }

    return c.json({
      success: true,
      portfolio: data
    })
  } catch (error: any) {
    console.error('Create portfolio error:', error)
    return c.json({ error: 'Failed to create portfolio item', details: error.message }, 500)
  }
})

// DELETE /api/dashboard/portfolio/:id - Delete portfolio item
app.delete('/portfolio/:id', async (c) => {
  try {
    const user = c.get('user') as any
    const portfolioId = c.req.param('id')
    const supabase = createSupabaseClient(c.env)

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    // Delete portfolio item
    const { error } = await supabase
      .from('portfolio')
      .delete()
      .eq('id', portfolioId)
      .eq('barbershop_id', userData.barbershop_id)

    if (error) {
      return c.json({ error: 'Failed to delete portfolio item', details: error.message }, 500)
    }

    return c.json({
      success: true,
      message: 'Portfolio item deleted successfully'
    })
  } catch (error: any) {
    console.error('Delete portfolio error:', error)
    return c.json({ error: 'Failed to delete portfolio item', details: error.message }, 500)
  }
})

// GET /api/dashboard/analytics - Get business analytics
app.get('/analytics', async (c) => {
  try {
    const user = c.get('user') as any
    const supabase = createSupabaseClient(c.env)
    const period = c.req.query('period') || '30' // days

    // Get user's barbershop ID
    const { data: userData } = await supabase
      .from('users')
      .select('barbershop_id')
      .eq('id', user.id)
      .single()

    if (!userData?.barbershop_id) {
      return c.json({ error: 'Barbershop not found' }, 404)
    }

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get revenue trend (daily)
    const { data: bookings } = await supabase
      .from('bookings')
      .select('start_time, service:services(price)')
      .eq('barbershop_id', userData.barbershop_id)
      .eq('status', 'COMPLETED')
      .gte('start_time', startDate.toISOString())
      .order('start_time', { ascending: true })

    // Process revenue trend
    const revenueTrend: { [key: string]: number } = {}
    if (bookings) {
      bookings.forEach((booking: any) => {
        const date = new Date(booking.start_time).toISOString().split('T')[0]
        if (!revenueTrend[date]) revenueTrend[date] = 0
        revenueTrend[date] += booking.service?.price || 0
      })
    }

    // Get popular services
    const { data: popularServices } = await supabase
      .from('bookings')
      .select('service_id, services(name, price), count')
      .eq('barbershop_id', userData.barbershop_id)
      .eq('status', 'COMPLETED')
      .gte('start_time', startDate.toISOString())

    // Get peak hours (hour of day with most bookings)
    const { data: hourlyBookings } = await supabase
      .from('bookings')
      .select('start_time')
      .eq('barbershop_id', userData.barbershop_id)
      .gte('start_time', startDate.toISOString())

    const peakHours: { [key: number]: number } = {}
    if (hourlyBookings) {
      hourlyBookings.forEach((booking: any) => {
        const hour = new Date(booking.start_time).getHours()
        peakHours[hour] = (peakHours[hour] || 0) + 1
      })
    }

    return c.json({
      success: true,
      analytics: {
        revenueTrend: Object.entries(revenueTrend).map(([date, revenue]) => ({
          date,
          revenue
        })),
        popularServices: popularServices || [],
        peakHours: Object.entries(peakHours).map(([hour, count]) => ({
          hour: parseInt(hour),
          count
        })).sort((a, b) => b.count - a.count).slice(0, 5)
      }
    })
  } catch (error: any) {
    console.error('Fetch analytics error:', error)
    return c.json({ error: 'Failed to fetch analytics', details: error.message }, 500)
  }
})

export default app
