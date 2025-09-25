import { NextResponse } from 'next/server';
import { verifyRecaptchaToken } from '../../../../lib/google-recaptcha';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { recaptchaToken, formStartTime } = body;

    if (!recaptchaToken) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA token required' },
        { status: 400 }
      );
    }

    // Verify form timing (should take at least 2 seconds)
    if (!formStartTime || (Date.now() - formStartTime) < 2000) {
      return NextResponse.json(
        { success: false, message: 'Form submitted too quickly' },
        { status: 400 }
      );
    }

    const recaptchaResult = await verifyRecaptchaToken(recaptchaToken);
    
    if (!recaptchaResult.success) {
      return NextResponse.json(
        { success: false, message: 'reCAPTCHA verification failed' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'reCAPTCHA verified' },
      { status: 200 }
    );
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification error' },
      { status: 500 }
    );
  }
}
