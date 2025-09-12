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

// Enhanced malicious content detection with more XSS patterns
export function detectMaliciousContent(content) {
  if (!content || typeof content !== 'string') return false
  
  const maliciousPatterns = [
    // Script tags and JavaScript
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/i,
    /vbscript:/i,
    /data:/i,
    
    // Event handlers
    /on\w+\s*=/i,
    /on(abort|blur|change|click|dblclick|error|focus|keydown|keypress|keyup|load|mousedown|mousemove|mouseout|mouseover|mouseup|reset|resize|select|submit|unload)\s*=/i,
    
    // HTML tags that can execute scripts
    /<(script|object|embed|applet|meta|iframe|frame|frameset|link|style|base|form|input|textarea|select|option|img|audio|video|source|track)\b[^>]*>/i,
    
    // CSS expressions
    /expression\s*\(/i,
    /url\s*\(\s*javascript/i,
    /@import/i,
    
    // Protocol handlers
    /mailto:/i,
    /file:/i,
    /ftp:/i,
    
    // Encoding attempts
    /&#x?[0-9a-f]+;/i,
    /%[0-9a-f]{2}/i,
    
    // SVG XSS vectors
    /<svg\b[^>]*>/i,
    
    // Common XSS payloads
    /alert\s*\(/i,
    /confirm\s*\(/i,
    /prompt\s*\(/i,
    /document\.cookie/i,
    /window\.location/i,
    /eval\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i
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

// Rate limiting implementation
export class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    this.requests = new Map()
  }
  
  isAllowed(identifier) {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, [])
    }
    
    const userRequests = this.requests.get(identifier)
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => time > windowStart)
    this.requests.set(identifier, validRequests)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    return true
  }
  
  cleanup() {
    const now = Date.now()
    const windowStart = now - this.windowMs
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => time > windowStart)
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

// Content Security Policy helpers
export function generateNonce() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Secure form validation with comprehensive checks
export function validateFormData(data, rules) {
  const errors = {}
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]
    
    // Required field check
    if (rule.required && (!value || value.toString().trim().length === 0)) {
      errors[field] = `${field} is required`
      continue
    }
    
    if (!value) continue // Skip validation for optional empty fields
    
    // Length validation
    if (rule.minLength && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`
      continue
    }
    
    if (rule.maxLength && value.length > rule.maxLength) {
      errors[field] = `${field} must be no more than ${rule.maxLength} characters`
      continue
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.patternMessage || `${field} format is invalid`
      continue
    }
    
    // Custom validation function
    if (rule.validator && !rule.validator(value)) {
      errors[field] = rule.validatorMessage || `${field} is invalid`
      continue
    }
    
    // XSS detection
    if (detectMaliciousContent(value)) {
      errors[field] = `${field} contains potentially harmful content`
      continue
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Session security
export function generateSecureSessionToken() {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Input sanitization with allowlist approach
export function sanitizeWithAllowlist(input, allowedTags = []) {
  if (typeof input !== 'string') return ''
  
  // First, detect malicious content
  if (detectMaliciousContent(input)) {
    return '' // Reject entirely if malicious content detected
  }
  
  let sanitized = input
  
  // If no tags are allowed, remove all HTML
  if (allowedTags.length === 0) {
    sanitized = sanitized.replace(/<[^>]*>/g, '')
  } else {
    // Remove only disallowed tags
    const allowedPattern = new RegExp(`<(?!\/?(?:${allowedTags.join('|')})\b)[^>]*>`, 'gi')
    sanitized = sanitized.replace(allowedPattern, '')
  }
  
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

// Secure headers helper
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  }
}
