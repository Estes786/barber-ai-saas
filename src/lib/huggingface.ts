// Hugging Face API Utilities

export interface HuggingFaceEnv {
  HUGGINGFACE_TOKEN_FINE_GRAINED: string
  HUGGINGFACE_TOKEN_WRITE: string
}

/**
 * AI Virtual Try-On using Hugging Face API
 * Models: 
 * - Face detection: dlib-face-recognition
 * - Hairstyle transfer: StyleGAN or similar
 */
export async function performVirtualTryOn(
  imageBase64: string,
  hairstyleId: string,
  env: HuggingFaceEnv
): Promise<{ result_image: string; confidence: number }> {
  // For MVP, we'll use a simpler approach with face detection
  // In production, you'd use specialized models like:
  // - microsoft/trocr-base-printed for text
  // - face++ or similar for face manipulation
  
  const API_URL = 'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0'
  
  // Convert hairstyle ID to prompt
  const hairstylePrompts: Record<string, string> = {
    'fade': 'professional fade haircut, clean cut, modern style',
    'undercut': 'undercut hairstyle, short sides, longer top',
    'pompadour': 'classic pompadour hairstyle, voluminous top',
    'buzz': 'buzz cut, very short hair, military style',
    'crew': 'crew cut, short and neat hairstyle',
    'quiff': 'quiff hairstyle, textured top, styled forward'
  }
  
  const prompt = hairstylePrompts[hairstyleId] || 'modern hairstyle'
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HUGGINGFACE_TOKEN_FINE_GRAINED}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: `Portrait photo of a person with ${prompt}, professional barber photo, high quality`,
        // Note: For real implementation, you'd use img2img with the uploaded photo
      })
    })
    
    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const buffer = await blob.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
    
    return {
      result_image: `data:image/png;base64,${base64}`,
      confidence: 0.85
    }
  } catch (error) {
    console.error('Virtual try-on error:', error)
    throw new Error('Failed to perform virtual try-on')
  }
}

/**
 * AI Chatbot using Hugging Face LLM
 * Model: meta-llama/Llama-2-7b-chat-hf or similar
 */
export async function chatWithAI(
  message: string,
  context: string[],
  env: HuggingFaceEnv
): Promise<{ response: string; suggestions: string[] }> {
  const API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct'
  
  // Build conversation context
  const systemPrompt = `You are a professional barber assistant AI. You help clients choose hairstyles, 
provide hair care tips, and answer questions about barbering services. Be friendly, knowledgeable, and concise.`
  
  const conversationHistory = context.map(msg => msg).join('\n')
  const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationHistory}\nClient: ${message}\nBarber AI:`
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.HUGGINGFACE_TOKEN_FINE_GRAINED}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false
        }
      })
    })
    
    if (!response.ok) {
      throw new Error(`HF API error: ${response.statusText}`)
    }
    
    const result = await response.json()
    const aiResponse = Array.isArray(result) ? result[0].generated_text : result.generated_text
    
    // Generate suggestions based on conversation
    const suggestions = [
      'Tell me more about this style',
      'What hair products do I need?',
      'Show me similar styles',
      'Book an appointment'
    ]
    
    return {
      response: aiResponse.trim(),
      suggestions
    }
  } catch (error) {
    console.error('AI chat error:', error)
    return {
      response: "I'm here to help you find the perfect hairstyle! What style are you interested in?",
      suggestions: [
        'Show me fade styles',
        'What suits my face shape?',
        'Popular hairstyles',
        'Book appointment'
      ]
    }
  }
}

/**
 * Detect face shape from uploaded photo
 */
export async function detectFaceShape(
  imageBase64: string,
  env: HuggingFaceEnv
): Promise<{ face_shape: string; confidence: number }> {
  // In production, use face detection models
  // For MVP, return mock data
  const shapes = ['oval', 'round', 'square', 'heart', 'diamond']
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)]
  
  return {
    face_shape: randomShape,
    confidence: 0.82
  }
}
