import { NextResponse } from 'next/server';
import { hashPassword } from '../../../../lib/auth-utils';
import { db } from '../../../../lib/db';
import { createProtectedAPI, securityManager } from '../../../../lib/advanced-security';
import { validateFields, VALIDATION_RULES, sanitizeInput } from '../../../../lib/validation';
import { logSecurityEvent } from '../../../../lib/security-monitor';
import { verifyRecaptchaToken } from '../../../../lib/google-recaptcha';

const registerHandler = async (request: Request, context: any) => {
  try {
    // Use rawBody from context instead of reading request.json() again
    const body = context.rawBody ? JSON.parse(context.rawBody) : await request.json();
    console.log('Register API - Received data:', { 
      email: body.email, 
      username: body.username, 
      hasPassword: !!body.password,
      hasRecaptchaToken: !!body.recaptchaToken,
      formStartTime: body.formStartTime
    });
    
    const { 
      email, 
      username, 
      password, 
      confirmPassword, 
    recaptchaToken,
      formStartTime,
      ...honeypotFields 
    } = body;

    // Verify reCAPTCHA
    if (recaptchaToken) {
      console.log('Register API - Verifying reCAPTCHA...');
      try {
        const recaptchaResult = await verifyRecaptchaToken(recaptchaToken, context.clientIP);
        console.log('Register API - reCAPTCHA result:', recaptchaResult);
        
        if (!recaptchaResult.success) {
          logSecurityEvent(
            'CAPTCHA_FAILED',
            'MEDIUM',
            context.clientIP,
            { type: 'recaptcha', errors: recaptchaResult.errors }
          );
          return NextResponse.json(
            { success: false, message: 'reCAPTCHA verification failed' },
            { status: 400 }
          );
        }
      } catch (recaptchaError) {
        console.error('Register API - reCAPTCHA verification error:', recaptchaError);
        return NextResponse.json(
          { success: false, message: 'reCAPTCHA verification error' },
          { status: 400 }
        );
      }
    } else {
      console.log('Register API - No reCAPTCHA token provided');
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification required' },
        { status: 400 }
      );
    }

    console.log('Register API - reCAPTCHA verification passed, checking honeypot...');

    // Verify honeypot fields (should be empty)
    for (const [fieldName, fieldValue] of Object.entries(honeypotFields)) {
      if (fieldName.startsWith('hp_') && fieldValue && fieldValue.toString().trim() !== '') {
        logSecurityEvent(
          'HONEYPOT_TRIGGERED',
          'HIGH',
          context.clientIP,
          { fieldName, fieldValue: fieldValue.toString().substring(0, 50) }
        );
        return NextResponse.json(
          { success: false, message: 'Invalid form submission' },
          { status: 400 }
        );
      }
    }

    console.log('Register API - Honeypot check passed, validating fields...');

    // Verify form timing (should take at least 2 seconds)
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

    console.log('Register API - Timing check passed, sanitizing inputs...');

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email);
    const sanitizedUsername = sanitizeInput(username);
    const sanitizedPassword = sanitizeInput(password);
    const sanitizedConfirmPassword = sanitizeInput(confirmPassword);

    // Validate all fields
    const validation = validateFields({
      email: { value: sanitizedEmail, rules: VALIDATION_RULES.email },
      username: { value: sanitizedUsername, rules: VALIDATION_RULES.username },
      password: { value: sanitizedPassword, rules: VALIDATION_RULES.password }
    }, { email: sanitizedEmail });

    if (!validation.isValid) {
      console.log('Register API - Validation failed:', validation.errors);
      return NextResponse.json(
        { success: false, message: validation.errors[0] },
        { status: 400 }
      );
    }

    console.log('Register API - Validation passed, checking password match...');

    // Additional validation
    if (sanitizedPassword !== sanitizedConfirmPassword) {
      console.log('Register API - Password mismatch');
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    console.log('Register API - Password match check passed, checking database...');

    // Check if email already exists
    const existingUserByEmail = await db.user.findUnique({
      where: { email: sanitizedEmail }
    });

    if (existingUserByEmail) {
      console.log('Register API - Email already exists');
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 409 }
      );
    }

    // Check if username already exists
    const existingUserByUsername = await db.user.findUnique({
      where: { username: sanitizedUsername }
    });

    if (existingUserByUsername) {
      console.log('Register API - Username already exists');
      return NextResponse.json(
        { success: false, message: 'Username already in use' },
        { status: 409 }
      );
    }

    console.log('Register API - Database checks passed, creating user...');

    // Hash password
    console.log('Register API - Hashing password...');
    const hashedPassword = await hashPassword(sanitizedPassword);
    
    // Create user
    console.log('Register API - Creating user in database...');
    await db.user.create({
      data: {
        email: sanitizedEmail,
        username: sanitizedUsername,
        password: hashedPassword,
        role: 'user'
      }
    });

    console.log('Register API - User created successfully');

    logSecurityEvent(
      'USER_REGISTERED',
      'LOW',
      context.clientIP,
      { 
        email: sanitizedEmail.substring(0, 10) + '...',
        username: sanitizedUsername 
      }
    );

    console.log('Register API - Registration completed successfully');
    return NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    logSecurityEvent(
      'REGISTRATION_ERROR',
      'HIGH',
      context.clientIP,
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
    
    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again later.' },
      { status: 500 }
    );
  }
};

// Export the protected API handler
export const POST = createProtectedAPI(registerHandler, {
  requireCaptcha: true,
  requireHoneypot: true,
  requireTiming: true,
  maxBodySize: 1024 * 1024,
  rateLimitType: 'REGISTRATION',
  allowedMethods: ['POST']
}); 