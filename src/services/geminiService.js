/**
 * Gemini AI Chatbot Service
 * Provides instant mental health support using Google's Gemini API
 */

const GEMINI_API_KEY = 'AIzaSyC0k_YXgUvZSqKNFmltO0krBhA3JUfg2BA'
// Gemini 2.0 Flash - Latest model with working API key
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

/**
 * System prompt for mental health support chatbot
 */
const SYSTEM_PROMPT = `You are a compassionate mental health support assistant for YouthWell, a platform designed for young people aged 12-25 in Australia.

Your role:
- Provide empathetic, non-judgmental support for mental health concerns
- Offer coping strategies and self-care tips
- Encourage professional help when needed
- NEVER diagnose or provide medical advice
- Always prioritize safety - if someone mentions self-harm or suicide, provide crisis hotlines

Important crisis resources in Australia:
- Lifeline: 13 11 14 (24/7 crisis support)
- Kids Helpline: 1800 55 1800 (for ages 5-25)
- Beyond Blue: 1300 22 4636 (depression and anxiety)
- Headspace: 1800 650 890 (youth mental health)

Guidelines:
- Use warm, supportive language
- Ask open-ended questions to understand their feelings
- Validate their emotions
- Suggest practical coping strategies
- Keep responses concise but helpful (2-4 paragraphs max)
- If they mention crisis situations, immediately provide relevant hotlines

Remember: You are a supportive companion, not a replacement for professional help.`

/**
 * Chat history storage
 */
let chatHistory = []

/**
 * Send a message to Gemini AI and get response
 * @param {string} userMessage - The user's message
 * @returns {Promise<string>} - The AI's response
 */
export async function sendMessage(userMessage) {
  try {
    // Build conversation context
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT }]
      },
      {
        role: 'model',
        parts: [{ text: 'I understand. I am here to provide compassionate mental health support for young people. I will prioritize safety, never diagnose, and encourage professional help when needed. How can I support you today?' }]
      }
    ]

    // Add chat history
    chatHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })
    })

    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    })

    // Call Gemini API
    console.log('Calling Gemini API...')
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_ONLY_HIGH'
          }
        ]
      })
    })

    console.log('Gemini API response status:', response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error response:', errorData)
      throw new Error(`API request failed: ${response.status} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    console.log('Gemini API response data:', data)

    // Extract AI response
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'I apologize, but I had trouble processing that. Could you rephrase your message?'

    // Save to chat history
    chatHistory.push({ role: 'user', text: userMessage })
    chatHistory.push({ role: 'assistant', text: aiResponse })

    // Keep only last 10 messages to manage context length
    if (chatHistory.length > 20) {
      chatHistory = chatHistory.slice(-20)
    }

    return aiResponse

  } catch (error) {
    console.error('Error calling Gemini API:', error)

    // Return helpful error message
    if (error.message.includes('quota') || error.message.includes('429')) {
      return 'I apologize, but the AI service is currently experiencing high demand. Please try again in a few moments, or contact the crisis hotlines if you need immediate support:\n\n• Lifeline: 13 11 14\n• Kids Helpline: 1800 55 1800'
    }

    return 'I apologize, but I encountered an error. Please try again. If you need immediate support, please call:\n\n• Lifeline: 13 11 14 (24/7)\n• Kids Helpline: 1800 55 1800 (ages 5-25)\n• Beyond Blue: 1300 22 4636'
  }
}

/**
 * Clear chat history (start new conversation)
 */
export function clearChatHistory() {
  chatHistory = []
}

/**
 * Get current chat history
 * @returns {Array} - Array of chat messages
 */
export function getChatHistory() {
  return [...chatHistory]
}

/**
 * Detect crisis keywords in user message
 * @param {string} message - User's message
 * @returns {boolean} - True if crisis keywords detected
 */
export function detectCrisis(message) {
  const crisisKeywords = [
    'suicide', 'kill myself', 'end my life', 'want to die',
    'self harm', 'cut myself', 'hurt myself', 'no reason to live',
    'better off dead', 'suicidal'
  ]

  const lowerMessage = message.toLowerCase()
  return crisisKeywords.some(keyword => lowerMessage.includes(keyword))
}

/**
 * Get suggested prompts for users
 * @returns {Array<string>} - Array of suggested conversation starters
 */
export function getSuggestedPrompts() {
  return [
    "I'm feeling anxious about school...",
    "I've been feeling down lately...",
    "How can I deal with stress?",
    "I'm having trouble sleeping...",
    "I feel lonely and isolated...",
    "How do I talk to someone about my feelings?"
  ]
}
