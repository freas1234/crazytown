import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    let clientId: string;
    let environment: string;
    
    // Try to load from config file first
    try {
      const configPath = path.join(process.cwd(), 'paypal-config.json');
      const configData = fs.readFileSync(configPath, 'utf8');
      const config = JSON.parse(configData);
      
      clientId = config.clientId;
      environment = config.environment || 'production';
      
      console.log(`PayPal configuration loaded from file. Environment: ${environment}`);
    } catch (error) {
      console.error('Error loading PayPal configuration from file:', error);
      
      // Fall back to environment variables
      clientId = process.env.PAYPAL_CLIENT_ID || '';
      environment = process.env.PAYPAL_ENVIRONMENT || 'production';
      
      console.log('Using PayPal configuration from environment variables');
    }
    
    if (!clientId) {
      return NextResponse.json(
        { error: 'PayPal client ID not configured' },
        { status: 503 }
      );
    }
    
    return NextResponse.json({
      clientId,
      environment
    });
  } catch (error) {
    console.error('Error getting PayPal config:', error);
    return NextResponse.json(
      { error: 'Failed to get PayPal configuration' },
      { status: 500 }
    );
  }
} 