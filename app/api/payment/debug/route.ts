import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check environment variables
  const envVars = {
    clientIdExists: !!process.env.PAYPAL_CLIENT_ID,
    clientIdValue: process.env.PAYPAL_CLIENT_ID?.substring(0, 5) + '...',
    clientSecretExists: !!process.env.PAYPAL_CLIENT_SECRET,
    clientSecretValue: process.env.PAYPAL_CLIENT_SECRET?.substring(0, 5) + '...',
    environment: process.env.PAYPAL_ENVIRONMENT || 'not set',
    nodeEnv: process.env.NODE_ENV,
    // Check if using placeholder values
    isClientIdPlaceholder: process.env.PAYPAL_CLIENT_ID === 'sb-client-id',
    isClientSecretPlaceholder: process.env.PAYPAL_CLIENT_SECRET === 'sb-client-secret',
  };
  
  return NextResponse.json({ 
    message: 'Debug info',
    environmentVariables: envVars
  });
} 