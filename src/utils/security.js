/**
 * Security utility functions
 * Provides XSS protection, input validation, content sanitization and other security features
 */

// XSS Protection - Content sanitization
export function sanitizeContent(content) {
  if (typeof content !== 'string') return ''
  
  // Remove all HTML tags
  let sanitized = content.replace(/<[^>]*>/g, '')
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\//g, '&#x2F;')
    .replace(/\\/g, '&#x5C;')
  
  return sanitized.trim()
}

// Input validation - Username
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false
  
  const trimmed = username.trim()
  if (trimmed.length < 3 || trimmed.length > 30) return false
  
  // Only allow letters, numbers, and underscores
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  return usernameRegex.test(trimmed)
}

// Input validation - Password
export function validatePassword(password) {
  if (!password || typeof password !== 'string') return false
  
  if (password.length < 6 || password.length > 50) return false
  
  // Must contain both letters and numbers
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  
  return hasLetter && hasNumber
}

// Input validation - Role
export function validateRole(role) {
  const validRoles = ['user', 'admin']
  return validRoles.includes(role)
}

// Content length validation
export function validateContentLength(content, minLength, maxLength) {
  if (!content || typeof content !== 'string') return false
  
  const length = content.trim().length
  return length >= minLength && length <= maxLength
}

// Malicious content detection
export function detectMaliciousContent(content) {
  if (!content || typeof content !== 'string') return false
  
  const maliciousPatterns = [
    /script/i,
    /javascript/i,
    /on\w+\s*=/i,
    /<[^>]*>/,
    /vbscript/i,
    /expression/i,
    /applet/i,
    /embed/i,
    /object/i,
    /iframe/i
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(content))
}

// Safe JSON parsing
export function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error('JSON parsing error:', error)
    return fallback
  }
}

// Safe localStorage operations
export function safeLocalStorageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key)
    return value ? safeJsonParse(value, fallback) : fallback
  } catch (error) {
    console.error('LocalStorage get error:', error)
    return fallback
  }
}

export function safeLocalStorageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error('LocalStorage set error:', error)
    return false
  }
}

// Password strength checker
export function checkPasswordStrength(password) {
  if (!password || typeof password !== 'string') return 'weak'
  
  let score = 0
  
  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1
  
  // Character type check
  if (/[a-z]/.test(password)) score += 1
  if (/[A-Z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  
  if (score >= 5) return 'strong'
  if (score >= 3) return 'medium'
  return 'weak'
}

// Session timeout check
export function checkSessionTimeout(lastActivity, timeoutMinutes = 30) {
  if (!lastActivity) return true
  
  const now = Date.now()
  const timeoutMs = timeoutMinutes * 60 * 1000
  
  return (now - lastActivity) > timeoutMs
}

// Safe URL validation
export function validateUrl(url) {
  if (!url || typeof url !== 'string') return false
  
  try {
    const urlObj = new URL(url)
    return ['http:', 'https:'].includes(urlObj.protocol)
  } catch {
    return false
  }
}

// CSRF token generation for attack prevention
export function generateCSRFToken() {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

// Safe error message sanitization
export function sanitizeErrorMessage(error) {
  if (!error || typeof error !== 'string') return 'An error occurred'
  
  // Remove potentially system-information-leaking error messages
  const sanitized = error
    .replace(/at\s+.*?:\d+:\d+/g, '') // Remove stack traces
    .replace(/Error:\s*/g, '') // Remove error prefixes
    .replace(/\[.*?\]/g, '') // Remove bracket contents
  
  return sanitized.trim() || 'An error occurred'
}
