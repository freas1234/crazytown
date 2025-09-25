interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  required?: boolean;
  custom?: (value: any) => string | null;
}

// Input validation rules
export const VALIDATION_RULES = {
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_-]+$/,
    required: true,
    custom: (value: string) => {
      if (value.includes('..') || value.startsWith('.') || value.endsWith('.')) {
        return 'Username cannot start or end with dots or contain consecutive dots';
      }
      if (value.toLowerCase().includes('admin') || value.toLowerCase().includes('root')) {
        return 'Username cannot contain restricted words';
      }
      return null;
    }
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    required: true,
    custom: (value: string) => {
      const domain = value.split('@')[1];
      if (domain && domain.length > 63) {
        return 'Email domain is too long';
      }
      return null;
    }
  },
  password: {
    minLength: 10,
    maxLength: 128,
    required: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    custom: (value: string, context?: any) => {
      if (value.includes(' ')) {
        return 'Password cannot contain spaces';
      }
      
      // Check for common patterns
      const commonPatterns = [
        /123456/,
        /password/i,
        /qwerty/i,
        /abc123/i,
        /admin/i,
        /user/i,
        /test/i
      ];
      
      if (commonPatterns.some(pattern => pattern.test(value))) {
        return 'Password cannot contain common patterns';
      }
      
      // Check similarity to email
      if (context?.email) {
        const emailParts = context.email.split('@')[0].toLowerCase();
        if (value.toLowerCase().includes(emailParts) && emailParts.length > 3) {
          return 'Password cannot be similar to your email';
        }
      }
      
      // Check for repeated characters
      if (/(.)\1{2,}/.test(value)) {
        return 'Password cannot contain more than 2 consecutive identical characters';
      }
      
      return null;
    }
  },
  generalText: {
    maxLength: 1000,
    required: false,
    custom: (value: string) => {
      // Check for potential XSS
      if (/<script|javascript:|on\w+\s*=/i.test(value)) {
        return 'Invalid characters detected';
      }
      return null;
    }
  }
} as const;

// Validate a single field
export function validateField(
  value: any, 
  rules: ValidationRules, 
  fieldName: string,
  context?: any
): ValidationResult {
  const errors: string[] = [];

  // Check if required
  if (rules.required && (!value || value.toString().trim() === '')) {
    errors.push(`${fieldName} is required`);
    return { isValid: false, errors };
  }

  // Skip other validations if value is empty and not required
  if (!value || value.toString().trim() === '') {
    return { isValid: true, errors: [] };
  }

  const stringValue = value.toString();

  // Check minimum length
  if (rules.minLength && stringValue.length < rules.minLength) {
    errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
  }

  // Check maximum length
  if (rules.maxLength && stringValue.length > rules.maxLength) {
    errors.push(`${fieldName} must be no more than ${rules.maxLength} characters long`);
  }

  // Check pattern
  if (rules.pattern && !rules.pattern.test(stringValue)) {
    errors.push(`${fieldName} format is invalid`);
  }

  // Check custom validation
  if (rules.custom) {
    const customError = rules.custom(value);
    if (customError) {
      errors.push(customError);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Validate multiple fields
export function validateFields(fields: Record<string, { value: any; rules: ValidationRules }>, context?: any): ValidationResult {
  const allErrors: string[] = [];
  let isValid = true;

  for (const [fieldName, { value, rules }] of Object.entries(fields)) {
    const result = validateField(value, rules, fieldName, context);
    if (!result.isValid) {
      isValid = false;
      allErrors.push(...result.errors);
    }
  }

  return {
    isValid,
    errors: allErrors
  };
}

// Sanitize input to prevent XSS and other attacks
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .substring(0, 1000); // Limit length
}

// Check for suspicious patterns
export function detectSuspiciousActivity(input: string): boolean {
  const suspiciousPatterns = [
    /(.)\1{10,}/, // Repeated characters (like 'aaaaaaaaaa')
    /[<>]/g, // HTML tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /eval\s*\(/gi, // eval function
    /document\./gi, // DOM manipulation
    /window\./gi, // Window object access
    /alert\s*\(/gi, // Alert function
    /prompt\s*\(/gi, // Prompt function
    /confirm\s*\(/gi, // Confirm function
  ];

  return suspiciousPatterns.some(pattern => pattern.test(input));
}

// Validate request body size
export function validateRequestBodySize(body: string, maxSize: number = 1024 * 1024): ValidationResult {
  const size = new TextEncoder().encode(body).length;
  
  if (size > maxSize) {
    return {
      isValid: false,
      errors: [`Request body is too large. Maximum size is ${maxSize} bytes`]
    };
  }

  return { isValid: true, errors: [] };
}

// Validate JSON structure
export function validateJSONStructure(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];

  if (typeof data !== 'object' || data === null) {
    errors.push('Request body must be a valid JSON object');
    return { isValid: false, errors };
  }

  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
