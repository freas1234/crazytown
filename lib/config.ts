/**
 * Application Configuration
 * 
 * This file centralizes all configuration settings for the application.
 * Environment variables should be used for sensitive information in production.
 */

export const BASE_URL = {
  development: process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
    ? `${window.location.protocol}//${window.location.hostname}:3000`
    : 'http://localhost:3000',
  production: 'https://your-production-domain.com',
};


export const AUTH_CONFIG = {
  discord: {
    clientId:  "1385540597133217823",
    clientSecret: "lwARJvskVeeK9k4o7UguaYu42AeREifz",
    redirectUri: 
      (process.env.NODE_ENV === 'production' 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/discord`
        : "http://localhost:3000/api/auth/callback/discord"),
  },
  session: {
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60, 
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-development-jwt-secret",
    maxAge: 30 * 24 * 60 * 60,
  },
};


export const PAYPAL_CONFIG = {
  sandbox: {
    enabled: true, 
    clientId: 'AS-euS30JBDm0-4ymdphJ0bB9AcrmeLszu7e2QB3IEXS1oFg9mcTpTJ1A5VNRUBayVH0u0BMzqZzQR8a',
    clientSecret: 'EL8Om5QsPZ5mvVSH-xbxsM1InKT1c3vrEGgA7AVn3WqT38JN0TLOmfCTE6H2fKxa4hGe9KhXcK0GrPEH',
  },
  production: {
    clientId: 'AS-euS30JBDm0-4ymdphJ0bB9AcrmeLszu7e2QB3IEXS1oFg9mcTpTJ1A5VNRUBayVH0u0BMzqZzQR8a',
    clientSecret: 'EL8Om5QsPZ5mvVSH-xbxsM1InKT1c3vrEGgA7AVn3WqT38JN0TLOmfCTE6H2fKxa4hGe9KhXcK0GrPEH',
  },
  getClientId(): string {
   
    if (this.sandbox.enabled) {
      return process.env.PAYPAL_CLIENT_ID || this.sandbox.clientId;
    }
    return process.env.PAYPAL_CLIENT_ID || this.production.clientId;
  },
  getClientSecret(): string {
            
    if (this.sandbox.enabled) {
      return process.env.PAYPAL_CLIENT_SECRET || this.sandbox.clientSecret;
    }
    return process.env.PAYPAL_CLIENT_SECRET || this.production.clientSecret;
  },
};

export const APP_CONFIG = {
  name: 'Wexon Store',
  description: 'The ultimate gaming experience',
  supportEmail: 'support@wexon-store.com',
  maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
};

export const LANGUAGE_CONFIG = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'ar'],
};

const config = {
  baseUrl: process.env.NODE_ENV === 'production' ? BASE_URL.production : BASE_URL.development,
  auth: AUTH_CONFIG,
  paypal: PAYPAL_CONFIG,
  app: APP_CONFIG,
  language: LANGUAGE_CONFIG,
};
    
export default config; 