import DOMPurify from 'isomorphic-dompurify';

// Input validation rules
export const VALIDATION_RULES = {
  message: {
    minLength: 1,
    maxLength: 10000, // ~2000 words
    pattern: /^[\s\S]*$/, // Allow all characters including newlines
  },
  title: {
    minLength: 1,
    maxLength: 200,
    pattern: /^[a-zA-Z0-9\s\-.,!?'"()]+$/, // Alphanumeric + common punctuation
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    domain: '@reichmanjorgensen.com'
  }
};

// Sanitize HTML content (for markdown rendering)
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code', 'pre', 'blockquote', 
                   'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target="_blank"', 'rel="noopener noreferrer"']
  });
}

// Validate and sanitize message input
export function validateMessage(message: string): { 
  isValid: boolean; 
  error?: string; 
  sanitized?: string;
} {
  // Check if empty
  if (!message || message.trim().length === 0) {
    return { isValid: false, error: 'Message cannot be empty' };
  }

  // Check length
  if (message.length > VALIDATION_RULES.message.maxLength) {
    return { 
      isValid: false, 
      error: `Message too long. Maximum ${VALIDATION_RULES.message.maxLength} characters allowed.` 
    };
  }

  // Remove any potential script tags or dangerous content
  const sanitized = message
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers

  return { isValid: true, sanitized };
}

// Validate chat title
export function validateTitle(title: string): {
  isValid: boolean;
  error?: string;
  sanitized?: string;
} {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title cannot be empty' };
  }

  if (title.length > VALIDATION_RULES.title.maxLength) {
    return { 
      isValid: false, 
      error: `Title too long. Maximum ${VALIDATION_RULES.title.maxLength} characters allowed.` 
    };
  }

  // Remove any HTML tags and trim
  const sanitized = title.replace(/<[^>]*>/g, '').trim();

  if (!VALIDATION_RULES.title.pattern.test(sanitized)) {
    return { 
      isValid: false, 
      error: 'Title contains invalid characters. Only letters, numbers, and common punctuation allowed.' 
    };
  }

  return { isValid: true, sanitized };
}

// Validate email domain
export function validateEmailDomain(email: string): boolean {
  return email.endsWith(VALIDATION_RULES.email.domain);
}

// Sanitize JSON data to prevent prototype pollution
export function sanitizeJson(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized: any = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    // Skip prototype properties
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      continue;
    }
    
    if (obj.hasOwnProperty(key)) {
      sanitized[key] = typeof obj[key] === 'object' 
        ? sanitizeJson(obj[key]) 
        : obj[key];
    }
  }
  
  return sanitized;
}