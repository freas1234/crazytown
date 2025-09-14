import '../styles/globals.css';
import { Providers } from '../components/Providers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  try {
   
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ''}/api/content/metadata`, {
      next: { revalidate: 3600 } 
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch metadata');
    }
    
    const data = await response.json();
    const metadata = data.content?.data || {};
    
    return {
      title: metadata.title || '𝐅𝐚𝐬𝐭 | 𝐒𝐭𝐨𝐫𝐞',
      description: metadata.description || 'Official store for Fast server',
      keywords: metadata.keywords?.split(',').map((keyword: string) => keyword.trim()) || [],
      themeColor: metadata.themeColor || '#000000',
      openGraph: {
        title: metadata.ogTitle || metadata.title || '𝐅𝐚𝐬𝐭 | 𝐒𝐭𝐨𝐫𝐞',
        description: metadata.ogDescription || metadata.description || 'Official store for Fast server',
        images: metadata.ogImage ? [metadata.ogImage] : ['/favicon.svg'],
      },
      twitter: {
        card: 'summary_large_image',
        title: metadata.ogTitle || metadata.title || '𝐅𝐚𝐬𝐭 | 𝐒𝐭𝐨𝐫𝐞',
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
  
    return {
      title: '𝐅𝐚𝐬𝐭 | 𝐒𝐭𝐨𝐫𝐞',
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