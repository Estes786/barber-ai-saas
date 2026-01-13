// Vercel Edge Runtime Adapter for Hono App
import app from '../src/index'

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  return app.fetch(request, {
    // Mock Cloudflare bindings for Vercel Edge
    DB: null,  // Database disabled in Vercel (use Supabase instead)
    R2: null,  // R2 disabled
    AI: null,  // AI disabled
    // Environment variables from Vercel
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    HUGGINGFACE_TOKEN: process.env.HUGGINGFACE_TOKEN,
    HUGGINGFACE_TOKEN_WRITE: process.env.HUGGINGFACE_TOKEN_WRITE,
  })
}
