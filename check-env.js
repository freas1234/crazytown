// Simple script to check if environment variables are loaded correctly
require('dotenv').config({ path: '.env.local' });

console.log('Environment Variables Check:');
console.log('- PAYPAL_CLIENT_ID:', process.env.PAYPAL_CLIENT_ID || 'not set');
console.log('- PAYPAL_CLIENT_SECRET:', process.env.PAYPAL_CLIENT_SECRET ? '[SECRET HIDDEN]' : 'not set');
console.log('- PAYPAL_ENVIRONMENT:', process.env.PAYPAL_ENVIRONMENT || 'not set');
console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');

// Check if using placeholder values
console.log('Using placeholder values:');
console.log('- PAYPAL_CLIENT_ID is placeholder:', process.env.PAYPAL_CLIENT_ID === 'sb-client-id');
console.log('- PAYPAL_CLIENT_SECRET is placeholder:', process.env.PAYPAL_CLIENT_SECRET === 'sb-client-secret'); 