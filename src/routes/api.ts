// API Routes for Phase 2 Features
import { Hono } from 'hono'
import { createSupabaseClient, createSupabaseAdminClient } from '../lib/supabase'
import { performVirtualTryOn, chatWithAI, detectFaceShape } from '../lib/huggingface'

type Bindings = {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  HUGGINGFACE_TOKEN_FINE_GRAINED: string
  HUGGINGFACE_TOKEN_WRITE: string
}

const api = new Hono<{ Bindings: Bindings }>()

// ========== AI VIRTUAL TRY-ON ROUTES ==========

/**
 * POST /api/tryon/upload
 * Upload photo and detect face shape
 */
api.post('/tryon/upload', async (c) => {
  try {
    const { image } = await c.req.json()
    
    if (!image) {
      return c.json({ error: 'Image is required' }, 400)
    }
    
    const env = c.env
    const faceResult = await detectFaceShape(image, env)
    
    // Get hairstyle recommendations based on face shape
    const supabase = createSupabaseClient(env)
    const { data: recommendations } = await supabase
      .from('hairstyles')
      .select('*')
      .eq('recommended_face_shape', faceResult.face_shape)
      .limit(6)
    
    return c.json({
      success: true,
      face_shape: faceResult.face_shape,
      confidence: faceResult.confidence,
      recommendations: recommendations || []
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return c.json({ error: error.message || 'Upload failed' }, 500)
  }
})

/**
 * POST /api/tryon/generate
 * Generate virtual try-on result
 */
api.post('/tryon/generate', async (c) => {
  try {
    const { image, hairstyle_id, barbershop_id } = await c.req.json()
    
    if (!image || !hairstyle_id) {
      return c.json({ error: 'Image and hairstyle_id are required' }, 400)
    }
    
    const env = c.env
    
    // Check subscription limits (if barbershop_id provided)
    if (barbershop_id) {
      const supabase = createSupabaseAdminClient(env)
      const { data: shop } = await supabase
        .from('barbershops')
        .select('ai_tryons_used, ai_tryons_limit')
        .eq('id', barbershop_id)
        .single()
      
      if (shop && shop.ai_tryons_used >= shop.ai_tryons_limit) {
        return c.json({ 
          error: 'AI try-on limit reached. Please upgrade your plan.' 
        }, 403)
      }
    }
    
    // Perform virtual try-on
    const result = await performVirtualTryOn(image, hairstyle_id, env)
    
    // Save to database
    if (barbershop_id) {
      const supabaseAdmin = createSupabaseAdminClient(env)
      
      // Increment usage counter
      await supabaseAdmin.rpc('increment_ai_tryons', { 
        shop_id: barbershop_id 
      })
      
      // Save try-on result
      await supabaseAdmin.from('ai_tryons').insert({
        barbershop_id,
        hairstyle_id,
        result_image_url: result.result_image,
        confidence: result.confidence
      })
    }
    
    return c.json({
      success: true,
      result_image: result.result_image,
      confidence: result.confidence
    })
  } catch (error: any) {
    console.error('Try-on generation error:', error)
    return c.json({ error: error.message || 'Generation failed' }, 500)
  }
})

/**
 * GET /api/hairstyles
 * Get hairstyle library
 */
api.get('/hairstyles', async (c) => {
  try {
    const supabase = createSupabaseClient(c.env)
    const category = c.req.query('category')
    const faceShape = c.req.query('face_shape')
    
    let query = supabase.from('hairstyles').select('*')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    if (faceShape) {
      query = query.eq('recommended_face_shape', faceShape)
    }
    
    const { data, error } = await query.order('popularity', { ascending: false })
    
    if (error) throw error
    
    return c.json({ success: true, hairstyles: data })
  } catch (error: any) {
    return c.json({ error: error.message || 'Failed to fetch hairstyles' }, 500)
  }
})

// ========== BOOKING SYSTEM ROUTES ==========

/**
 * GET /api/bookings/availability
 * Get available time slots for booking
 */
api.get('/bookings/availability', async (c) => {
  try {
    const barbershopId = c.req.query('barbershop_id')
    const barberId = c.req.query('barber_id')
    const date = c.req.query('date')
    
    if (!barbershopId || !date) {
      return c.json({ error: 'barbershop_id and date are required' }, 400)
    }
    
    const supabase = createSupabaseClient(c.env)
    
    // Get business hours
    const { data: hours } = await supabase
      .from('business_hours')
      .select('*')
      .eq('barbershop_id', barbershopId)
      .eq('day_of_week', new Date(date).getDay())
      .single()
    
    if (!hours || !hours.is_open) {
      return c.json({ 
        success: true, 
        available_slots: [],
        message: 'Shop is closed on this day'
      })
    }
    
    // Get existing bookings
    let bookingsQuery = supabase
      .from('bookings')
      .select('start_time, end_time')
      .eq('barbershop_id', barbershopId)
      .gte('start_time', `${date}T00:00:00`)
      .lt('start_time', `${date}T23:59:59`)
      .neq('status', 'cancelled')
    
    if (barberId) {
      bookingsQuery = bookingsQuery.eq('barber_id', barberId)
    }
    
    const { data: bookings } = await bookingsQuery
    
    // Generate available time slots (30-minute intervals)
    const slots = generateTimeSlots(
      hours.open_time,
      hours.close_time,
      bookings || []
    )
    
    return c.json({
      success: true,
      date,
      available_slots: slots,
      business_hours: {
        open: hours.open_time,
        close: hours.close_time
      }
    })
  } catch (error: any) {
    console.error('Availability error:', error)
    return c.json({ error: error.message || 'Failed to fetch availability' }, 500)
  }
})

/**
 * POST /api/bookings/create
 * Create a new booking
 */
api.post('/bookings/create', async (c) => {
  try {
    const { 
      barbershop_id, 
      barber_id, 
      client_name,
      client_email,
      client_phone,
      service_id,
      start_time,
      notes
    } = await c.req.json()
    
    if (!barbershop_id || !barber_id || !client_email || !service_id || !start_time) {
      return c.json({ error: 'Missing required fields' }, 400)
    }
    
    const supabaseAdmin = createSupabaseAdminClient(c.env)
    
    // Get service duration
    const { data: service } = await supabaseAdmin
      .from('services')
      .select('duration_minutes')
      .eq('id', service_id)
      .single()
    
    if (!service) {
      return c.json({ error: 'Service not found' }, 404)
    }
    
    // Calculate end time
    const startDate = new Date(start_time)
    const endDate = new Date(startDate.getTime() + service.duration_minutes * 60000)
    
    // Check if slot is still available
    const { data: conflicts } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('barber_id', barber_id)
      .gte('start_time', start_time)
      .lt('start_time', endDate.toISOString())
      .neq('status', 'cancelled')
    
    if (conflicts && conflicts.length > 0) {
      return c.json({ error: 'Time slot is no longer available' }, 409)
    }
    
    // Create client if doesn't exist
    const { data: existingClient } = await supabaseAdmin
      .from('clients')
      .select('id')
      .eq('email', client_email)
      .eq('barbershop_id', barbershop_id)
      .single()
    
    let clientId = existingClient?.id
    
    if (!clientId) {
      const { data: newClient } = await supabaseAdmin
        .from('clients')
        .insert({
          barbershop_id,
          name: client_name,
          email: client_email,
          phone: client_phone
        })
        .select('id')
        .single()
      
      clientId = newClient?.id
    }
    
    // Create booking
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .insert({
        barbershop_id,
        barber_id,
        client_id: clientId,
        service_id,
        start_time,
        end_time: endDate.toISOString(),
        status: 'confirmed',
        notes
      })
      .select('*')
      .single()
    
    if (error) throw error
    
    return c.json({
      success: true,
      booking,
      message: 'Booking confirmed! You will receive a confirmation email shortly.'
    })
  } catch (error: any) {
    console.error('Booking creation error:', error)
    return c.json({ error: error.message || 'Failed to create booking' }, 500)
  }
})

// ========== AI CHATBOT ROUTES ==========

/**
 * POST /api/chat/message
 * Send message to AI chatbot
 */
api.post('/chat/message', async (c) => {
  try {
    const { message, barbershop_id, session_id, context } = await c.req.json()
    
    if (!message) {
      return c.json({ error: 'Message is required' }, 400)
    }
    
    const env = c.env
    
    // Get AI response
    const result = await chatWithAI(message, context || [], env)
    
    // Save consultation to database if barbershop_id provided
    if (barbershop_id) {
      const supabaseAdmin = createSupabaseAdminClient(env)
      await supabaseAdmin.from('consultations').insert({
        barbershop_id,
        session_id: session_id || crypto.randomUUID(),
        client_message: message,
        ai_response: result.response,
        context: context || []
      })
    }
    
    return c.json({
      success: true,
      response: result.response,
      suggestions: result.suggestions
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return c.json({ 
      error: 'Chat service temporarily unavailable',
      fallback_response: "I'm here to help! What would you like to know about hairstyles?"
    }, 500)
  }
})

// Helper function to generate time slots
function generateTimeSlots(
  openTime: string, 
  closeTime: string, 
  bookings: any[]
): string[] {
  const slots: string[] = []
  const open = parseTime(openTime)
  const close = parseTime(closeTime)
  
  let current = open
  while (current < close) {
    const timeStr = formatTime(current)
    
    // Check if slot conflicts with any booking
    const hasConflict = bookings.some(booking => {
      const bookingStart = new Date(booking.start_time).getHours() * 60 + 
                          new Date(booking.start_time).getMinutes()
      const bookingEnd = new Date(booking.end_time).getHours() * 60 + 
                        new Date(booking.end_time).getMinutes()
      return current >= bookingStart && current < bookingEnd
    })
    
    if (!hasConflict) {
      slots.push(timeStr)
    }
    
    current += 30 // 30-minute intervals
  }
  
  return slots
}

function parseTime(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

export default api
