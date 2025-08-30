import paypal from '@paypal/paypal-js';
import fs from 'fs';
import path from 'path';

let clientId: string;
let clientSecret: string;
let environment: string;
let isProduction: boolean;

try {
  const configPath = path.join(process.cwd(), 'paypal-config.json');
  const configData = fs.readFileSync(configPath, 'utf8');
  const config = JSON.parse(configData);
  
  clientId = config.clientId;
  clientSecret = config.clientSecret;
  environment = config.environment || 'production';
  isProduction = environment.toLowerCase() === 'production';
  
  console.log(`PayPal configuration loaded. Environment: ${environment}`);
} catch (error) {
  console.error('Error loading PayPal configuration:', error);

  clientId = process.env.PAYPAL_CLIENT_ID || '';
  clientSecret = process.env.PAYPAL_CLIENT_SECRET || '';
  environment = process.env.PAYPAL_ENVIRONMENT || 'production';
  isProduction = environment.toLowerCase() === 'production';
  
  console.log('Using PayPal configuration from environment variables');
}

export interface CreateOrderRequestBody {
  cart_id: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_amount: {
      currency_code: string;
      value: string;
    };
  }>;
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
      breakdown: {
        item_total: {
          currency_code: string;
          value: string;
        };
        discount?: {
          currency_code: string;
          value: string;
        };
        tax_total?: {
          currency_code: string;
          value: string;
        };
      };
    };
    items: Array<{
      name: string;
      unit_amount: {
        currency_code: string;
        value: string;
      };
      quantity: string;
    }>;
  }>;
}

async function getAccessToken() {
  try {
    if (!clientId || !clientSecret) {
      console.error('PayPal credentials missing.');
      console.error('Please set valid PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env.local file or update paypal-config.json.');
      console.error('Then restart the Next.js server with: npm run dev');
      throw new Error('Payment gateway not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables or update paypal-config.json.');
    }
    
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const url = isProduction
      ? 'https://api-m.paypal.com/v1/oauth2/token'
      : 'https://api-m.sandbox.paypal.com/v1/oauth2/token';

    console.log(`Attempting to get PayPal access token from ${isProduction ? 'production' : 'sandbox'} environment`);
    console.log(`Using client ID: ${clientId.substring(0, 5)}...${clientId.substring(clientId.length - 5)}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'No error details available');
      console.error(`PayPal API error (${response.status} ${response.statusText}):`, errorText);
      throw new Error(`Failed to get access token: ${response.status} ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully obtained PayPal access token');
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    throw error;
  }
}

export async function createOrder(orderData: CreateOrderRequestBody) {
  try {
    const accessToken = await getAccessToken();
    const url = isProduction
      ? 'https://api-m.paypal.com/v2/checkout/orders'
      : 'https://api-m.sandbox.paypal.com/v2/checkout/orders';

    console.log('Creating PayPal order with data:', JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: orderData.purchase_units.map(unit => ({
        ...unit,
        amount: unit.amount
      }))
    }, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: orderData.purchase_units
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error('PayPal API error:', errorData);
      throw new Error(`PayPal API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Successfully created PayPal order:', data.id);
    return {
      success: true,
      orderID: data.id,
      links: data.links,
      ...data
    };
  } catch (err) {
    console.error('Error creating PayPal order:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}

export async function captureOrder(orderID: string) {
  try {
    const accessToken = await getAccessToken();
    const url = isProduction
      ? `https://api-m.paypal.com/v2/checkout/orders/${orderID}/capture`
      : `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderID}/capture`;

    console.log(`Attempting to capture PayPal order: ${orderID}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'No error details available' }));
      console.error('PayPal API error:', errorData);
      throw new Error(`PayPal API error: ${response.status} ${response.statusText}. Details: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    console.log('Successfully captured PayPal order:', data.id);
    return {
      success: true,
      orderID: data.id,
      captureID: data.purchase_units[0]?.payments?.captures[0]?.id,
      ...data
    };
  } catch (err) {
    console.error('Error capturing PayPal order:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err)
    };
  }
}