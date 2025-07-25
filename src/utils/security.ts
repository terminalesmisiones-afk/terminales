import DOMPurify from 'dompurify';

// Input sanitization utility
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
};

// HTML content sanitization for rich text
export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: []
  });
};

// File validation utility
export const validateFile = (file: File, options: {
  maxSize?: number;
  allowedTypes?: string[];
}): { valid: boolean; error?: string } => {
  const { maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/webp'] } = options;

  if (file.size > maxSize) {
    return { valid: false, error: `El archivo excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `Tipo de archivo no permitido. Solo se permiten: ${allowedTypes.join(', ')}` };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp']
  };

  const expectedExtensions = validExtensions[file.type];
  if (expectedExtensions && (!extension || !expectedExtensions.includes(extension))) {
    return { valid: false, error: 'La extensión del archivo no coincide con su tipo' };
  }

  return { valid: true };
};

// URL validation
export const isValidURL = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:' || urlObj.protocol === 'http:';
  } catch {
    return false;
  }
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength validation
export const validatePasswordStrength = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8) {
    return { valid: false, error: 'La contraseña debe tener al menos 8 caracteres' };
  }

  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una letra minúscula' };
  }

  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos una letra mayúscula' };
  }

  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un número' };
  }

  if (!/(?=.*[@$!%*?&])/.test(password)) {
    return { valid: false, error: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)' };
  }

  return { valid: true };
};

// Phone number validation
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{8,20}$/;
  return phoneRegex.test(phone);
};

// Name validation (no special characters except spaces, hyphens, apostrophes)
export const isValidName = (name: string): boolean => {
  const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
  return nameRegex.test(name);
};

// Rate limiting helper
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    return true; // Request allowed
  };
};