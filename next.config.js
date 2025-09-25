/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'placekitten.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  
  experimental: {
    serverComponentsExternalPackages: [
      'mongodb',
      'mongodb-client-encryption',
      '@mongodb-js/zstd',
      'kerberos',
      'snappy',
      'aws4',
      'socks',
      '@aws-sdk/credential-providers',
      'gcp-metadata',
    ],
  },
  
  env: {
    MONGODB_URI: process.env.MONGODB_URI,
    MONGODB_DB: process.env.MONGODB_DB,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
    PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
    NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID || 'AbvRmBN5wvyJV6ojQ-m9fjdgP0akhmUJZ2FGzP1z9uDH6tHiZ4ZeoN9yNvgG3fKIQyvTaC7f0Vg5ELVx',
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
    RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY,
  },
  
  webpack: (config, { isServer }) => {

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
        dns: false,
        child_process: false,
        'fs/promises': false,
      };
    }
    
    
    if (isServer) {
      config.externals = [
        ...config.externals || [],
        { 
          'mongodb-client-encryption': 'mongodb-client-encryption',
          'kerberos': 'kerberos',
          'aws4': 'aws4',
          'snappy': 'snappy',
          'socks': 'socks',
          '@mongodb-js/zstd': '@mongodb-js/zstd',
          '@aws-sdk/credential-providers': '@aws-sdk/credential-providers',
          'gcp-metadata': 'gcp-metadata',
        }
      ];
    }
    
    config.module.exprContextCritical = false;
    
    return config;
  },
};

module.exports = nextConfig;