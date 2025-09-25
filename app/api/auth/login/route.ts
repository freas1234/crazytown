import { NextResponse } from 'next/server';
import { createToken, setAuthCookie, validatePassword } from '../../../../lib/auth-utils';
import { db } from '../../../../lib/db';
import { createProtectedAPI, securityManager } from '../../../../lib/advanced-security';
import { validateFields, VALIDATION_RULES, sanitizeInput } from '../../../../lib/validation';
import { logSecurityEvent } from '../../../../lib/security-monitor';
import { verifyRecaptchaToken } from '../../../../lib/google-recaptcha';

const loginHandler = async (request: Request, context: any) => {
  try {
    // Use rawBody from context instead of reading request.json() again
    const body = context.rawBody ? JSON.parse(context.rawBody) : await request.json();
    
    const { 
      email, 
      password, 
      redirectTo = '/',
      recaptchaToken,
      formStartTime,
      ...honeypotFields 
    } = body;

    // reCAPTCHA verification is handled in frontend before calling this API

    // Verify honeypot fields
    for (const [fieldName, fieldValue] of Object.entries(honeypotFields)) {
      if (fieldName.startsWith('hp_') && fieldValue && fieldValue.toString().trim() !== '') {
        logSecurityEvent(
          'HONEYPOT_TRIGGERED',
          'HIGH',
          context.clientIP,
          { fieldName }
        );
        return NextResponse.json(
          { success: false, message: 'Invalid form submission' },
          { status: 400 }
        );
      }
    }

    // Verify form timing
    if (!formStartTime || (Date.now() - formStartTime) < 2000) {
      logSecurityEvent(
        'TIMING_ATTACK',
        'MEDIUM',
        context.clientIP,
        { formStartTime, elapsed: Date.now() - formStartTime }
      );
      return NextResponse.json(
        { success: false, message: 'Form submitted too quickly' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedPassword = sanitizeInput(password);

    // Validate fields
    const validation = validateFields({
      email: { value: sanitizedEmail, rules: VALIDATION_RULES.email },
      password: { value: sanitizedPassword, rules: { ...VALIDATION_RULES.password, minLength: 1 } }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.errors[0] },
        { status: 400 }
      );
    }
    
    const user = await db.user.findUnique({
      where: { email: sanitizedEmail }
    });
    
    if (!user || !user.password) {
      logSecurityEvent(
        'AUTH_FAILURE',
        'MEDIUM',
        context.clientIP,
        { email: sanitizedEmail.substring(0, 10) + '...', reason: 'user_not_found' }
      );
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isPasswordValid = await validatePassword(sanitizedPassword, user.password);
    if (!isPasswordValid) {
      logSecurityEvent(
        'AUTH_FAILURE',
        'MEDIUM',
        context.clientIP,
        { email: sanitizedEmail.substring(0, 10) + '...', reason: 'invalid_password' }
      );
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = await createToken(user);
    setAuthCookie(token);

    logSecurityEvent(
      'USER_LOGIN',
      'LOW',
      context.clientIP,
      { 
        email: sanitizedEmail.substring(0, 10) + '...',
        username: user.username 
      }
    );

    return NextResponse.json(
      { success: true, redirectTo },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
    logSecurityEvent(
      'LOGIN_ERROR',
      'HIGH',
      context.clientIP,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
};

// Export the protected API handler
export const POST = createProtectedAPI(loginHandler, {
  requireCaptcha: true,
  requireHoneypot: true,
  requireTiming: true,
  maxBodySize: 1024 * 1024,
  rateLimitType: 'LOGIN',
  allowedMethods: ['POST']
}); 