const fs = require('fs');
const path = require('path');

// Get command line arguments
const clientId = process.argv[2];
const clientSecret = process.argv[3];
const environment = process.argv[4] || 'sandbox';

if (!clientId || !clientSecret) {
  console.error('Usage: node update-paypal-config.js <clientId> <clientSecret> [environment]');
  console.error('Example: node update-paypal-config.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET sandbox');
  process.exit(1);
}

// Create or update the config file
const configPath = path.join(process.cwd(), 'paypal-config.json');
const config = {
  clientId,
  clientSecret,
  environment
};

fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
console.log(`PayPal configuration updated in ${configPath}`);
console.log('Configuration:');
console.log(`- Client ID: ${clientId}`);
console.log(`- Client Secret: ${clientSecret.substring(0, 3)}...${clientSecret.substring(clientSecret.length - 3)}`);
console.log(`- Environment: ${environment}`);
console.log('\nPlease restart your Next.js server for changes to take effect.'); 