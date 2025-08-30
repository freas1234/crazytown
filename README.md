# Crazy Town Store - Next.js 14

This project has been converted from Astro to Next.js 14.

## Conversion Overview

The original Astro project has been migrated to Next.js 14 with the following changes:

- Updated project structure to use the Next.js App Router architecture
- Migrated Astro components to React components
- Converted Astro API routes to Next.js API routes
- Implemented authentication with JWT tokens
- Added middleware for route protection
- Maintained the same styling and functionality

## Getting Started

1. Clone the repository
2. Install dependencies
```bash
npm install
```
3. Set up your environment variables by creating a `.env.local` file:
```
MONGODB_URI=mongodb+srv://a7aa:a7a@cluster0.89t3a9z.mongodb.net/CrazyTowen?retryWrites=true&w=majority
DB_NAME=crazytown
JWT_SECRET=default_jwt_secret_change_this
JWT_EXPIRES_IN=30d

# Discord OAuth
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Or your production URL

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox  # Use 'production' for live payments
```
4. Run the development server
```bash
npm run dev
# or
start-dev.bat
```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Discord Authentication Setup

To enable Discord login, you need to create a Discord application:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "OAuth2" section in the sidebar
4. Add a redirect URL: `http://localhost:3000/api/auth/discord/callback` (for development)
   - For production, add your production URL too: `https://your-domain.com/api/auth/discord/callback`
5. Copy the "Client ID" and "Client Secret" values
6. Paste these values into your `.env.local` file

## PayPal Integration Setup

To enable PayPal payments, you need to set up a PayPal Developer account:

1. Go to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
2. Sign in or create a new account
3. Navigate to "My Apps & Credentials"
4. Under "REST API apps", click "Create App"
5. Give your app a name and select "Merchant" as the app type
6. Once created, you'll see the Client ID and Secret
7. Make sure you're in the right environment (Sandbox for testing, Live for production)

### Setting up PayPal credentials

You can set up PayPal credentials in two ways:

#### Option 1: Using environment variables (recommended for production)

Add the following to your `.env.local` file:
```
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox  # Use 'production' for live payments
```

#### Option 2: Using the config file (easier for development)

Run the provided script to update your PayPal configuration:
```bash
node update-paypal-config.js YOUR_CLIENT_ID YOUR_CLIENT_SECRET sandbox
```

This will create/update the `paypal-config.json` file with your credentials.

### Testing PayPal Integration

For sandbox testing, you can use PayPal's test accounts:

1. In the PayPal Developer Dashboard, go to "Sandbox" > "Accounts"
2. Use the provided test buyer and seller accounts for testing transactions
3. No real money is used in the sandbox environment

## Key Features

- Admin dashboard for managing store content
- User authentication with JWT tokens
- Server rules management
- Job listings and applications
- Product store with checkout
- PayPal payment integration

## Project Structure

- `/src/app`: Next.js App Router pages and API routes
- `/src/components`: React components
- `/src/lib`: Utility functions and services
- `/src/models`: Data models
- `/src/styles`: Global styles
- `/public`: Static assets

## Authentication

The authentication system uses JWT tokens stored in cookies. The middleware ensures that protected routes are only accessible to authenticated users, and admin routes are only accessible to users with admin roles.

## Authentication Types

### Regular Users
- Can login with email/password
- Can change their password, username, and profile details

### Discord Users
- Login via Discord OAuth
- Profile is linked to Discord account
- Username and email managed through Discord (cannot be changed on the site)
- No password management (authentication handled by Discord)

### Admin Users
- Can access the admin panel
- Can manage all site content
- Admin status is set on the user account and works with either authentication method

## License

See the [LICENSE](LICENSE) file for details.
