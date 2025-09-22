import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  

  // Only check maintenance mode in production (not during build/development)
  if (process.env.NODE_ENV === 'production') {

    try {
      const maintenanceUrl = new URL('/api/maintenance', request.url);
      const maintenanceResponse = await fetch(maintenanceUrl.toString(), {
        signal: AbortSignal.timeout(5000)
      });
      
      if (maintenanceResponse.ok) {
        const data = await maintenanceResponse.json();
        
        if (data.maintenanceMode && 
            !path.startsWith('/api/') && 
            !path.startsWith('/admin') && 
            path !== '/maintenance' && 
            path !== '/login') {
          
          console.log(`Maintenance mode active, redirecting ${path} to /maintenance`);
          return NextResponse.redirect(new URL('/maintenance', request.url));
        }
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      // Continue with normal flow if maintenance check fails
      // This could happen during build time or if the API is not available
    }
  }

  if (path.startsWith('/admin') || path.startsWith('/profile')) {
    const hasSession = request.cookies.has('next-auth.session-token') || 
                       request.cookies.has('__Secure-next-auth.session-token') ||
                       request.cookies.has('token');
    
    if (!hasSession) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirectTo', path);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)']
} 