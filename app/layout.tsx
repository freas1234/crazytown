import '../styles/globals.css';
import { Providers } from '../components/Providers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  try {
    // For server-side rendering, use absolute URL or fallback to default metadata
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    
    if (!baseUrl) {
      // Return default metadata if no base URL is configured
      return {
        title: 'Wexon store',
        description: 'Official Wexon store',
        keywords: ['store', 'fast', 'server'],
        themeColor: '#000000',
        openGraph: {
          title: 'Wexon store',
          description: 'Official Wexon store',
          images: ['/favicon.svg'],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Wexon store',
          description: 'Official Wexon store',
        },
      };
    }
    
    const response = await fetch(`${baseUrl}/api/content/metadata`, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    const metadata = data.content?.data || {};
    
    return {
      metadataBase: new URL(baseUrl),
      title: metadata.title || 'Wexon store',
      description: metadata.description || 'Official store for Fast server',
      keywords: metadata.keywords?.split(',').map((keyword: string) => keyword.trim()) || [],
      openGraph: {
        title: metadata.ogTitle || metadata.title || 'Wexon store',
        description: metadata.ogDescription || metadata.description || 'Official store for Fast server',
        images: metadata.ogImage ? [metadata.ogImage] : ['/favicon.svg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.ogTitle || metadata.title || 'Wexon store',
        description: metadata.ogDescription || metadata.description || 'Official store for Fast server',
        images: metadata.ogImage ? [metadata.ogImage] : ['/favicon.svg'],
        creator: metadata.twitterHandle || '',
      },
      icons: {
        icon: '/favicon.svg',
      },
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    // Fallback metadata
    return {
      metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
      title: 'Wexon store',
      description: 'Official store for Fast server',
      icons: {
        icon: '/favicon.svg',
      },
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="bg-background min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
} 